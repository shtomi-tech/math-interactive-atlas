import { combinationCount } from "./combinatorics.js?v=20260912-7i";

function probabilityValue(p) {
  const value = Number(p);
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError("p must be between 0 and 1");
  return value;
}

function nonNegativeInteger(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new RangeError(`${name} must be a non-negative integer`);
  return number;
}

function binomialArguments(n, k, p) {
  const trials = nonNegativeInteger(n, "n");
  const successes = nonNegativeInteger(k, "k");
  if (successes > trials) throw new RangeError("k must not be greater than n");
  return [trials, successes, probabilityValue(p)];
}

export function binomialCoefficient(n, k) {
  const trials = nonNegativeInteger(n, "n");
  const successes = nonNegativeInteger(k, "k");
  if (successes > trials) throw new RangeError("k must not be greater than n");
  return combinationCount(trials, successes);
}

export function binomialProbability(n, k, p) {
  const [trials, successes, probability] = binomialArguments(n, k, p);
  return binomialCoefficient(trials, successes) * probability ** successes * (1 - probability) ** (trials - successes);
}

export function binomialUpperTail(n, k, p) {
  const [trials, successes, probability] = binomialArguments(n, k, p);
  let total = 0;
  for (let heads = successes; heads <= trials; heads += 1) {
    total += binomialProbability(trials, heads, probability);
  }
  return total;
}

export function binomialDistribution(n, p) {
  const trials = nonNegativeInteger(n, "n");
  const probability = probabilityValue(p);
  return Array.from({ length: trials + 1 }, (_, k) => ({
    k,
    probability: binomialProbability(trials, k, probability)
  }));
}
