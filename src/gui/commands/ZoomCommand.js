import { GUICommand } from "./GUICommand.js";

export class ZoomCommand extends GUICommand {
    constructor(renderer, zoomFactor) {
        super();
        this.renderer = renderer;
        this.zoomFactor = zoomFactor;
    }

    execute() {
        console.log(`🔍 Zooming by factor: ${this.zoomFactor}`);
        this.renderer.scale *= this.zoomFactor;
        this.renderer.render();
    }
}
