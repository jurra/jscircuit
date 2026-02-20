/**
 * @file png-loader.mjs
 * @description
 * Node.js custom ESM loader that stubs out .png and .jpg imports.
 *
 * When tests `import` a module that transitively imports a `.png` file
 * (e.g. via assetMap.js), Node would crash with ERR_UNKNOWN_FILE_EXTENSION.
 * This loader intercepts those imports and returns a harmless empty-string
 * default export so the test process can continue.
 *
 * Usage (in package.json test script or mocha config):
 *   --loader ./tests/png-loader.mjs
 */

/**
 * Resolve hook — default behaviour, just pass through.
 */
export async function resolve(specifier, context, nextResolve) {
    return nextResolve(specifier, context);
}

/**
 * Load hook — intercept .png / .jpg files and return a stub module.
 */
export async function load(url, context, nextLoad) {
    if (url.endsWith('.png') || url.endsWith('.jpg')) {
        return {
            format: 'module',
            source: 'export default "";',
            shortCircuit: true,
        };
    }
    return nextLoad(url, context);
}
