// test/CommandHistory.test.js
import { expect } from "chai";
import { CommandHistory } from "../src/gui/commands/CommandHistory.js";
import { createGUIEnvironmentFixture } from "./gui/GUIEnvironmentFixture.js";

// Mock Image class to prevent errors in tests
global.Image = class {
    constructor() {
      this.onload = () => {};
      this.src = '';
    }
};

describe("CommandHistory", () => {
  class DummyCommand {
    constructor() {
      this.executed = false;
      this.undone = false;
    }

    execute() {
      this.executed = true;
    }

    undo() {
      this.undone = true;
    }
  }

  it("executes a command and stores it", () => {
    const history = new CommandHistory();
    const command = new DummyCommand();

    history.executeCommand(command);
    expect(command.executed).to.be.true;
  });

  it("undoes the last command", () => {
    const history = new CommandHistory();
    const command = new DummyCommand();

    history.executeCommand(command);
    history.undo();
    expect(command.undone).to.be.true;
  });

  it("redoes a previously undone command", () => {
    const history = new CommandHistory();
    const command = new DummyCommand();

    history.executeCommand(command);
    history.undo();
    command.executed = false; // reset state
    history.redo();

    expect(command.executed).to.be.true;
  });

  it("does not crash on undo with empty history", () => {
    const history = new CommandHistory();
    expect(() => history.undo()).not.to.throw();
  });

  it("does not crash on redo with empty future", () => {
    const history = new CommandHistory();
    expect(() => history.redo()).not.to.throw();
  });

  it("clears history and future", () => {
    const history = new CommandHistory();
    const command = new DummyCommand();

    history.executeCommand(command);
    history.undo();
    history.clear();

    expect(() => history.undo()).not.to.throw();
    expect(() => history.redo()).not.to.throw();
  });
});

describe("Undo/Redo integration", () => {
  let circuitService, getAddElementCommand;

  beforeEach(async () => {
    const env = await createGUIEnvironmentFixture();
    circuitService = env.circuitService;
    getAddElementCommand = env.getAddElementCommand;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it("adds, undoes, and redoes a resistor", () => {
    const history = new CommandHistory();
    const command = getAddElementCommand("resistor");

    history.executeCommand(command);
    expect(circuitService.getElements()).to.have.length(1);
    expect(circuitService.getElements()[0].type).to.equal("resistor");

    history.undo();
    expect(circuitService.getElements()).to.have.length(0);

    history.redo();
    expect(circuitService.getElements()).to.have.length(1);
  });
});
