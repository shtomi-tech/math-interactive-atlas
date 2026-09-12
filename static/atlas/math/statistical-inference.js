const CRITICAL_VALUES = Object.freeze({ 0.9: 1.64485362695147, 0.95: 1.95996398454005, 0.99: 2.5758293035489 });

function distribution(values, probabilities) {
  if (!Array.isArray(values) || !Array.isArray(probabilities) || values.length === 0 || values.length !== probabilities.length) return null;
  const xs = values.map(Number); const ps = probabilities.map(Number);
  if (xs.some((value) => !Number.isFinite(value)) || ps.some((value) => !Number.isFinite(value) || value < 0) || Math.abs(ps.reduce((sum, value) => sum + value, 0) - 1) > 1e-10) return null;
  return { values: xs, probabilities: ps };
}

export function validateDistribution(values, probabilities) { return Boolean(distribution(values, probabilities)); }
export function expectedValue(values, probabilities) { const current = distribution(values, probabilities); return current ? current.values.reduce((sum, value, index) => sum + value * current.probabilities[index], 0) : null; }
export function distributionVariance(values, probabilities) { const current = distribution(values, probabilities); const average = expectedValue(values, probabilities); return current && average !== null ? current.values.reduce((sum, value, index) => sum + (value - average) ** 2 * current.probabilities[index], 0) : null; }
export function distributionStandardDeviation(values, probabilities) { const value = distributionVariance(values, probabilities); return value === null ? null : Math.sqrt(value); }

export function normalPdf(x, mean = 0, sd = 1) { const value = Number(x); const center = Number(mean); const spread = Number(sd); return Number.isFinite(value) && Number.isFinite(center) && Number.isFinite(spread) && spread > 0 ? Math.exp(-0.5 * ((value - center) / spread) ** 2) / (spread * Math.sqrt(2 * Math.PI)) : null; }

export function normalCdf(x, mean = 0, sd = 1) {
  const value = Number(x); const center = Number(mean); const spread = Number(sd);
  if (!Number.isFinite(value) || !Number.isFinite(center) || !Number.isFinite(spread) || spread <= 0) return null;
  const z = (value - center) / (spread * Math.sqrt(2));
  const sign = z < 0 ? -1 : 1; const absolute = Math.abs(z); const t = 1 / (1 + 0.3275911 * absolute);
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  const erf = sign * (1 - polynomial * Math.exp(-(absolute ** 2)));
  return 0.5 * (1 + erf);
}

export function standardize(x, mean, sd) { const value = [x, mean, sd].map(Number); return value.every(Number.isFinite) && value[2] > 0 ? (value[0] - value[1]) / value[2] : null; }
export function sampleMeanStandardError(populationSd, sampleSize) { const spread = Number(populationSd); const size = Number(sampleSize); return Number.isFinite(spread) && spread >= 0 && Number.isInteger(size) && size > 0 ? spread / Math.sqrt(size) : null; }

export function confidenceIntervalKnownSigma({ sampleMean, populationSd, sampleSize, confidence = 0.95 } = {}) {
  const average = Number(sampleMean); const spread = Number(populationSd); const size = Number(sampleSize); const level = Number(confidence); const critical = CRITICAL_VALUES[level]; const standardError = sampleMeanStandardError(spread, size);
  if (!Number.isFinite(average) || standardError === null || !critical) return null;
  const margin = critical * standardError;
  return { confidence: level, critical, standardError, margin, lower: average - margin, upper: average + margin };
}

export function zTestMean({ sampleMean, nullMean, populationSd, sampleSize, alternative = "two-sided" } = {}) {
  const z = standardize(sampleMean, nullMean, sampleMeanStandardError(populationSd, sampleSize));
  if (z === null || !["two-sided", "greater", "less"].includes(alternative)) return null;
  const left = normalCdf(z); const pValue = alternative === "greater" ? 1 - left : alternative === "less" ? left : 2 * Math.min(left, 1 - left);
  return { z, pValue, alternative };
}

export { CRITICAL_VALUES };
