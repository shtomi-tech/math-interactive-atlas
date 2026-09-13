import { calculusScenes } from "./calculus.js?v=20260913-r1";
import { exponentialScenes } from "./exponential.js?v=20260913-r1";
import { quadraticScenes } from "./quadratic.js?v=20260913-r1";
import { socialModelScenes } from "./social-models.js?v=20260913-r1";
import { trigonometricScenes } from "./trigonometric.js?v=20260913-r1";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes });
