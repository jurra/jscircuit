import { GUICommand } from "./GUICommand.js";

/**
 * SelectAllElementsCommand: Selects all elements in the circuit
 */
export class SelectAllElementsCommand extends GUICommand {
    constructor(circuitService, circuitRenderer) {
        super();
        this.circuitService = circuitService;
        this.circuitRenderer = circuitRenderer;
        this.previousSelection = new Set();
    }

    /**
     * Execute the select all command - selects all elements in the circuit
     */
    execute() {
        // Store previous selection for undo
        this.previousSelection = new Set(this.circuitRenderer.getSelectedElements());
        
        // Get all elements in the circuit
        const allElements = this.circuitService.getElements();
        
        if (allElements.length === 0) {
            console.log("No elements in circuit to select");
            return;
        }
        
        // Clear existing selection and select all elements
        this.circuitRenderer.clearSelection();
        
        allElements.forEach(element => {
            this.circuitRenderer.addToSelection(element);
        });
        
        console.log(`Selected all ${allElements.length} element(s)`);
        
        // Trigger a render to update the visual feedback
        this.circuitRenderer.render();
    }

    /**
     * Undo the select all command - restore previous selection
     */
    undo() {
        // Restore the previous selection state
        this.circuitRenderer.setSelectedElements(this.previousSelection);
        
        console.log(`Select all undone - restored previous selection of ${this.previousSelection.size} element(s)`);
        
        // Trigger a render to update the visual feedback
        this.circuitRenderer.render();
    }

    /**
     * Check if this command can be undone
     * @returns {boolean}
     */
    canUndo() {
        return false; // Selection changes are typically not undoable
    }
}