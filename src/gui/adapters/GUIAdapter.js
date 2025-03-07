import { CircuitRenderer } from "../renderers/CircuitRenderer.js";
import { CommandHistory } from "../commands/CommandHistory.js";

/**
 * @class GUIAdapter
 * @description
 * The `GUIAdapter` serves as the bridge between the user interface (UI) and the underlying application logic.
 * Instead of directly modifying the circuit, it retrieves and executes commands dynamically.
 *
 * **Core Concepts**:
 * - **Event-Driven Execution**: UI interactions trigger commands rather than modifying state directly.
 * - **Dynamic Command Injection**: Commands are managed by `CommandFactory` and executed via `CommandHistory`.
 * - **Separation of Concerns**: The GUI delegates all logic to `CircuitService` via the command system.
 *
 * **Responsibilities**:
 * 1. **Initialization**:
 *    - Renders the circuit and **binds UI controls dynamically**.
 * 2. **Command Execution**:
 *    - Forwards user actions to `CommandFactory`, which then emits **commandExecuted** events.
 * 3. **Undo/Redo Support**:
 *    - Ensures that every executed command is trackable via `CommandHistory`.
 *
 * **Example Workflow**:
 * 1. A user clicks the "Add Resistor" button.
 * 2. The `click` event triggers `executeCommand("addElement", "Resistor")`.
 * 3. `GUIAdapter` retrieves the command from `CommandFactory`.
 * 4. The command executes via `CommandHistory`.
 * 5. `CircuitService` adds the element and emits an `"update"` event.
 * 6. `GUIAdapter` listens for `"update"` and **re-renders the UI**.
 *
 * **Benefits**:
 * - **Decoupled UI & Business Logic**: The GUI does not directly modify the circuit.
 * - **Fully Extensible**: New commands can be added without modifying this class.
 * - **Undo/Redo Support**: Actions can be undone/redone via `CommandHistory`.
 *
 * @example
 * const guiAdapter = new GUIAdapter(canvas, circuitService, elementRegistry);
 * guiAdapter.initialize();
 */
export class GUIAdapter {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element for rendering the circuit.
     * @param {CircuitService} circuitService - The service managing circuit logic.
     * @param {Object} elementRegistry - The registry of circuit elements.
     * @param {RendererFactory} rendererFactory - The factory for creating element renderers.
     * @param {GUICommandRegistry} commandFactory - The factory for creating commands.
     */
    constructor(canvas, circuitService, elementRegistry, rendererFactory, guiCommandRegistry) {
        this.canvas = canvas;
        this.circuitService = circuitService;
        this.elementRegistry = elementRegistry;
        this.circuitRenderer = new CircuitRenderer(canvas, circuitService, rendererFactory);
        this.guiCommandRegistry = guiCommandRegistry;
        
        // this.commandFactory = new GUICommandFactory(circuitService, this.circuitRenderer, elementRegistry);
        this.commandHistory = new CommandHistory();
    }

    /**
     * Dynamically binds UI controls to their corresponding commands.
     * Instead of directly modifying circuit state, this now delegates execution to CommandFactory.
     */
    bindUIControls() {
        console.log("🔍 Binding UI controls in GUIAdapter...");
        console.log("Commands available:", this.guiCommandRegistry.getTypes());

        this.elementRegistry.getTypes().forEach((elementType) => {
            const buttonName = `add${elementType}`;  // Format should match HTML IDs
            console.log(`🔍 Searching for button: ${buttonName}`);

            const button = document.getElementById(buttonName);
            if (button) {
                console.log(`✅ Found button: ${button.id}, binding addElement command for ${elementType}`);

                button.addEventListener("click", () => {
                    console.log(`🛠 Executing addElement command for: ${elementType}`);

                    // Retrieve the correct command with the element type
                    const command = this.guiCommandRegistry.get(
                        "addElement",
                        // this,  // Pass GUIAdapter
                        this.circuitService,
                        this.circuitRenderer,
                        this.elementRegistry,
                        elementType
                    );

                    if (command) {
                        command.execute();
                        console.log(`✅ Command 'addElement' executed for ${elementType}`);
                    } else {
                        console.warn(`⚠️ Command 'addElement' not found for ${elementType}`);
                    }
                });
            } else {
                console.warn(`⚠️ Button for adding ${elementType} not found`);
            }
        });
    }
        /**
     * Executes a command by retrieving it from the CommandFactory and executing via CommandHistory.
     * @param {string} commandName - The name of the command to execute.
     * @param {...any} args - Arguments to pass to the command.
     */
    executeCommand(commandName, ...args) {
        console.log(`Executing command: ${commandName} with args:`, args);

        const command = this.commandFactory.get(commandName, ...args);
        if (command) {
            this.commandHistory.executeCommand(command, ...args);
        } else {
            console.warn(`Command "${commandName}" not found.`);
        }
    }

    /**
     * Initializes the GUI by rendering the circuit and binding UI controls.
     */
    initialize() {
        this.circuitRenderer.render();
        this.bindUIControls();
        this.setupCanvasInteractions();

        // Listen for UI updates from CircuitService
        this.circuitService.on("update", () => this.circuitRenderer.render());
    }

    /**
     * Sets up canvas interactions for dragging elements.
     */
    setupCanvasInteractions() {
        let dragCommand = null;  // Cache the command to prevent infinite looping

        this.canvas.addEventListener("mousedown", (event) => {
            const { offsetX, offsetY } = event;
            //  Retrieve the drag command only ONCE when dragging starts
            dragCommand = this.guiCommandRegistry.get("dragElement", this.circuitService);

            if (dragCommand) {
                dragCommand.start(offsetX, offsetY);
            } else {
                console.warn("⚠️ Drag command not found in registry");
            }
        });

        this.canvas.addEventListener("mousemove", (event) => {
            if (dragCommand) { //  Only execute if a drag command exists
                const { offsetX, offsetY } = event;
                dragCommand.move(offsetX, offsetY);
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if (dragCommand) {
                dragCommand.stop();
                dragCommand = null;  // Reset command after stopping to prevent looping
            }
        });
    }
}
