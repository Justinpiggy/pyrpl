import { Parser } from "expr-eval-fork";

const parser = new Parser({
  allowMemberAccess: false,
  operators: {
    assignment: false,
    comparison: false,
    fndef: false,
    in: false,
    logical: false,
  },
});
const ALLOWED_VARIABLES = new Set(["ch1", "ch2", "times"]);

export function evaluateScopeMath(
  formula: string,
  ch1: Float32Array,
  ch2: Float32Array,
  times: Float64Array,
): Float32Array {
  const normalized = formula.replace(/\bnp\./g, "").replaceAll("**", "^");
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
