// AddElementCommand.js
import { GUICommand } from "./GUICommand.js";
import { Position } from "../../domain/valueObjects/Position.js";
/**
 *
 * @param {CircuitService} circuitService - The circuit service to use.
 * @param {CircuitRenderer} circuitRenderer - The circuit renderer to use.
 * @param {ElementRegistry} elementRegistry - The element registry to use.
 * @param {string} elementType - The element type
 *
 * return {AddElementCommand}
 */
export class AddElementCommand extends GUICommand {
  constructor(circuitService, circuitRenderer, elementRegistry, elementType) {
    super();
    this.circuitService = circuitService;
    this.circuitRenderer = circuitRenderer;
    this.elementRegistry = elementRegistry;
    this.elementType = elementType;

    // Defaults for positioning (in logical coordinates)
    this.DEFAULT_X = 400;
    this.DEFAULT_Y = 300;
    this.ELEMENT_WIDTH = 50; // This should not be a constant because element sizes might differ.

    // Snapping configuration (assumed to be provided from UI, e.g., via GUIAdapter)
    this.enableSnapping = true; // Optionally turn snapping on/off
    this.gridSpacing = 10; // Grid spacing in logical coordinates
  }

  /**
   * Executes the command, snapping the primary node (first node) to the nearest grid point.
   * All other nodes are adjusted relative to the snapped primary node.
   * @param {Array} nodes - An array of objects with {x, y} coordinates.
   */
  execute(nodes = null) {
    console.log(`Executing AddElementCommand for: ${this.elementType}`);

    const factory = this.elementRegistry.get(this.elementType);
    if (!factory) {
      console.error(
        `Factory function for element type "${this.elementType}" not found.`,
      );
      return;
    }

    // Use default positions if none provided.
    if (!nodes || !Array.isArray(nodes) || nodes.length !== 2) {
      nodes = [
        { x: this.DEFAULT_X - this.ELEMENT_WIDTH / 2, y: this.DEFAULT_Y },
        { x: this.DEFAULT_X + this.ELEMENT_WIDTH / 2, y: this.DEFAULT_Y },
      ];
    }

    // If snapping is enabled, adjust the nodes so that the primary node is snapped.
    let finalNodes = nodes;
    if (this.enableSnapping) {
      // Adjust all nodes by the same offset.
      finalNodes = nodes.map(n => ({
        x: Math.round(n.x / this.gridSpacing) * this.gridSpacing,
        y: Math.round(n.y / this.gridSpacing) * this.gridSpacing
      }));
    }

    // Create new Position instances from finalNodes.
    const positions = finalNodes.map((pt) => new Position(pt.x, pt.y));

    // Create the element via the factory.
    const element = factory(undefined, positions, null, {});
    console.log("Element created with snapped nodes:", element);

    // Add the element to the circuit.
    this.circuitService.addElement(element);
    this.circuitService.emit("update", { type: "addElement", element });

    if (this.circuitRenderer) {
      this.circuitRenderer.render();
    }
  }

  bind() {
    const button = document.getElementById(`add${this.elementType}`);
    if (!button) {
      console.warn(`Button for adding ${this.elementType} not found.`);
      return;
    }
    button.addEventListener("click", () => this.execute());
    console.log(`Bound AddElementCommand to add${this.elementType}`);
  }
}
