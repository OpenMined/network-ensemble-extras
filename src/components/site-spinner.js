// components/site-spinner.js
class SiteSpinner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['size', 'color', 'thickness', 'speed'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const size = this.getAttribute('size') || '40px';
        const color = this.getAttribute('color') || 'var(--primary, #BB86FC)';
        const thickness = this.getAttribute('thickness') || '3px';
        const speed = this.getAttribute('speed') || '1s';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    text-align: center;
                }
                
                .spinner {
                    width: ${size};
                    height: ${size};
                    border: ${thickness} solid rgba(255, 255, 255, 0.1);
                    border-top: ${thickness} solid ${color};
                    border-radius: 50%;
                    animation: spin ${speed} linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Accessibility: Respect reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .spinner {
                        animation: none;
                        opacity: 0.7;
                    }
                    
                    .spinner::after {
                        content: '⏳';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: calc(${size} * 0.4);
                    }
                }
            </style>
            
            <div class="spinner" role="status" aria-label="Loading"></div>
        `;
    }
}

customElements.define('site-spinner', SiteSpinner);

// Utility functions for common loading patterns
window.LoadingUtils = {
    // Show spinner in element
    show(element, options = {}) {
        const spinner = document.createElement('loading-spinner');
        if (options.size) spinner.setAttribute('size', options.size);
        if (options.color) spinner.setAttribute('color', options.color);
        
        element.innerHTML = '';
        element.appendChild(spinner);
        if (options.text) {
            const text = document.createElement('p');
            text.textContent = options.text;
            text.style.marginTop = '0.5rem';
            text.style.color = 'var(--gray-light, #9CA3AF)';
            element.appendChild(text);
        }
    },
    
    // Hide spinner and restore content
    hide(element, content = '') {
        element.innerHTML = content;
    },
    
    // Show full-screen overlay
    showOverlay(text = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(23, 22, 29, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
        `;
        
        overlay.innerHTML = `
            <loading-spinner size="80px"></loading-spinner>
            <p style="margin-top: 1rem; font-size: 1.2rem; color: var(--light, #F3F4F6);">${text}</p>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    },
    
    // Hide full-screen overlay
    hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // Button loading state
    buttonLoading(button, loadingText = 'Loading...') {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                <loading-spinner size="16px" color="currentColor"></loading-spinner>
                ${loadingText}
            </span>
        `;
        
        return {
            stop: () => {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        };
    }
};
