import { circleScenes } from "./circle.js?v=20260912-7k";
import { coordinateScenes } from "./coordinate.js?v=20260912-7k";
import { triangleScenes } from "./triangle.js?v=20260912-7k";
import { trigonometryScenes } from "./trigonometry.js?v=20260912-7k";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes });
