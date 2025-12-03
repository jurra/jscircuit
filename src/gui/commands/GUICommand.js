/**
 * @abstract
 * GUICommand: Abstract base class for all GUI-related commands.
 */
export class GUICommand {
    constructor(guiAdapter) {
        if (new.target === GUICommand) {
            throw new Error("Cannot instantiate abstract class GUICommand.");
        }
        this.guiAdapter = guiAdapter;
    }

    /**
     * Executes the command.
     * @abstract
     */
    execute() {
        throw new Error("Execute method must be implemented.");
    }

    /**
     * Undoes the command, reversing its effect.
     * @abstract
     */
    undo() {
        throw new Error("Undo method must be implemented.");
    }
}
