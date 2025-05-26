import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

export default {
    input: "src/gui/main.js", // Entry point
    output: {
        file: "dist/bundle.js", // Output bundled file
        format: "iife", // Browser-compatible output
        name: "CircuitDesigner", // Global variable name
        sourcemap: true
    },
    preserveEntrySignatures: false, //  Prevent facade chunk warning and code splitting issues
    plugins: [
        terser(), // Minify the output
        copy({
            targets: [
                { src: "assets/*", dest: "dist/assets" }
            ]
        })
    ]
};
