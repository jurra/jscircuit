// src/application/WireSplitService.js
import { Position } from "../domain/valueObjects/Position.js";

/**
 * WireSplitService is responsible for splitting wires at a given node.
 * It checks if the node lies on a wire segment and splits the wire into two segments.
 * 
 */
export class WireSplitService {
  constructor(circuitService, elementRegistry) {
    this.circuitService = circuitService;
    this.elementRegistry = elementRegistry;
  }

  trySplitAtNode(node) {
    for (const element of this.circuitService.getElements()) {
      if (element.type !== "wire") continue;

      const [start, end] = element.nodes;
      if (this._isOnSegment(node, start, end) && !node.equals(start) && !node.equals(end)) {
        this.circuitService.deleteElement(element.id);

        const wireFactory = this.elementRegistry.get("Wire");
        const wire1 = wireFactory(undefined, [start, node], null, {});
        const wire2 = wireFactory(undefined, [node, end], null, {});

        this.circuitService.addElement(wire1);
        this.circuitService.addElement(wire2);

        return true;
      }
    }
    return false;
  }

  _isOnSegment(p, a, b) {
    const cross = (b.y - a.y) * (p.x - a.x) - (b.x - a.x) * (p.y - a.y);
    if (Math.abs(cross) > 1e-6) return false;

    const dot = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
    const lenSq = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    return dot > 0 && dot < lenSq;
  }
}
