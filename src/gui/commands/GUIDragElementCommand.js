import { GUICommand } from "./GUICommand.js";
import { Position } from "../../domain/valueObjects/Position.js";

export class DragElementCommand extends GUICommand {
    constructor(circuitService) {
        super();
        this.circuitService = circuitService;
        this.draggedElement = null;
        this.offset = { x: 0, y: 0 };
    }

    start(x, y) {
        for (const element of this.circuitService.getElements()) {
            if (this.isInsideElement(x, y, element)) {
                this.draggedElement = element;
                const [start] = element.nodes;
                this.offset.x = x - start.x;
                this.offset.y = y - start.y;
                return;
            }
        }
    }

    move(x, y) {
        if (this.draggedElement) {
            const dx = x - this.offset.x;
            const dy = y - this.offset.y;

            // Maintain relative positioning of all nodes
            const firstNode = this.draggedElement.nodes[0]; // Reference node
            const deltaX = dx - firstNode.x; // Compute offset
            const deltaY = dy - firstNode.y;

            this.draggedElement.nodes = this.draggedElement.nodes.map((node) =>
                new Position(node.x + deltaX, node.y + deltaY) // ✅ Move each node while keeping relative distance
            );

            //  Notify UI to update
            this.circuitService.emit("update", { type: "moveElement", element: this.draggedElement });
        }
    }

    stop() {
        this.draggedElement = null;
    }

    isInsideElement(x, y, element) {
        const [start] = element.nodes;
        return (
            x >= start.x &&
            x <= start.x + 50 &&
            y >= start.y &&
            y <= start.y + 50
        );
    }
}