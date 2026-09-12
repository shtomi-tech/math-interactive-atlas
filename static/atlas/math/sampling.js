function validPopulation(population) { return Array.isArray(population) && population.length > 0; }
function randomIndex(rng) { const value = typeof rng === "function" ? Number(rng()) : Math.random(); return Math.min(0.999999999, Math.max(0, Number.isFinite(value) ? value : 0)); }

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
