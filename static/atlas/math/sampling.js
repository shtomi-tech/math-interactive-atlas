import { confidenceIntervalKnownSigma } from "./statistical-inference.js?v=20260913-8a";

function validPopulation(population) { return Array.isArray(population) && population.length > 0; }
function randomIndex(rng) { const value = typeof rng === "function" ? Number(rng()) : Math.random(); return Math.min(0.999999999, Math.max(0, Number.isFinite(value) ? value : 0)); }

export function sampleStandardNormal(rng = Math.random) {
  // Box-Muller: U=0 is invalid for log(), so keep both uniforms open at 0.
  const first = Math.max(Number.EPSILON, randomIndex(rng));
  const second = Math.max(Number.EPSILON, randomIndex(rng));
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

export function sampleNormal({ mean = 0, sd = 1, rng = Math.random } = {}) {
  const center = Number(mean); const spread = Number(sd);
  if (!Number.isFinite(center) || !Number.isFinite(spread) || spread < 0) return null;
  return center + spread * sampleStandardNormal(rng);
}

export function sampleMeanFromNormalPopulation({ populationMean, populationSd, sampleSize, rng = Math.random } = {}) {
  const center = Number(populationMean); const spread = Number(populationSd); const size = Number(sampleSize);
  if (!Number.isFinite(center) || !Number.isFinite(spread) || spread < 0 || !Number.isInteger(size) || size < 1) return null;
  return sampleNormal({ mean: center, sd: spread / Math.sqrt(size), rng });
}

export function sampleWithReplacement(population, n, rng = Math.random) {
  const size = Number(n); if (!validPopulation(population) || !Number.isInteger(size) || size < 0) return [];
  return Array.from({ length: size }, () => population[Math.floor(randomIndex(rng) * population.length)]);
}

export function sampleWithoutReplacement(population, n, rng = Math.random) {
  const size = Number(n); if (!validPopulation(population) || !Number.isInteger(size) || size < 0 || size > population.length) return [];
  const remaining = [...population]; const result = [];
  while (result.length < size) result.push(remaining.splice(Math.floor(randomIndex(rng) * remaining.length), 1)[0]);
  return result;
}

export function sampleMean(values) { return Array.isArray(values) && values.length > 0 && values.every((value) => Number.isFinite(Number(value))) ? values.reduce((sum, value) => sum + Number(value), 0) / values.length : null; }

export function simulateSampleMeans({ population, sampleSize, trials, rng = Math.random } = {}) {
  const size = Number(sampleSize); const count = Number(trials);
  if (!validPopulation(population) || !Number.isInteger(size) || size < 1 || !Number.isInteger(count) || count < 0) return [];
  return Array.from({ length: count }, () => sampleMean(sampleWithReplacement(population, size, rng)));
}

export function simulateKnownSigmaConfidenceIntervals({ populationMean, populationSd, sampleSize, confidence, trials, rng = Math.random } = {}) {
  const center = Number(populationMean); const spread = Number(populationSd); const size = Number(sampleSize); const count = Number(trials);
  if (!Number.isFinite(center) || !Number.isFinite(spread) || spread < 0 || !Number.isInteger(size) || size < 1 || !Number.isInteger(count) || count < 0) return [];
  return Array.from({ length: count }, () => {
    const sampleMeanValue = sampleMeanFromNormalPopulation({ populationMean: center, populationSd: spread, sampleSize: size, rng });
    const interval = confidenceIntervalKnownSigma({ sampleMean: sampleMeanValue, populationSd: spread, sampleSize: size, confidence });
    if (!interval) return null;
    return { ...interval, sampleMean: sampleMeanValue, containsPopulationMean: interval.lower <= center && center <= interval.upper };
  }).filter(Boolean);
}
