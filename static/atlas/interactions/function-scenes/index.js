import { calculusScenes } from "./calculus.js?v=20260912-7k";
import { exponentialScenes } from "./exponential.js?v=20260912-7k";
import { quadraticScenes } from "./quadratic.js?v=20260912-7k";
import { socialModelScenes } from "./social-models.js?v=20260912-7k";
import { trigonometricScenes } from "./trigonometric.js?v=20260912-7k";
export const FUNCTION_GRAPH_SCENES = Object.freeze({ ...quadraticScenes, ...exponentialScenes, ...trigonometricScenes, ...calculusScenes, ...socialModelScenes });
