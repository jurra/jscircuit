// test/CommandHistory.test.js
import { expect } from "chai";
import { CommandHistory } from "../src/gui/commands/CommandHistory.js";
import { createCircuitServiceFixture } from "./domain/CircuitServiceMock.js";

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

describe("CommandHistory", () => {
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
    it("adds, moves, and undoes correctly", () => {
      const circuitService = createCircuitServiceFixture()
      const history = new CommandHistory();
  
      const element = new Resistor("R1", [new Position(10, 10), new Position(60, 10)], null, new Properties());
      const addCommand = new AddElementCommand(circuitService, element);
  
      history.executeCommand(addCommand);
      expect(circuitService.getElements()).to.have.length(1);
  
      history.undo();
      expect(circuitService.getElements()).to.have.length(0);
  
      history.redo();
      expect(circuitService.getElements()).to.have.length(1);
    });
  });
  
