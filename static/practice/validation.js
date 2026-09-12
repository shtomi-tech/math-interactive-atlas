const REQUIRED_FIELDS = ["id", "subject", "unit", "atlasContentId", "title", "type", "prompt", "answer", "explanation", "difficulty"];
const ALLOWED_TYPES = new Set(["single-choice", "numeric"]);

function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0; }

export function validateProblem(problem, contentById = new Map()) {
  const errors = [];
  if (!problem || typeof problem !== "object" || Array.isArray(problem)) return ["problem must be an object"];
  REQUIRED_FIELDS.forEach((field) => { if (!(field in problem)) errors.push(`${problem.id || "(unknown)"} missing ${field}`); });
  if (!nonEmpty(problem.id)) errors.push("problem id must be non-empty");
  if (!ALLOWED_TYPES.has(problem.type)) errors.push(`${problem.id || "(unknown)"} has unsupported type`);
  if (!nonEmpty(problem.title) || !nonEmpty(problem.prompt) || !nonEmpty(problem.explanation)) errors.push(`${problem.id || "(unknown)"} title/prompt/explanation must be non-empty`);
  if (!Number.isInteger(problem.difficulty) || problem.difficulty < 1 || problem.difficulty > 3) errors.push(`${problem.id || "(unknown)"} difficulty must be 1-3`);
  const content = contentById.get(problem.atlasContentId);
  if (!content) errors.push(`${problem.id || "(unknown)"} atlasContentId does not exist: ${problem.atlasContentId}`);
  else if (problem.subject !== content.subject || problem.unit !== content.unit) errors.push(`${problem.id} subject/unit does not match atlas content`);
  if (problem.type === "single-choice") {
    if (!Array.isArray(problem.choices) || problem.choices.length < 2) errors.push(`${problem.id} needs at least two choices`);
    else {
      const choiceIds = problem.choices.map((choice) => choice?.id);
      if (choiceIds.some((id) => !nonEmpty(id)) || new Set(choiceIds).size !== choiceIds.length) errors.push(`${problem.id} choice ids must be unique and non-empty`);
      if (problem.choices.some((choice) => !nonEmpty(choice?.text))) errors.push(`${problem.id} choice text must be non-empty`);
      if (!choiceIds.includes(problem.answer?.choiceId)) errors.push(`${problem.id} answer.choiceId does not exist`);
    }
  }
  if (problem.type === "numeric" && (!Number.isFinite(problem.answer?.value) || !Number.isFinite(problem.answer?.tolerance) || problem.answer.tolerance < 0)) errors.push(`${problem.id} numeric answer needs finite value and non-negative tolerance`);
  return errors;
}

export function validateProblemData(problems, contents = []) {
  const errors = [];
  if (!Array.isArray(problems)) return ["problem data must be an array"];
  const contentById = new Map(contents.map((content) => [content.id, content]));
  const ids = new Set();
  problems.forEach((problem) => { if (ids.has(problem?.id)) errors.push(`duplicate problem id: ${problem.id}`); ids.add(problem?.id); errors.push(...validateProblem(problem, contentById)); });
  return errors;
}
