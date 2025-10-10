# QuCat Circuit Generator - AI Coding Instructions

## Architecture Overview

This is a **Domain-Driven Design (DDD)** circuit generator with **Hexagonal Architecture**. The system follows strict layered separation:

- **Domain** (`src/domain/`): Core business logic with aggregates, entities, value objects
- **Application** (`src/application/`): Service layer orchestrating domain operations  
- **GUI** (`src/gui/`): Canvas-based UI with event-driven architecture
- **Infrastructure** (`src/infrastructure/`): External adapters (file I/O, QuCat netlist format)

Key principle: **Domain layer has no dependencies** - all external concerns are injected through ports/adapters.

## Critical Development Patterns

### Element System
All circuit elements extend the abstract `Element` class and follow the factory pattern:
```javascript
// Register in src/config/settings.js
ElementRegistry.register('Resistor', (id, nodes, label, properties) => 
  new Resistor(id, nodes, label, properties));
```
Each element needs both a domain entity (`src/domain/entities/`) and GUI renderer (`src/gui/renderers/`).

### Command Pattern
All user actions are commands with undo/redo support:
```javascript
// Commands in src/gui/commands/
class AddElementCommand {
  execute() { /* do action */ }
  undo() { /* reverse action */ }
}
```
Register commands in `GUICommandRegistry` and bind to UI events in `src/config/menu.config.yaml`.

### Event-Driven Updates
`CircuitService` broadcasts state changes; GUI reacts via event listeners:
```javascript
circuitService.on('elementAdded', (element) => { /* update UI */ });
```

### Canvas Rendering
All rendering uses **HTML5 Canvas** with HiDPI support. Renderers are created via `RendererFactory` and handle both normal and selection states.

## Essential Build Commands

```bash
npm run build        # Full build: menu config → bundle → copy assets
npm run serve        # Build + serve with http-server
npm test            # Run Mocha tests with test environment setup
npm run menu:build  # Convert YAML menu config to JSON
```

**Critical**: Menu configuration (`src/config/menu.config.yaml`) must be built to JSON before bundling.

## Test Environment
- **Mocha + Chai** with custom setup in `tests/setup.js`
- **JSDOM + Canvas mock** for DOM/Canvas APIs in Node.js
- Tests organized by layer: `tests/domain/`, `tests/gui/`, `tests/integration/`
- Global test utilities in `tests/testUtils/`

## Key Configuration Files

- `src/config/settings.js`: Central registration of elements, renderers, and commands
- `src/config/menu.config.yaml`: UI menu structure and keyboard bindings
- `package.json`: ESBuild bundling with asset handling for PNG/JPG
- `tests/.mocharc.json`: Mocha configuration with recursive test discovery

## File Organization Conventions

```
src/
├── domain/           # No external dependencies
│   ├── aggregates/   # Circuit (root aggregate)
│   ├── entities/     # Resistor, Wire, Junction, etc.
│   ├── valueObjects/ # Position, Properties, NodeId
│   └── factories/    # ElementRegistry
├── application/      # Service layer
├── gui/              # Canvas UI + commands
├── infrastructure/   # External adapters
└── config/          # Registration and settings
```

## QuCat Integration
This generates circuits for **QuCat** (quantum circuit analysis). The `QucatNetlistAdapter` converts internal circuit representation to/from QuCat's netlist format for simulation.

## Performance Considerations
- Canvas uses **device pixel ratio scaling** for HiDPI displays
- **ResizeObserver** handles canvas resizing efficiently  
- Element rendering is optimized with caching and selective redraws
- See `PERFORMANCE_OPTIMIZATIONS.md` for detailed performance patterns

When adding new features, follow the DDD layered architecture, implement the command pattern for user actions, and ensure all UI updates are event-driven.