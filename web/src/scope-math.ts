import { Parser } from "expr-eval-fork";

const parser = new Parser({
  allowMemberAccess: false,
  operators: {
    assignment: false,
    comparison: true,
    fndef: false,
    in: false,
    logical: true,
  },
});

// PyRPL evaluates formulas over NumPy arrays. The web renderer evaluates one
// sample at a time, so only deterministic element-wise NumPy spellings belong
// in this compatibility layer.
const NUMPY_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bnp\.arctan2\b/g, "atan2"],
  [/\bnp\.arcsin\b/g, "asin"],
  [/\bnp\.arccos\b/g, "acos"],
  [/\bnp\.arctan\b/g, "atan"],
  [/\bnp\.(?:absolute|fabs)\b/g, "abs"],
  [/\bnp\.power\b/g, "pow"],
  [/\bnp\.maximum\b/g, "max"],
  [/\bnp\.minimum\b/g, "min"],
  [/\bnp\.square\b/g, "square"],
  [/\bnp\.clip\b/g, "clip"],
  [/\bnp\.where\b/g, "where"],
  [/\bnp\.heaviside\b/g, "heaviside"],
  [/\bnp\.deg2rad\b/g, "deg2rad"],
  [/\bnp\.rad2deg\b/g, "rad2deg"],
  [/\bnp\.pi\b/g, "PI"],
  [/\bnp\.e\b/g, "E"],
];

for (const name of ["random", "fac", "gamma", "map", "fold", "filter", "indexOf", "join", "sum"]) {
  delete parser.functions[name];
}

parser.functions.square = (value: number): number => value * value;
parser.functions.clip = (value: number, lower: number, upper: number): number =>
  Math.min(Math.max(value, lower), upper);
parser.functions.where = (condition: unknown, whenTrue: number, whenFalse: number): number =>
  condition ? whenTrue : whenFalse;
parser.functions.heaviside = (value: number, atZero = 0.5): number =>
  value < 0 ? 0 : value > 0 ? 1 : atZero;
parser.functions.deg2rad = (value: number): number => value * Math.PI / 180;
parser.functions.rad2deg = (value: number): number => value * 180 / Math.PI;

const ALLOWED_VARIABLES = new Set(["ch1", "ch2", "times"]);

type ScopeVectorName = "ch1" | "ch2" | "times";

// These are the NumPy reductions that retain a useful, unambiguous meaning in
// a sample-wise renderer: a scalar computed over one complete acquired vector
// is broadcast into the rest of the formula.  Deliberately do not accept axes,
// slices, masks, or arbitrary array expressions here; those need a real array
// expression engine rather than a fragile text approximation.
const NUMPY_REDUCTIONS: Readonly<Record<string, (values: ArrayLike<number>) => number>> = {
  mean: (values) => mean(values),
  sum: (values) => sum(values),
  min: (values) => extrema(values, Math.min),
  max: (values) => extrema(values, Math.max),
  ptp: (values) => extrema(values, Math.max) - extrema(values, Math.min),
  var: (values) => variance(values),
  std: (values) => Math.sqrt(variance(values)),
  median: (values) => median(values),
};

const REDUCTION_PATTERN = new RegExp(
  `\\bnp\\.(${Object.keys(NUMPY_REDUCTIONS).join("|")})\\(\\s*(ch1|ch2|times)\\s*\\)`,
  "g",
);

function sum(values: ArrayLike<number>): number {
  let result = 0;
  for (let index = 0; index < values.length; index += 1) result += values[index];
  return result;
}

function mean(values: ArrayLike<number>): number {
  return values.length === 0 ? Number.NaN : sum(values) / values.length;
}

function extrema(values: ArrayLike<number>, compare: (left: number, right: number) => number): number {
  if (values.length === 0) return Number.NaN;
  let result = values[0];
  for (let index = 1; index < values.length; index += 1) result = compare(result, values[index]);
  return result;
}

function variance(values: ArrayLike<number>): number {
  const average = mean(values);
  if (!Number.isFinite(average)) return Number.NaN;
  let squaredError = 0;
  for (let index = 0; index < values.length; index += 1) squaredError += (values[index] - average) ** 2;
  return squaredError / values.length;
}

function median(values: ArrayLike<number>): number {
  if (values.length === 0) return Number.NaN;
  const sorted = Array.from(values).sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function normalizeScopeMathFormula(formula: string): string {
  let normalized = formula.trim().replaceAll("**", "^");
  for (const [pattern, replacement] of NUMPY_ALIASES) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\bnp\./g, "");
}

function substituteNumpyReductions(
  formula: string,
  vectors: Record<ScopeVectorName, ArrayLike<number>>,
): string {
  return formula.replace(REDUCTION_PATTERN, (_match, name: string, vectorName: ScopeVectorName) => {
    const value = NUMPY_REDUCTIONS[name](vectors[vectorName]);
    // Keep a non-finite reduction inside the expression grammar. `NaN` would
    // be parsed as an unapproved variable, while this has NumPy's propagated
    // invalid-result behavior.
    return Number.isFinite(value) ? String(value) : "(0 / 0)";
  });
}

export function evaluateScopeMath(
  formula: string,
  ch1: Float32Array,
  ch2: Float32Array,
  times: Float64Array,
): Float32Array {
  const normalized = normalizeScopeMathFormula(
    substituteNumpyReductions(formula, { ch1, ch2, times }),
  );
  if (!normalized) {
    throw new Error("formula is empty");
  }
  const expression = parser.parse(normalized);
  const unknown = expression.variables().filter((name) => !ALLOWED_VARIABLES.has(name));
  if (unknown.length > 0) {
    throw new Error(`unknown variable ${unknown[0]}`);
  }
  const evaluate = expression.toJSFunction(["ch1", "ch2", "times"]);
  const result = new Float32Array(Math.min(ch1.length, ch2.length, times.length));
  for (let index = 0; index < result.length; index += 1) {
    const value = Number(evaluate(ch1[index], ch2[index], times[index]));
    result[index] = Number.isFinite(value) ? value : Number.NaN;
  }
  return result;
}
