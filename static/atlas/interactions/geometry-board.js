import { GEOMETRY_SCENES } from "./geometry-scenes/index.js?v=20260913-r8";
import { mountWithContext } from "./geometry-scenes/common.js?v=20260913-r8";

export const GEOMETRY_MODES = Object.freeze(Object.keys(GEOMETRY_SCENES));

export function mountGeometryBoard(container, config = {}) {
  return mountWithContext(container, config, GEOMETRY_SCENES);
}
