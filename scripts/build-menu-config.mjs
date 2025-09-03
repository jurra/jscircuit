import fs from "node:fs";
import { parse } from "yaml";

const src = "src/config/menu.config.yaml";
const dst = "dist/static/menu.config.json";

const yamlText = fs.readFileSync(src, "utf8");
const obj = parse(yamlText);
fs.writeFileSync(dst, JSON.stringify(obj, null, 2));
console.log(`✓ Wrote ${dst}`);
