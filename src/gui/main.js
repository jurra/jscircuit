import { Circuit } from "../domain/aggregates/Circuit.js";
import { CircuitService } from "../application/CircuitService.js";
import { WireSplitService } from "../application/WireSplitService.js";
import { GUIAdapter } from "./adapters/GUIAdapter.js";
import { AddElementCommand } from "./commands/AddElementCommand.js";
import { DragElementCommand } from "./commands/GUIDragElementCommand.js";
import { DrawWireCommand } from "./commands/DrawWireCommand.js";

import { ElementRegistry, rendererFactory, GUICommandRegistry } from "../config/settings.js";

// Create circuit and circuit service
const circuit = new Circuit();
const circuitService = new CircuitService(circuit, ElementRegistry);

// Create wire split service
const wireSplitService = new WireSplitService(circuitService, ElementRegistry);

//  Register commands globally before GUI initialization
GUICommandRegistry.register("drawWire", (circuitService, elementRegistry) =>
  new DrawWireCommand(circuitService, elementRegistry, wireSplitService)
);

GUICommandRegistry.register("addElement", (circuitService, circuitRenderer, elementRegistry, elementType) =>
    new AddElementCommand(circuitService, circuitRenderer, elementRegistry, elementType)
);

GUICommandRegistry.register("dragElement", (circuitService) =>
    new DragElementCommand(circuitService)
);



// Start the GUI
const canvas = document.getElementById("circuitCanvas");
const guiAdapter = new GUIAdapter(canvas, circuitService, ElementRegistry, rendererFactory, GUICommandRegistry);
guiAdapter.initialize();
