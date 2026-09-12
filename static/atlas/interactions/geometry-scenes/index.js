import { circleScenes } from "./circle.js?v=20260913-8c";
import { coordinateScenes } from "./coordinate.js?v=20260913-8c";
import { triangleScenes } from "./triangle.js?v=20260913-8c";
import { trigonometryScenes } from "./trigonometry.js?v=20260913-8c";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes });
