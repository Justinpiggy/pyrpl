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

function normalizeScopeMathFormula(formula: string): string {
  let normalized = formula.trim().replaceAll("**", "^");
  for (const [pattern, replacement] of NUMPY_ALIASES) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\bnp\./g, "");
}

export function evaluateScopeMath(
  formula: string,
  ch1: Float32Array,
  ch2: Float32Array,
  times: Float64Array,
): Float32Array {
  const normalized = normalizeScopeMathFormula(formula);
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
