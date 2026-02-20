/**
 * Notification
 *
 * Lightweight, reusable toast notification that renders inside the
 * canvas-container (top-left, just below the menu bar).
 *
 * Usage:
 *   import { Notification } from './Notification.js';
 *
 *   // from any command that has a circuitRenderer reference:
 *   Notification.success(circuitRenderer, 'Netlist copied!');
 *   Notification.error(circuitRenderer,   'Parse failed.');
 */
export class Notification {
    /* ------------------------------------------------------------------ */
    /*  Public API                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Show a green success toast.
     * @param {import('../renderers/CircuitRenderer.js').CircuitRenderer} circuitRenderer
     * @param {string} message
     * @param {number} [duration=3000] ms before fade-out begins
     */
    static success(circuitRenderer, message, duration = 3000) {
        Notification._show(circuitRenderer, message, '#4caf50', duration);
    }

    /**
     * Show a red error toast.
     * @param {import('../renderers/CircuitRenderer.js').CircuitRenderer} circuitRenderer
     * @param {string} message
     * @param {number} [duration=3000]
     */
    static error(circuitRenderer, message, duration = 3000) {
        Notification._show(circuitRenderer, message, '#f44336', duration);
    }

    /* ------------------------------------------------------------------ */
    /*  Internal                                                           */
    /* ------------------------------------------------------------------ */

    /**
     * @param {import('../renderers/CircuitRenderer.js').CircuitRenderer} circuitRenderer
     * @param {string} message
     * @param {string} bgColor
     * @param {number} duration
     * @private
     */
    static _show(circuitRenderer, message, bgColor, duration) {
        // Anchor inside .canvas-container — the scrollable area just below the menu.
        const container = circuitRenderer?.canvas?.parentElement;
        if (!container) return;

        const el = document.createElement('div');
        el.textContent = message;
        el.style.cssText = `
            position: sticky; top: 12px; left: 12px;
            width: fit-content;
            background-color: ${bgColor}; color: white;
            padding: 12px 20px; border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10001; font-family: Arial, sans-serif; font-size: 14px;
            pointer-events: none;
            opacity: 0; transition: opacity 0.3s ease-in;
        `;

        // Prepend so it sits before the canvas in DOM flow.
        container.insertBefore(el, container.firstChild);

        // Fade in on next frame.
        requestAnimationFrame(() => { el.style.opacity = '1'; });

        // Fade out then remove.
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }, duration);
    }
}
