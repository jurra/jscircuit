// Test node positioning on grid points
import { GRID_CONFIG } from './src/config/gridConfig.js';

console.log('Testing Node Positioning on Grid Points\n');

// Test different center positions to verify nodes always land on grid points
const testCenters = [
    { x: 100, y: 200, name: 'Center (100, 200)' },
    { x: 105, y: 205, name: 'Off-grid center (105, 205)' },
    { x: 80, y: 180, name: 'Grid-aligned center (80, 180)' },
    { x: 123, y: 187, name: 'Random center (123, 187)' }
];

for (const center of testCenters) {
    console.log(`${center.name}:`);
    const nodes = GRID_CONFIG.calculateNodePositions(center.x, center.y, 0);
    
    console.log(`   Start node: (${nodes.start.x}, ${nodes.start.y})`);
    console.log(`   End node: (${nodes.end.x}, ${nodes.end.y})`);
    
    // Check if nodes are on grid points
    const startOnGrid = (nodes.start.x % GRID_CONFIG.spacing === 0) && (nodes.start.y % GRID_CONFIG.spacing === 0);
    const endOnGrid = (nodes.end.x % GRID_CONFIG.spacing === 0) && (nodes.end.y % GRID_CONFIG.spacing === 0);
    
    // Check distance
    const distance = Math.abs(nodes.end.x - nodes.start.x);
    
    console.log(`   Start on grid: ${startOnGrid ? '✅' : '❌'}`);
    console.log(`   End on grid: ${endOnGrid ? '✅' : '❌'}`);
    console.log(`   Distance: ${distance} pixels ${distance === 50 ? '✅' : '❌'}`);
    console.log('');
}

// Test vertical orientation (90 degrees)
console.log('Testing Vertical Orientation (90°):');
const verticalNodes = GRID_CONFIG.calculateNodePositions(100, 100, Math.PI/2);
console.log(`   Start node: (${verticalNodes.start.x}, ${verticalNodes.start.y})`);
console.log(`   End node: (${verticalNodes.end.x}, ${verticalNodes.end.y})`);

const verticalDistance = Math.abs(verticalNodes.end.y - verticalNodes.start.y);
console.log(`   Vertical distance: ${verticalDistance} pixels ${verticalDistance === 50 ? '✅' : '❌'}`);

const startOnGridV = (verticalNodes.start.x % 10 === 0) && (verticalNodes.start.y % 10 === 0);
const endOnGridV = (verticalNodes.end.x % 10 === 0) && (verticalNodes.end.y % 10 === 0);
console.log(`   Start on grid: ${startOnGridV ? '✅' : '❌'}`);
console.log(`   End on grid: ${endOnGridV ? '✅' : '❌'}`);