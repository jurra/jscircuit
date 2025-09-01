import assert from "assert";
import { getImagePath } from "../src/utils/getImagePath.js";

describe("getImagePath (Node version)", () => {
  it("returns a mock path for resistor hover", () => {
    const result = getImagePath("resistor", "hover", { mock: true });
    assert.strictEqual(result, "/assets/R_hover.png");
  });
});

describe("getImagePath", () => {
  it("resolves default image path for resistor", () => {
    const path = getImagePath("resistor", "default", { mock: true });
    assert.ok(path.includes("R.png"));
  });

  it("resolves hover_selected image path for resistor", () => {
    const path = getImagePath("resistor", "hover_selected", { mock: true });
    assert.ok(path.includes("R_hover_selected.png"));
  });

  it("resolves hover image path for capacitor", () => {
    const path = getImagePath("capacitor", "hover", { mock: true });
    assert.ok(path.includes("C_hover.png"));
  });

  it("resolves selected image path for junction", () => {
    const path = getImagePath("junction", "selected", { mock: true });
    assert.ok(path.includes("J_selected.png"));
  });

  it("throws an error for empty type", () => {
    assert.throws(() => getImagePath("", "default", { mock: true }), /Invalid or unknown type/);
  });

  it("throws an error for non-string type", () => {
    assert.throws(() => getImagePath(null, "default", { mock: true }), /Invalid or unknown type/);
    assert.throws(() => getImagePath({}, "default", { mock: true }), /Invalid or unknown type/);
  });

  it("defaults to default variant if none is given", () => {
    const path = getImagePath("ground", undefined, { mock: true });
    assert.ok(path.includes("G.png"));
  });

  it("resolves all image variants for a given type", () => {
    const type = "junction";
    const expectedSuffixes = [
      "J.png",
      "J_hover.png",
      "J_selected.png",
      "J_hover_selected.png",
    ];

    const variants = ["default", "hover", "selected", "hover_selected"];
    const paths = variants.map((v) => getImagePath(type, v, { mock: true }));

    paths.forEach((path, idx) => {
      assert.ok(path.includes(expectedSuffixes[idx]));
    });
  });
});
