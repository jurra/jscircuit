// GUIDragElementCommand.js
import { GUICommand } from "./GUICommand.js";
import { Position } from "../../domain/valueObjects/Position.js";

export class DragElementCommand extends GUICommand {
  constructor(circuitService) {
    super();
    this.circuitService = circuitService;
    this.draggedElement = null;
    this.offset = { x: 0, y: 0 };

    // New: Snapping settings (could be set externally)
    this.enableSnapping = true;  // default: true
    this.gridSpacing = 10;       // the value is pixels
  }

  /**
   * Called on mousedown to check if the user clicked on an element.
   * If so, prepare for dragging that element.
   */
  start(mouseX, mouseY) {
    for (const element of this.circuitService.getElements()) {
      if (this.isInsideElement(mouseX, mouseY, element)) {
        this.draggedElement = element;

        // We'll measure offset from the first node
        const [startNode] = element.nodes;
        this.offset.x = mouseX - startNode.x;
        this.offset.y = mouseY - startNode.y;
        return;
      }
    }
  }

  /**
   * Called repeatedly during mousemove, updating the element's position.
   */
  move(mouseX, mouseY) {
    if (!this.draggedElement) return;

    // 1) Compute the intended new "top-left" or first-node position
    let intendedX = mouseX - this.offset.x;
    let intendedY = mouseY - this.offset.y;

    // 2) If snapping is enabled, round to nearest grid spacing
    if (this.enableSnapping) {
      intendedX = Math.round(intendedX / this.gridSpacing) * this.gridSpacing;
      intendedY = Math.round(intendedY / this.gridSpacing) * this.gridSpacing;
    }

    // 3) Determine how far the first node must move
    const firstNode = this.draggedElement.nodes[0];
    const deltaX = intendedX - firstNode.x;
    const deltaY = intendedY - firstNode.y;

    // 4) Update *all* nodes by the same delta
    this.draggedElement.nodes = this.draggedElement.nodes.map((node) =>
      new Position(node.x + deltaX, node.y + deltaY)
    );

    // 5) Notify the UI that the element has moved
    this.circuitService.emit("update", {
      type: "moveElement",
      element: this.draggedElement
    });
  }

  /**
   * Called on mouseup to end the drag operation.
   */
  stop() {
    this.draggedElement = null;
  }

  /**
   * Helper method to check if the user clicked near the "line" of an element.
   * This is the same logic you already had, expanded for clarity.
   */
  isInsideElement(x, y, element) {
    const auraSize = 10; // Expand clickable area beyond the exact line
    if (element.nodes.length < 2) return false;

    const [start, end] = element.nodes;
    const lineLength = Math.hypot(end.x - start.x, end.y - start.y);

    const distance =
      Math.abs(
        (end.y - start.y) * x -
          (end.x - start.x) * y +
          end.x * start.y -
          end.y * start.x,
      ) / lineLength;

    return distance <= auraSize;
  }
}
