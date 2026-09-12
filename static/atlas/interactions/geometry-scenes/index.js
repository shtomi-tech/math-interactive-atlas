import { circleScenes } from "./circle.js?v=20260913-8b";
import { coordinateScenes } from "./coordinate.js?v=20260913-8b";
import { triangleScenes } from "./triangle.js?v=20260913-8b";
import { trigonometryScenes } from "./trigonometry.js?v=20260913-8b";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes });
