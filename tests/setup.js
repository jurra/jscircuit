import { expect, assert } from 'chai';
globalThis.expect = expect;
globalThis.assert = assert;

// Mock Image constructor to prevent issues in Node.js environment
global.Image = class {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        this.width = 0;
        this.height = 0;
    }
};
