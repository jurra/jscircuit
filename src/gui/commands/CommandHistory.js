export class CommandHistory {
    constructor() {
        this.history = [];
        this.future = [];
    }

    executeCommand(command, ...args) {
        console.log(`Executing command: ${command.name} with args:`, args);
        command.execute(...args);
        this.history.push(command);
        this.future = []; // Clear redo stack
    }

    undo() {
        if (this.history.length === 0) return;
        const command = this.history.pop();
        command.undo();
        this.future.push(command);
    }

    redo() {
        if (this.future.length === 0) return;
        const command = this.future.pop();
        command.execute();
        this.history.push(command);
    }

    clear() {
        this.history = [];
        this.future = [];
      }
}
