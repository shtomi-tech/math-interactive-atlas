import { circleScenes } from "./circle.js?v=20260913-8a";
import { coordinateScenes } from "./coordinate.js?v=20260913-8a";
import { triangleScenes } from "./triangle.js?v=20260913-8a";
import { trigonometryScenes } from "./trigonometry.js?v=20260913-8a";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes });
