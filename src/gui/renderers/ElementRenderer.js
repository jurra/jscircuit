// ElementRenderer.js
export class ElementRenderer {
  constructor(context) {
    this.context = context;
    // Optional: show alignment guide markers (set to true to debug or visualize)
    this.showAlignmentGuide = true;
    // You can configure the guide color and size here:
    this.alignmentGuideColor = "red";
    this.alignmentGuideSize = 4; // pixels radius for the guide cross
  }

  /**
   * Renders a terminal as a small circle.
   * @param {Position} position - The terminal's position.
   */
  renderTerminal(position) {
    this.context.fillStyle = "black";
    this.context.beginPath();
    this.context.arc(position.x, position.y, 2, 0, Math.PI * 2);
    this.context.fill();

    if (this.showAlignmentGuide) {
      this.renderAlignmentGuide(position);
    }
  }

  /**
   * Renders a label at a given position.
   * @param {string} text - The label text.
   * @param {number} x - X-coordinate.
   * @param {number} y - Y-coordinate.
   */
  renderLabel(text, x, y) {
    this.context.fillStyle = "white";
    this.context.font = "12px Arial";
    this.context.textAlign = "center";
    this.context.fillText(text, x, y);
  }

  /**
   * Optional: Renders an alignment guide (e.g., a small cross) at a given position.
   * This can be used to visualize the grid intersections.
   * @param {Position} position - The position to mark.
   */
  renderAlignmentGuide(position) {
    const ctx = this.context;
    const size = this.alignmentGuideSize;
    ctx.save();
    ctx.strokeStyle = this.alignmentGuideColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(position.x - size, position.y);
    ctx.lineTo(position.x + size, position.y);
    ctx.moveTo(position.x, position.y - size);
    ctx.lineTo(position.x, position.y + size);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Abstract method for rendering an element.
   * @param {Object} element - The element to render.
   */
  renderElement(element) {
    throw new Error("renderElement() must be implemented in derived classes.");
  }
}
