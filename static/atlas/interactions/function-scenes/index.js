import { calculusScenes } from "./calculus.js?v=20260913-8b";
import { exponentialScenes } from "./exponential.js?v=20260913-8b";
import { quadraticScenes } from "./quadratic.js?v=20260913-8b";
import { socialModelScenes } from "./social-models.js?v=20260913-8b";
import { trigonometricScenes } from "./trigonometric.js?v=20260913-8b";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes });
