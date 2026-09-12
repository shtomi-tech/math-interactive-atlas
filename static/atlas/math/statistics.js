function numericValues(values) {
  if (!Array.isArray(values) || values.length === 0) throw new TypeError("values must be a non-empty array");
  const numbers = values.map(Number);
  if (numbers.some((value) => !Number.isFinite(value))) throw new TypeError("values must contain only finite numbers");
  return numbers;
}

function sortedValues(values) {
  return numericValues(values).sort((left, right) => left - right);
}

export function mean(values) {
  const numbers = numericValues(values);
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

export function median(values) {
  const numbers = sortedValues(values);
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0 ? (numbers[middle - 1] + numbers[middle]) / 2 : numbers[middle];
}

// This is the population variance used in Japanese high-school Mathematics I:
// V = (1 / n) * sum((xi - x-bar)^2), not the unbiased 1 / (n - 1) estimate.
export function variance(values) {
  const numbers = numericValues(values);
  const center = mean(numbers);
  return numbers.reduce((total, value) => total + (value - center) ** 2, 0) / numbers.length;
}

export const populationVariance = variance;

export function standardDeviation(values) {
  return Math.sqrt(variance(values));
}

// Quartiles follow this project's Japanese high-school convention:
// Q2 is the median; for odd n, exclude Q2 before taking the two half medians.
export function quartiles(values) {
  const numbers = sortedValues(values);
  const middle = Math.floor(numbers.length / 2);
  const q2 = median(numbers);
  if (numbers.length === 1) return { q1: numbers[0], q2, q3: numbers[0] };
  const lower = numbers.slice(0, middle);
  const upper = numbers.slice(numbers.length % 2 === 0 ? middle : middle + 1);
  return { q1: median(lower), q2, q3: median(upper) };
}

function pairedValues(xs, ys) {
  const xValues = numericValues(xs);
  const yValues = numericValues(ys);
  if (xValues.length !== yValues.length) throw new RangeError("xs and ys must have the same length");
  return [xValues, yValues];
}

export function covariance(xs, ys) {
  const [xValues, yValues] = pairedValues(xs, ys);
  const xCenter = mean(xValues);
  const yCenter = mean(yValues);
  return xValues.reduce((total, value, index) => total + (value - xCenter) * (yValues[index] - yCenter), 0) / xValues.length;
}

export function correlationCoefficient(xs, ys) {
  const [xValues, yValues] = pairedValues(xs, ys);
  const xCenter = mean(xValues);
  const yCenter = mean(yValues);
  let numerator = 0;
  let xSquared = 0;
  let ySquared = 0;
  xValues.forEach((value, index) => {
    const xDistance = value - xCenter;
    const yDistance = yValues[index] - yCenter;
    numerator += xDistance * yDistance;
    xSquared += xDistance ** 2;
    ySquared += yDistance ** 2;
  });
  if (xSquared === 0 || ySquared === 0) return null;
  return numerator / Math.sqrt(xSquared * ySquared);
}
