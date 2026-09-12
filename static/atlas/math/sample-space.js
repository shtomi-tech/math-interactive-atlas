export function diceOutcomes() {
  return Array.from({ length: 6 }, (_, first) => Array.from({ length: 6 }, (_, second) => ({ first: first + 1, second: second + 1 })) ).flat();
}

export function outcomesForEvent(event) {
  const outcomes = diceOutcomes();
  return outcomes.filter(({ first, second }) => {
    if (event === "sum-7") return first + second === 7;
    if (event === "sum-8-or-more") return first + second >= 8;
    if (event === "at-least-one-6") return first === 6 || second === 6;
    if (event === "same") return first === second;
    throw new RangeError(`unsupported event: ${event}`);
  });
}

export function probabilityForEvent(event) {
  return outcomesForEvent(event).length / diceOutcomes().length;
}
