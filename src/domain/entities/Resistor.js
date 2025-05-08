import { Element } from './Element.js';
import { Properties } from '../valueObjects/Properties.js';

/**
 * Represents a Resistor in the circuit.
 */
export class Resistor extends Element {
    /**
     * Creates an instance of Resistor.
     * 
     * @param {string} id - The unique identifier for the resistor.
     * @param {Position[]} nodes - The two node positions for the resistor.
     * @param {Label|null} label - The label of the resistor (optional).
     * @param {Properties} properties - A container for the resistor's properties, including resistance.
     */
    constructor(id, nodes, label = null, properties = new Properties({ resistance: undefined })) {
        if (nodes.length !== 2) {
            throw new Error("A Resistor must have exactly two nodes.");
        }
        super(id, nodes, label, properties);
        this.type = 'resistor';
    }
}
