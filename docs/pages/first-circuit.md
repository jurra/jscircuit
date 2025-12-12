# Your First Circuit

Let's create a simple quantum circuit - a basic transmon qubit!

## Step 1: Add a Josephson Junction

1. Press **J** on your keyboard
2. Click on the canvas to place the junction
3. The junction appears as a visual element with two nodes

## Step 2: Add a Capacitor

1. Press **C** on your keyboard
2. Click to place it parallel to the junction
3. Connect it to the same nodes as the junction

## Step 3: Add Ground

1. Press **G** on your keyboard
2. Click on one of the bottom nodes
3. This creates a reference point for the circuit

## Step 4: Configure Properties

1. Click on the junction to select it
2. Look for the properties panel (if available)
3. Set the junction energy `Ej` and capacitance values

## Step 5: Export the Circuit

1. Use **File > Export Netlist** from the menu
2. Save the `.txt` file
3. This file can be imported into QuCat for analysis

## Understanding the Circuit

You've just created a **transmon qubit** - the basic building block of many superconducting quantum computers!

- The **Josephson junction** provides the non-linearity needed for quantum behavior
- The **capacitor** sets the charging energy
- The **ground** provides a voltage reference

## Next Steps

- Try adding more elements to create coupled qubits
- Learn about {@tutorial custom-elements} to extend the available components
- Explore {@tutorial architecture overview} to understand the system design
