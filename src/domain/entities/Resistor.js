import { Element } from './Element.js';
import { Properties } from '../valueObjects/Properties.js';
import { Resistance } from '../valueObjects/Resistance.js';

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

        if (!(properties instanceof Properties)) {
            throw new Error("Properties must be an instance of Properties.");
        }

        const resistance = properties.values.resistance;

        if (resistance !== undefined) {
            if (typeof resistance !== 'number') {
                throw new Error("Resistance must be a number or undefined.");
            }
            new Resistance(resistance); // validates
        }

        super(id, nodes, label, properties);
        this.type = 'resistor';
    }
}
