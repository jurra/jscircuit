/**
 * @file getImagePath.js
 * @description
 * Resolves image path for circuit element icons based on type and UI variant.
 *
 * In **bundled** mode the images are resolved from a static asset map that
 * esbuild inlines as Base64 data-URLs — no external `/assets/` folder needed.
 *
 * In **test / Node** mode (when `mock: true`) a plain path string is returned
 * so unit tests keep working without a bundler.
 *
 * @example
 * getImagePath("resistor")                         // → data:image/png;base64,…
 * getImagePath("resistor", "hover")               // → data:image/png;base64,…
 * getImagePath("resistor", "hover", { mock: true }) // → /assets/R_hover.png
 */

import { ElementRegistry } from '../domain/factories/ElementRegistry.js';
import { ASSET_MAP } from './assetMap.js';

/**
 * Map a registered element type to its single-letter image prefix.
 * @param {string} type
 * @returns {string}
 */
function prefixForType(type) {
    const registeredTypes = ElementRegistry.getTypes();
    const typeMap = {};

    registeredTypes.forEach(registeredType => {
        let prefix;
        switch (registeredType.toLowerCase()) {
            case 'inductor':
                prefix = 'L';
                break;
            default:
                prefix = registeredType.charAt(0).toUpperCase();
        }
        typeMap[registeredType.toLowerCase()] = prefix;
    });

    return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase();
}

/**
 * Resolves image path based on circuit element type and optional UI variant.
 *
 * @param {string} type - Element type (e.g., "resistor", "capacitor").
 * @param {string} [variant="default"] - UI variant: "default", "hover", "selected", "hover_selected".
 * @param {Object} [options]
 * @param {boolean} [options.mock=false] - If true, returns a simplified mock path (for tests).
 * @returns {string|Promise<string>} Resolved data-URL or path string.
 */
export async function getImagePath(type, variant = "default", { mock = false } = {}) {
    if (!type || typeof type !== "string") {
        throw new Error("Invalid or unknown type");
    }

    const base = prefixForType(type);
    const suffix = variant === "default" ? "" : `_${variant}`;
    const filename = `${base}${suffix}.png`;

    // Mock path for test environments
    if (mock) {
        return `/assets/${filename}`;
    }

    // ── Bundled asset lookup ──────────────────────────────────────
    const entry = ASSET_MAP[base];
    if (entry) {
        const dataUrl = entry[variant];
        if (dataUrl) {
            return dataUrl;
        }
    }

    // ── Fallback: runtime URL (dev-server / unbundled) ──────────
    return `/assets/${filename}`;
}
