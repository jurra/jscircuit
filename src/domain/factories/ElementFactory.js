/**
 * A factory class responsible for creating instances of elements.
 * It delegates element retrieval to `ElementRegistry`, ensuring
 * a single source of truth for registered elements.
 */

import { ElementRegistry } from './ElementRegistry.js';

export class ElementFactory {
    /**
    * Creates a new instance of an element based on the specified type.
    * @param {string} type - The type of the element to create.
    * @param {string} id - The unique identifier for the element.
    * @param {Position[]} nodes - The array of terminal positions.
    * @param {Object} propertiesArgs - Arguments for initializing properties.
    * @returns {Object} - An instance of the requested element type.
    * @throws {Error} - If the type is not registered in the registry.
    */
    static create(type, id, nodes, propertiesArgs) {
        const factoryFunction = ElementRegistry.get(type);

        if (!factoryFunction) {
            throw new Error(`Element type "${type}" is not registered.`);
        }

        return factoryFunction(id, nodes, propertiesArgs);
    }
}
