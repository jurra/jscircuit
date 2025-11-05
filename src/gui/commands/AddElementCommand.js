import { GUICommand } from "./GUICommand.js";
import { Position } from "../../domain/valueObjects/Position.js";
import { ElementFactory } from "../../domain/factories/ElementFactory.js";
import { Properties } from "../../domain/valueObjects/Properties.js";
import { GRID_CONFIG } from "../../config/gridConfig.js";

/**
 * Command to add an element to the circuit with proper grid-based sizing
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
    
    // Store current mouse position for placement mode
    this.currentMousePosition = null;
  }
  
  /**
   * Set the current mouse position for placement
   * @param {Object} mousePosition - Object with x and y coordinates
   */
  setMousePosition(mousePosition) {
    this.currentMousePosition = mousePosition;
  }

  /**
   * Executes the command, creating an element with proper grid-based sizing.
   * For 2-node components, creates nodes that span exactly 5 grid spaces (50 pixels).
   */
  execute() {
    // Determine center position for the component
    let centerX, centerY;
    
    if (this.currentMousePosition) {
      centerX = this.currentMousePosition.x;
      centerY = this.currentMousePosition.y;
    } else {
      centerX = this.DEFAULT_X;
      centerY = this.DEFAULT_Y;
    }

    // Calculate node positions using grid configuration
    // This ensures 2-node components span exactly 5 grid spaces (50 pixels)
    const nodePositions = GRID_CONFIG.calculateNodePositions(centerX, centerY, 0); // 0 degrees initially
    
    const positions = [
      new Position(nodePositions.start.x, nodePositions.start.y),
      new Position(nodePositions.end.x, nodePositions.end.y)
    ];
    
    // Create Properties instance with default orientation for all elements
    const properties = new Properties({ orientation: 0 });
    
    // Use ElementFactory.create with correct parameter order
    const element = ElementFactory.create(this.elementType, undefined, positions, properties, null);

    // Add the element in "placement mode" (so it follows the mouse)
    this.circuitService.addElement(element);
    this.circuitService.emit("startPlacing", { element });
  }

  /**
   * Undoes the add element command by removing the element from the circuit.
   */
  undo() {
    // Implementation would need to track the added element and remove it
    // For now, this is a placeholder
    console.log("Undo AddElementCommand not fully implemented yet");
  }
}
