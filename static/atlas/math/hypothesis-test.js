import { binomialProbability, binomialUpperTail } from "./probability.js";

export function coinTestFacts({ n, observedHeads, nullProbability = 0.5 }) {
  const trials = Number(n);
  const observed = Number(observedHeads);
  if (!Number.isInteger(trials) || trials < 0) throw new RangeError("n must be a non-negative integer");
  if (!Number.isInteger(observed) || observed < 0 || observed > trials) throw new RangeError("observedHeads must be between 0 and n");
  const probability = Number(nullProbability);
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new RangeError("nullProbability must be between 0 and 1");
  const distribution = Array.from({ length: trials + 1 }, (_, heads) => ({
    heads,
    probability: binomialProbability(trials, heads, probability),
    inUpperTail: heads >= observed
  }));
  const upperTail = binomialUpperTail(trials, observed, probability);
  return {
    n: trials,
    observedHeads: observed,
    nullProbability: probability,
    distribution,
    upperTail,
    tailProbability: upperTail,
    pValue: upperTail
  };
}
