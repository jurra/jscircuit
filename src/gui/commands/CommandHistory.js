// /src/gui/commands/CommandHistory.js
/**
 * @class CommandHistory
 * @description
 * Manages the execution history of commands, enabling undo and redo operations.
 * Used to track stateful interactions (e.g., adding, moving, deleting elements)
 * in a circuit design context.
 */
export class CommandHistory {
  /**
   * Initializes a new instance of CommandHistory.
   * Sets up empty history and future stacks.
   */
  constructor() {
    /**
     * @private
     * @type {Array<{execute: Function, undo: Function}>}
     */
    this.history = [];

    /**
     * @private
     * @type {Array<{execute: Function, undo: Function}>}
     */
    this.future = [];
  }

  /**
   * Executes a command and stores it in the history stack.
   * Clears the redo stack.
   *
   * @param {{execute: Function, undo: Function}} command - The command to execute.
   * @param {...any} args - Arguments to pass to the command's `execute` method.
   */
  executeCommand(command, ...args) {
    console.log(
      `Executing command: ${command.constructor.name} with args:`,
      args,
    );
    command.execute(...args);
    this.history.push(command);
    this.future = []; // Clear redo stack
  }

  /**
   * Undoes the most recently executed command.
   * Moves it to the redo stack.
   *
   * Does nothing if the history stack is empty.
   */
  undo() {
    if (this.history.length === 0) return;
    const command = this.history.pop();
    command.undo();
    this.future.push(command);
  }

  /**
   * Redoes the most recently undone command.
   * Moves it back to the history stack.
   *
   * Does nothing if the future stack is empty.
   */
  redo() {
    if (this.future.length === 0) return;
    const command = this.future.pop();
    command.execute();
    this.history.push(command);
  }

  /**
   * Clears both history and future stacks.
   * Useful when resetting circuit state or loading a new project.
   */
  clear() {
    this.history = [];
    this.future = [];
  }
}
