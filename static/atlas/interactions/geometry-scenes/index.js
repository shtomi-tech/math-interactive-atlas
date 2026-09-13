import { circleScenes } from "./circle.js?v=20260913-r8";
import { canonicalScenes } from "./canonical.js?v=20260913-r8";
import { coordinateScenes } from "./coordinate.js?v=20260913-r8";
import { triangleScenes } from "./triangle.js?v=20260913-r8";
import { trigonometryScenes } from "./trigonometry.js?v=20260913-r8";
export const GEOMETRY_SCENES = Object.freeze({ ...triangleScenes, ...trigonometryScenes, ...circleScenes, ...coordinateScenes, ...canonicalScenes });
