import { calculusScenes } from "./calculus.js?v=20260913-r4";
import { canonicalScenes } from "./canonical.js?v=20260913-r4";
import { exponentialScenes } from "./exponential.js?v=20260913-r4";
import { quadraticScenes } from "./quadratic.js?v=20260913-r4";
import { socialModelScenes } from "./social-models.js?v=20260913-r4";
import { trigonometricScenes } from "./trigonometric.js?v=20260913-r4";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes, ...canonicalScenes });
