# Basic Usage Guide

Learn the essential features of the QuCat Circuit Generator.

## The Canvas

The main workspace is an HTML5 canvas where you design your circuits. You can:
- **Click** to place elements
- **Drag** to move elements
- **Select** elements by clicking on them
- **Delete** selected elements with the Delete key

## Adding Elements

Use keyboard shortcuts to enter "add mode" for each element type:

| Key | Element | Description |
|-----|---------|-------------|
| **C** | Capacitor | Add a capacitor |
| **L** | Inductor | Add an inductor |
| **J** | Junction | Add a Josephson junction |
| **R** | Resistor | Add a resistor |
| **W** | Wire | Add a connecting wire |
| **G** | Ground | Add a ground reference |

After pressing a key, click on the canvas to place the element.

## Connecting Elements

Elements automatically connect when their nodes overlap:
1. Place two elements near each other
2. Move them until nodes touch
3. The system creates an automatic connection

## Editing Properties

Click on an element to select it, then:
1. Look for the properties panel (if available)
2. Edit values like capacitance, inductance, etc.
3. Changes are automatically saved

## Undo and Redo

- **Ctrl+Z** (Cmd+Z on Mac) - Undo last action
- **Ctrl+Y** (Cmd+Y on Mac) - Redo action
- **Ctrl+Shift+Z** - Alternative redo shortcut

## File Operations

### Export Netlist

1. Click **File > Export Netlist** (or use Ctrl+S)
2. Choose a filename
3. Save the `.txt` file

The netlist format is compatible with QuCat for quantum circuit analysis.

### Import Netlist

1. Click **File > Import Netlist**
2. Select a QuCat netlist file
3. The circuit is loaded onto the canvas

### Clear Canvas

1. Click **Edit > Clear All**
2. Confirm the action
3. The canvas is cleared

## Example Circuits

Try these common quantum circuit patterns:

### Transmon Qubit
1. Add a Josephson junction (J)
2. Add a capacitor (C) in parallel
3. Add ground (G) to one side

### LC Resonator
1. Add an inductor (L)
2. Add a capacitor (C) in series
3. Add ground (G) at the bottom

### Coupled Qubits
1. Create two transmon qubits
2. Add a coupling capacitor between them
3. Ground both qubits

## Tips and Tricks

- ✅ Use grid snapping for precise placement
- ✅ Group related elements visually
- ✅ Label elements clearly for complex circuits
- ✅ Save your work frequently
- ✅ Test exported netlists with QuCat

## Next Steps

- Try {@tutorial first-circuit} to build a complete example
- Learn about {@tutorial custom-elements} to extend the system
