function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative integer`);
}

function assertSelectionRange(n, r) {
  assertNonNegativeInteger(n, "n");
  assertNonNegativeInteger(r, "r");
  if (r > n) throw new RangeError("r must not be greater than n");
}

function assertItems(items) {
  if (!Array.isArray(items)) throw new TypeError("items must be an array");
  if (new Set(items).size !== items.length) throw new Error("items must not contain duplicates");
}

export function factorial(n) {
  assertNonNegativeInteger(n, "n");
  let result = 1;
  for (let value = 2; value <= n; value += 1) result *= value;
  return result;
}

export function permutationCount(n, r) {
  assertSelectionRange(n, r);
  let result = 1;
  for (let value = 0; value < r; value += 1) result *= n - value;
  return result;
}

export function combinationCount(n, r) {
  assertSelectionRange(n, r);
  const reducedR = Math.min(r, n - r);
  let result = 1;
  for (let value = 1; value <= reducedR; value += 1) {
    result = (result * (n - reducedR + value)) / value;
  }
  return result;
}

export function enumeratePermutations(items) {
  assertItems(items);
  const result = [];
  const used = new Set();
  const current = [];

  function visit() {
    if (current.length === items.length) {
      result.push([...current]);
      return;
    }
    items.forEach((item, index) => {
      if (used.has(index)) return;
      used.add(index);
      current.push(item);
      visit();
      current.pop();
      used.delete(index);
    });
  }

  visit();
  return result;
}

export function enumerateCombinations(items, r) {
  assertItems(items);
  assertSelectionRange(items.length, r);
  const result = [];
  const current = [];

  function visit(start) {
    if (current.length === r) {
      result.push([...current]);
      return;
    }
    for (let index = start; index <= items.length - (r - current.length); index += 1) {
      current.push(items[index]);
      visit(index + 1);
      current.pop();
    }
  }

  visit(0);
  return result;
}

export function treePaths(stages) {
  if (!Array.isArray(stages) || stages.some((stage) => !Array.isArray(stage) || stage.length === 0)) {
    throw new TypeError("stages must be a list of non-empty arrays");
  }
  const result = [];
  const current = [];

  function visit(stageIndex) {
    if (stageIndex === stages.length) {
      result.push([...current]);
      return;
    }
    stages[stageIndex].forEach((choice) => {
      current.push(choice);
      visit(stageIndex + 1);
      current.pop();
    });
  }

  visit(0);
  return result;
}
