import { calculusScenes } from "./calculus.js?v=20260913-8c";
import { exponentialScenes } from "./exponential.js?v=20260913-8c";
import { quadraticScenes } from "./quadratic.js?v=20260913-8c";
import { socialModelScenes } from "./social-models.js?v=20260913-8c";
import { trigonometricScenes } from "./trigonometric.js?v=20260913-8c";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes });
