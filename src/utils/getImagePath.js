/**
 * @file getImagePath.js
 * @description
 * Resolves image path for circuit element icons based on type and UI variant.
 * Compatible with both browser (using import.meta.url) and Node test environments (via `mock` flag).
 *
 * @example
 * getImagePath("resistor")                 // → file:///.../R.png
 * getImagePath("resistor", "hover")       // → file:///.../R_hover.png
 * getImagePath("resistor", "hover", { mock: true }) // → /assets/R_hover.png
 */

/**
 * Resolves image path based on circuit element type and optional UI variant.
 *
 * @param {string} type - Element type (e.g., "resistor", "capacitor").
 * @param {string} [variant="default"] - UI variant (e.g., "hover", "selected").
 * @param {Object} [options]
 * @param {boolean} [options.mock=false] - If true, returns a simplified mock path for test environments.
 * @returns {string} Path to the asset (absolute in browser, mock in Node).
 */
export function getImagePath(type, variant = "default", { mock = false } = {}) {
  if (!type || typeof type !== "string") {
    throw new Error("Invalid or unknown type");
  }

  const base = type.charAt(0).toUpperCase();
  const suffix = variant === "default" ? "" : `_${variant}`;
  const path = `/assets/${base}${suffix}.png`;

  return mock ? path : new URL(path, import.meta.url).href;
}
