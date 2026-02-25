import { GUICommand } from './GUICommand.js';
import { QucatNetlistAdapter } from '../../infrastructure/adapters/QucatNetlistAdapter.js';

/**
 * CopyNetlistToClipboardCommand
 * 
 * Handles copying the current circuit netlist to the system clipboard.
 * Provides user feedback on success/failure.
 */
export class CopyNetlistToClipboardCommand extends GUICommand {
    /**
     * @param {CircuitService} circuitService - The circuit service
     * @param {CircuitRenderer} circuitRenderer - The circuit renderer for UI updates
     * @param {(message: string, type: 'success'|'error') => void} notify - Notification callback
     */
    constructor(circuitService, circuitRenderer, notify) {
        super();
        this.circuitService = circuitService;
        this.circuitRenderer = circuitRenderer;
        this.notify = notify || (() => {});
    }

    /**
     * Execute copy netlist to clipboard operation
     */
    execute() {
        try {
            // Get current circuit state
            const circuit = this.circuitService.circuit;
            
            if (!circuit || circuit.elements.length === 0) {
                console.warn('[CopyNetlistToClipboardCommand] No circuit elements to copy');
                alert('No circuit elements to copy. Please add some components first.');
                return { undo: () => {} };
            }

            // Convert circuit to netlist format using QucatNetlistAdapter
            const netlistContent = QucatNetlistAdapter.exportToString(circuit);
            
            // Copy to clipboard
            this._copyToClipboard(netlistContent);
            
            // No undo needed for clipboard operation
            return { undo: () => {} };
            
        } catch (error) {
            console.error('[CopyNetlistToClipboardCommand] Error copying netlist to clipboard:', error);
            alert(`Error copying netlist to clipboard: ${error.message}`);
            return { undo: () => {} };
        }
    }

    /**
     * Copy text to clipboard using the Clipboard API
     * Falls back to older execCommand method if needed
     * @param {string} content - The content to copy
     * @private
     */
    _copyToClipboard(content) {
        // Use modern Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content)
                .then(() => {
                    console.log('[CopyNetlistToClipboardCommand] Netlist copied to clipboard');
                    this._showSuccessNotification('Netlist copied to clipboard');
                })
                .catch(err => {
                    // Clipboard API often fails inside iframes without
                    // the "clipboard-write" permission – try fallbacks.
                    console.warn('[CopyNetlistToClipboardCommand] Clipboard API denied, trying fallback:', err);
                    this._copyToClipboardFallback(content);
                });
        } else {
            // Fallback to older method for browsers that don't support Clipboard API
            this._copyToClipboardFallback(content);
        }
    }

    /**
     * Fallback method for copying to clipboard using execCommand
     * @param {string} content - The content to copy
     * @private
     */
    _copyToClipboardFallback(content) {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        try {
            textArea.select();
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('[CopyNetlistToClipboardCommand] Netlist copied to clipboard (fallback method)');
                this._showSuccessNotification('Netlist copied to clipboard');
            } else {
                console.warn('[CopyNetlistToClipboardCommand] execCommand failed, showing copy dialog');
                this._showCopyDialog(content);
            }
        } catch (err) {
            console.warn('[CopyNetlistToClipboardCommand] Fallback copy failed, showing copy dialog:', err);
            this._showCopyDialog(content);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Last-resort fallback: show a modal dialog with the netlist text
     * pre-selected so the user can copy it manually (Ctrl+C / Cmd+C).
     * This is needed when the app runs inside an iframe that lacks
     * clipboard-write permission.
     * @param {string} content - The netlist text to display
     * @private
     */
    _showCopyDialog(content) {
        if (typeof document === 'undefined' || !document.body) return;

        // --- Overlay ---
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.45);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000;
        `;

        // --- Dialog ---
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #fff; border-radius: 8px;
            padding: 24px; width: 520px; max-width: 90vw;
            box-shadow: 0 8px 32px rgba(0,0,0,0.25);
            font-family: Arial, sans-serif;
        `;

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Copy Netlist';
        title.style.cssText = 'margin: 0 0 8px; font-size: 16px; color: #2c3e50;';

        // Description
        const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
        const shortcut = isMac ? '\u2318+C' : 'Ctrl+C';
        const desc = document.createElement('p');
        desc.textContent = `The netlist is shown below. Press ${shortcut} to copy it.`;
        desc.style.cssText = 'margin: 0 0 12px; font-size: 13px; color: #666;';

        // Textarea (read-only, pre-selected)
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.readOnly = true;
        textarea.style.cssText = `
            width: 100%; height: 160px;
            padding: 10px; font-family: monospace; font-size: 13px;
            border: 1px solid #ccc; border-radius: 4px;
            resize: vertical; box-sizing: border-box;
        `;

        // Button bar
        const btnBar = document.createElement('div');
        btnBar.style.cssText = 'display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;';

        const btnClose = document.createElement('button');
        btnClose.textContent = 'Close';
        btnClose.style.cssText = `
            padding: 8px 18px; border: 1px solid #ccc; border-radius: 4px;
            background: #fff; cursor: pointer; font-size: 13px;
        `;

        btnBar.append(btnClose);
        dialog.append(title, desc, textarea, btnBar);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Auto-select all text so user can immediately Ctrl+C / Cmd+C
        textarea.focus();
        textarea.select();

        // --- Cleanup helper ---
        const close = () => {
            if (overlay.parentNode) document.body.removeChild(overlay);
        };

        btnClose.addEventListener('click', close);

        // Esc key dismisses
        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                close();
                document.removeEventListener('keydown', onKeydown, true);
            }
        };
        document.addEventListener('keydown', onKeydown, true);

        // Click on overlay (outside dialog) dismisses
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }

    /**
     * Show success notification to user
     * @param {string} message - The message to display
     * @private
     */
    _showSuccessNotification(message) {
        this.notify(message, 'success');
    }

    /**
     * Show error notification to user
     * @param {string} message - The message to display
     * @private
     */
    _showErrorNotification(message) {
        this.notify(message, 'error');
    }
}
