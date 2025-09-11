import { ElementRenderer } from "./ElementRenderer.js";
import { getImagePath } from '../../utils/getImagePath.js';

export class JunctionRenderer extends ElementRenderer {
    constructor(context) {
        super(context);
        this.image = null;
        this.imageLoaded = false;
        this.imageLoading = false;

        // Define proper dimensions for the junction image (should be square for circular junction)
        this.SCALED_WIDTH = 30;  // Reduced and made square
        this.SCALED_HEIGHT = 30; // Same as width for circular appearance
    }

    async initImageIfNeeded() {
        if (this.image || this.imageLoading) return;

        this.imageLoading = true;
        try {
            // Only create Image if we're in a browser environment
            if (typeof Image !== 'undefined') {
                this.image = new Image();
                this.image.onload = () => {
                    this.imageLoaded = true;
                    // Trigger a re-render when the image loads
                    if (this.context && this.context.canvas) {
                        const event = new CustomEvent('renderer:imageLoaded', { detail: { type: 'junction' } });
                        document.dispatchEvent(event);
                    }
                };

                const imagePath = await getImagePath("junction");
                this.image.src = imagePath;
            }
        } catch (error) {
            console.warn('Error loading junction image:', error);
        } finally {
            this.imageLoading = false;
        }
    }

    async init() {
        await this.initImageIfNeeded();
    }

    renderElement(junction) {
        // Try to initialize image if needed (don't await, let it load in background)
        if (!this.image && !this.imageLoading) {
            this.initImageIfNeeded(); // Fire and forget
        }

        const [start, end] = junction.nodes;
        // Compute midpoint between snapped nodes
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Draw terminals (using the base method from ElementRenderer)
        this.renderTerminal(start);
        this.renderTerminal(end);

        // Draw the junction representation
        if (this.imageLoaded && this.image) {
            // Maintain aspect ratio and center the image
            const aspectRatio = this.image.naturalWidth / this.image.naturalHeight;
            let drawWidth, drawHeight;
            
            if (aspectRatio > 1) {
                // Image is wider than tall
                drawWidth = this.SCALED_WIDTH;
                drawHeight = this.SCALED_WIDTH / aspectRatio;
            } else {
                // Image is taller than wide or square
                drawHeight = this.SCALED_HEIGHT;
                drawWidth = this.SCALED_HEIGHT * aspectRatio;
            }
            
            this.context.drawImage(
                this.image,
                midX - drawWidth / 2,
                midY - drawHeight / 2,
                drawWidth,
                drawHeight,
            );
        } else if (!this.imageLoading) {
            // Fallback: Draw junction symbol (proportionate X)
            this.renderFallback(junction, midX, midY);
        }

        // Draw connecting lines from terminals to junction body
        this.renderConnections(start, end, midX, midY);

        // Render label if present
        if (junction.label && junction.label.text) {
            this.renderLabel(junction.label.text, midX, midY + 30);
        }
    }

    renderFallback(junction, midX, midY) {
        // Junction symbol: proportionate X cross
        this.context.save();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 3;
        this.context.lineCap = 'round';
        
        const size = 12; // Half the size of the X
        
        // Draw X with equal proportions
        this.context.beginPath();
        // Top-left to bottom-right
        this.context.moveTo(midX - size, midY - size);
        this.context.lineTo(midX + size, midY + size);
        // Top-right to bottom-left  
        this.context.moveTo(midX + size, midY - size);
        this.context.lineTo(midX - size, midY + size);
        this.context.stroke();

        this.context.restore();
    }

    renderConnections(start, end, midX, midY) {
        this.context.save();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;

        // For junction, draw lines from terminals to junction body edges (adjusted for smaller size)
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(midX - 15, midY); // Adjusted from center to edge
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(midX + 15, midY); // Adjusted from center to edge
        this.context.lineTo(end.x, end.y);
        this.context.stroke();

        this.context.restore();
    }
}
