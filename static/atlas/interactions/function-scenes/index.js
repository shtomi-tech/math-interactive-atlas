import { calculusScenes } from "./calculus.js?v=20260913-8a";
import { exponentialScenes } from "./exponential.js?v=20260913-8a";
import { quadraticScenes } from "./quadratic.js?v=20260913-8a";
import { socialModelScenes } from "./social-models.js?v=20260913-8a";
import { trigonometricScenes } from "./trigonometric.js?v=20260913-8a";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes });
