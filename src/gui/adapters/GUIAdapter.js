/**
 * @class GUIAdapter
 * @description
 * The `GUIAdapter` bridges the UI and application logic. It transforms user input
 * into domain operations via command patterns and ensures state changes are traceable.
 *
 * **Core Concepts**:
 * - **Event-Driven Execution**: User actions trigger command objects.
 * - **Command Injection**: Commands are dynamically created via `GUICommandRegistry`.
 * - **Undo/Redo**: Commands are managed and reversible via `CommandHistory`.
 *
 * **Responsibilities**:
 * 1. Render circuit elements via `CircuitRenderer`.
 * 2. Bind UI controls and buttons to domain commands.
 * 3. Coordinate undo/redo functionality.
 */
import { CircuitRenderer } from "../renderers/CircuitRenderer.js";
import { CommandHistory } from "../commands/CommandHistory.js";

export class GUIAdapter {
  /**
   * @constructor
   * @param {HTMLElement} controls - DOM container for command buttons.
   * @param {HTMLCanvasElement} canvas - Canvas for circuit rendering.
   * @param {CircuitService} circuitService - Core domain service.
   * @param {ElementRegistry} elementRegistry - Registry of circuit components.
   * @param {RendererFactory} rendererFactory - Factory for creating renderers.
   * @param {GUICommandRegistry} guiCommandRegistry - Registry for GUI commands.
   */
  constructor(
    controls,
    canvas,
    circuitService,
    elementRegistry,
    rendererFactory,
    guiCommandRegistry,
  ) {
    this.controls = controls;
    this.canvas = canvas;
    this.circuitService = circuitService;
    this.elementRegistry = elementRegistry;
    this.circuitRenderer = new CircuitRenderer(
      canvas,
      circuitService,
      rendererFactory,
    );
    this.guiCommandRegistry = guiCommandRegistry;
    this.commandHistory = new CommandHistory();
    this.activeCommand = null;
    this.hasDragged = false;
    this.mouseDownPos = { x: 0, y: 0 };
    this.placingElement = null;
  }

  /**
   * Initializes the GUI, binds controls, sets up canvas listeners, and renders.
   */
  initialize() {
    this.circuitRenderer.render();
    this.bindUIControls();
    this.setupCanvasInteractions();
    this.circuitService.on("update", () => this.circuitRenderer.render());
  }

  /**
   * Executes a named command through the command registry and stores it in history.
   * @param {string} commandName - Identifier for the command.
   * @param {...any} args - Arguments passed to the command.
   */
  executeCommand(commandName, ...args) {
    const command = this.guiCommandRegistry.get(commandName, ...args);
    if (command) {
      this.commandHistory.executeCommand(command, this.circuitService);
    } else {
      console.warn(`Command "${commandName}" not found.`);
    }
  }

  /**
   * Binds UI buttons to element creation and undo/redo commands.
   */
  bindUIControls() {
    this.elementRegistry.getTypes().forEach((elementType) => {
      const buttonName = `add${elementType}`;
      const oldButton = this.controls.querySelector(`#${buttonName}`);
      if (oldButton) {
        const button = oldButton.cloneNode(true);
        oldButton.replaceWith(button);

        button.addEventListener("click", () => {
          const command = this.guiCommandRegistry.get(
            "addElement",
            this.circuitService,
            this.circuitRenderer,
            this.elementRegistry,
            elementType,
          );

          if (command) {
            this.commandHistory.executeCommand(command, this.circuitService);
          } else {
            console.warn(`Command 'addElement' not found for ${elementType}`);
          }
        });
      } else {
        console.warn(`Button for adding ${elementType} not found`);
      }
    });

    this.bindUndoRedo("#undoButton", () =>
      this.commandHistory.undo(this.circuitService),
    );
    this.bindUndoRedo("#redoButton", () =>
      this.commandHistory.redo(this.circuitService),
    );
  }

  /**
   * Helper for binding undo/redo buttons.
   * @param {string} selector - DOM selector for the button.
   * @param {Function} action - Function to execute on click.
   */
  bindUndoRedo(selector, action) {
    const button = this.controls.querySelector(selector);
    if (button) {
      const clone = button.cloneNode(true);
      button.replaceWith(clone);
      clone.addEventListener("click", () => {
        action();
        this.circuitRenderer.render();
      });
    } else {
      console.warn(`${selector} not found`);
    }
  }

  /**
   * Sets up mouse events for interaction on the canvas: zoom, drag, draw.
   */
setupCanvasInteractions() {
  this.canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    this.circuitRenderer.zoom(event);
  });

  this.canvas.addEventListener("mousedown", (event) => {
    if (event.button === 1) {
      this.canvas.style.cursor = "grabbing";
      this.panStartX = event.clientX - this.circuitRenderer.offsetX;
      this.panStartY = event.clientY - this.circuitRenderer.offsetY;
      return;
    }

    const { offsetX, offsetY } = this.getTransformedMousePosition(event);

    // If placing an element, finalize its position on left click
    if (event.button === 0 && this.placingElement) {
      const snappedX = Math.round(offsetX / 10) * 10;
      const snappedY = Math.round(offsetY / 10) * 10;
      const width = 60;

      this.placingElement.nodes[0].x = snappedX - width / 2;
      this.placingElement.nodes[0].y = snappedY;
      this.placingElement.nodes[1].x = snappedX + width / 2;
      this.placingElement.nodes[1].y = snappedY;

      this.circuitService.emit("update", {
        type: "finalizePlacement",
        element: this.placingElement,
      });

      this.placingElement = null;
      this.circuitRenderer.render();
      return;
    }

    // Regular command start
    if (event.button === 0) {
      const element = this.findElementAt(offsetX, offsetY);

      this.activeCommand = element
        ? this.guiCommandRegistry.get("dragElement", this.circuitService)
        : this.guiCommandRegistry.get(
            "drawWire",
            this.circuitService,
            this.elementRegistry,
          );

      if (this.activeCommand) {
        const before = this.circuitService.exportState();
        this.activeCommand.start(offsetX, offsetY);
        this.activeCommand.beforeSnapshot = before;
      }

      this.hasDragged = false;
      this.mouseDownPos = { x: offsetX, y: offsetY };
    }
  });

  this.canvas.addEventListener("mousemove", (event) => {
    const { offsetX, offsetY } = this.getTransformedMousePosition(event);

    // Live update for placing element
    if (this.placingElement) {
      const snappedX = Math.round(offsetX / 10) * 10;
      const snappedY = Math.round(offsetY / 10) * 10;
      const width = 60;

      this.placingElement.nodes[0].x = snappedX - width / 2;
      this.placingElement.nodes[0].y = snappedY;
      this.placingElement.nodes[1].x = snappedX + width / 2;
      this.placingElement.nodes[1].y = snappedY;

      this.circuitService.emit("update", {
        type: "movePreview",
        element: this.placingElement,
      });

      return;
    }

    // Regular move
    if (this.activeCommand) {
      const dx = offsetX - this.mouseDownPos.x;
      const dy = offsetY - this.mouseDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 2) {
        this.hasDragged = true;
      }
      this.activeCommand.move(offsetX, offsetY);
    }
  });

  this.canvas.addEventListener("mouseup", (event) => {
    if (event.button === 1) {
      this.canvas.style.cursor = "default";
      return;
    }

    if (this.activeCommand) {
      const before = this.activeCommand.beforeSnapshot;

      if (!this.hasDragged && this.activeCommand.cancel) {
        this.activeCommand.cancel();
      } else {
        this.activeCommand.stop();
        const after = this.circuitService.exportState();

        if (this.hasStateChanged(before, after)) {
          this.circuitService.importState(before);

          const snapshotCommand = {
            execute: () => this.circuitService.importState(after),
            undo: () => this.circuitService.importState(before),
          };

          this.commandHistory.executeCommand(snapshotCommand, this.circuitService);
        }
      }

      this.activeCommand = null;
    }
  });

  // Listen to the element placement event
  this.circuitService.on("startPlacing", ({ element }) => {
    this.placingElement = element;
  });
}

  /**
   * Converts screen coordinates to world coordinates.
   * @param {MouseEvent} event
   * @returns {{offsetX: number, offsetY: number}}
   */
  getTransformedMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      offsetX:
        (event.clientX - rect.left - this.circuitRenderer.offsetX) /
        this.circuitRenderer.scale,
      offsetY:
        (event.clientY - rect.top - this.circuitRenderer.offsetY) /
        this.circuitRenderer.scale,
    };
  }

  /**
   * Finds the first element at the given world coordinates.
   * @param {number} worldX
   * @param {number} worldY
   * @returns {Element|null}
   */
  findElementAt(worldX, worldY) {
    return (
      this.circuitService
        .getElements()
        .find((el) => this.isInsideElement(worldX, worldY, el)) || null
    );
  }

  /**
   * Determines if a point is inside or near a circuit element.
   * @param {number} x
   * @param {number} y
   * @param {Element} element
   * @returns {boolean}
   */
  isInsideElement(x, y, element) {
    if (element.nodes.length < 2) return false;
    const aura = 10;
    const [start, end] = element.nodes;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-6) return Math.hypot(x - start.x, y - start.y) <= aura;
    const distance =
      Math.abs(dy * x - dx * y + end.x * start.y - end.y * start.x) / length;
    if (distance > aura) return false;
    const minX = Math.min(start.x, end.x) - aura;
    const maxX = Math.max(start.x, end.x) + aura;
    const minY = Math.min(start.y, end.y) - aura;
    const maxY = Math.max(start.y, end.y) + aura;
    return !(x < minX || x > maxX || y < minY || y > maxY);
  }

  /**
   * Compares two circuit snapshots to determine if a meaningful change occurred.
   * @param {Object} before
   * @param {Object} after
   * @returns {boolean}
   */
  hasStateChanged(before, after) {
    before = JSON.parse(before);
    after = JSON.parse(after);
    if (!before || !after) return true;
    if (before.elements.length !== after.elements.length) return true;
    for (let i = 0; i < before.elements.length; i++) {
      const a = before.elements[i];
      const b = after.elements[i];
      if (a.id !== b.id || a.type !== b.type) return true;
      if (JSON.stringify(a.nodes) !== JSON.stringify(b.nodes)) return true;
    }
    return false;
  }
}
