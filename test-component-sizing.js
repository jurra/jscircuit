// Test component sizing according to grid requirements
import { GRID_CONFIG, validateGridConfig } from './src/config/gridConfig.js';

console.log('Testing Component Sizing Requirements\n');

// Test 1: Verify grid configuration
console.log('1. Grid Configuration:');
validateGridConfig();

// Test 2: Test node positioning for a 2-node component
console.log('\n2. Component Node Positioning:');
const centerX = 100;  // Arbitrary center position
const centerY = 200;  // Arbitrary center position

const nodePositions = GRID_CONFIG.calculateNodePositions(centerX, centerY, 0);

console.log(`   Center position: (${centerX}, ${centerY})`);
console.log(`   Start node: (${nodePositions.start.x}, ${nodePositions.start.y})`);
console.log(`   End node: (${nodePositions.end.x}, ${nodePositions.end.y})`);

// Calculate the distance between nodes
const distance = Math.sqrt(
    Math.pow(nodePositions.end.x - nodePositions.start.x, 2) + 
    Math.pow(nodePositions.end.y - nodePositions.start.y, 2)
);

console.log(`   Distance between nodes: ${distance} pixels`);
console.log(`   Expected distance: ${GRID_CONFIG.componentSpanPixels} pixels`);

// Test 3: Verify sizing meets requirements
console.log('\n3. Requirements Verification:');
console.log(`   ✓ Grid spacing: ${GRID_CONFIG.spacing} pixels between points`);
console.log(`   ✓ Component spans: ${GRID_CONFIG.componentGridSpaces} grid spaces`);
console.log(`   ✓ Component spans: ${GRID_CONFIG.componentGridPoints} grid points`);
console.log(`   ✓ Component span in pixels: ${GRID_CONFIG.componentSpanPixels} pixels`);
console.log(`   ✓ Component height: ${GRID_CONFIG.componentHeightPixels} pixels`);

// Test 4: Verify distance matches requirements
if (distance === GRID_CONFIG.componentSpanPixels) {
    console.log(`   ✅ SUCCESS: Component spans exactly ${GRID_CONFIG.componentSpanPixels} pixels`);
} else {
    console.log(`   ❌ ERROR: Component spans ${distance} pixels, expected ${GRID_CONFIG.componentSpanPixels} pixels`);
}

// Test 5: Test different angles
console.log('\n4. Testing Different Orientations:');
const angles = [0, Math.PI/2, Math.PI, 3*Math.PI/2]; // 0°, 90°, 180°, 270°
const angleNames = ['0°', '90°', '180°', '270°'];

for (let i = 0; i < angles.length; i++) {
    const nodes = GRID_CONFIG.calculateNodePositions(100, 100, angles[i]);
    const dist = Math.sqrt(
        Math.pow(nodes.end.x - nodes.start.x, 2) + 
        Math.pow(nodes.end.y - nodes.start.y, 2)
    );
    console.log(`   ${angleNames[i]}: Distance = ${dist.toFixed(1)} pixels`);
}