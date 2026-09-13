import { circleScenes } from "./circle.js?v=20260913-r1";
import { coordinateScenes } from "./coordinate.js?v=20260913-r1";
import { triangleScenes } from "./triangle.js?v=20260913-r1";
import { trigonometryScenes } from "./trigonometry.js?v=20260913-r1";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes });
