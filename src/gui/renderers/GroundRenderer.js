import { ImageRenderer } from "./ImageRenderer.js";

export class GroundRenderer extends ImageRenderer {
    constructor(context) {
        super(context, "ground", 40, 30);
        this.GROUND_NODE_PADDING = 0; // Padding between node and bottom of ground image
    }

    /**
     * Override drawImage to provide special selection positioning for ground
     */
    drawImage(x, y, rotation = 0) {
        const currentImage = this.getCurrentImage();
        if (!this.isImageReady() || !currentImage) return false;

        // Maintain aspect ratio and center the image
        const aspectRatio = currentImage.naturalWidth / currentImage.naturalHeight;
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

        this.context.save();
        this.context.translate(x, y);
        if (rotation !== 0) {
            this.context.rotate(rotation);
        }
        
        // Special selection border positioning for ground
        if (this.isSelected) {
            const borderWidth = this.SELECTION_BORDER_WIDTH;
            const padding = this.GROUND_NODE_PADDING;
            
            // For ground: selection box should include connection node + ground image
            // Connection node is at (0, -30) relative to ground center
            // We want the selection to go from just above the node to just below the ground
            const nodeY = -30; // Node position relative to ground center
            const groundTop = -drawHeight / 2; // Top of ground image
            const groundBottom = drawHeight / 2; // Bottom of ground image
            
            // Selection box from node (with padding) to ground bottom (with padding)
            const selectionTop = nodeY - padding;
            const selectionBottom = groundBottom + padding;
            const selectionHeight = selectionBottom - selectionTop;
            
            const borderX = -5;
            const borderY = -21.5;
            const borderWidthTotal = drawWidth + (padding * 2) + borderWidth;
            const borderHeightTotal = selectionHeight + borderWidth;
            
            this.context.strokeStyle = this.SELECTION_BORDER_COLOR;
            this.context.lineWidth = borderWidth;
            this.context.setLineDash([]);
            this.context.strokeRect(borderX, borderY, borderWidthTotal, borderHeightTotal);
        }
        
        // Draw the main image
        this.context.drawImage(
            currentImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
        this.context.restore();
        
        return true;
    }

    renderElement(ground) {
        if (!this.image && !this.imageLoading) {
            this.initImageIfNeeded();
        }

        const [connectionNode] = ground.nodes;
        const groundX = connectionNode.x;
        const groundY = connectionNode.y + 30;

        this.renderTerminal(connectionNode);

        if (!this.drawImage(groundX, groundY, 3 * Math.PI / 2)) {
            this.renderFallback(ground, groundX, groundY);
        }

        this.renderConnections(connectionNode, groundX, groundY);

        if (ground.label && ground.label.text) {
            this.renderLabel(ground.label.text, groundX, groundY + 30);
        }
    }

    renderFallback(ground, groundX, groundY) {
        this.context.save();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 2;

        const lineWidths = [20, 12, 6];
        for (let i = 0; i < lineWidths.length; i++) {
            const y = groundY + (i * 5);
            const halfWidth = lineWidths[i] / 2;
            this.context.beginPath();
            this.context.moveTo(groundX - halfWidth, y);
            this.context.lineTo(groundX + halfWidth, y);
            this.context.stroke();
        }

        this.context.restore();
    }

    renderConnections(connectionNode, groundX, groundY) {
        this.context.save();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 2;

        const strokeEndY = groundY - 15;
        
        this.context.beginPath();
        this.context.moveTo(connectionNode.x, connectionNode.y);
        this.context.lineTo(groundX, strokeEndY);
        this.context.stroke();

        this.context.restore();
    }

    // Override isPointInBounds for ground specific positioning
    isPointInBounds(mouseX, mouseY, elementMidX, elementMidY) {
        const groundX = elementMidX;
        const groundY = elementMidY + 30;
        const halfWidth = this.SCALED_WIDTH / 2;
        const halfHeight = this.SCALED_HEIGHT / 2;
        
        return (
            mouseX >= groundX - halfWidth &&
            mouseX <= groundX + halfWidth &&
            mouseY >= groundY - halfHeight &&
            mouseY <= groundY + halfHeight
        );
    }
}
