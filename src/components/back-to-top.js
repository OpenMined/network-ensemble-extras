// components/back-to-top.js
class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
  }

  static get observedAttributes() {
    return ['position', 'theme', 'show-after'];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  getTheme() {
    const theme = this.getAttribute('theme') || 'default';
    // const themes = {
    //   default: {
    //     background: 'var(--primary, #BB86FC)',
    //     color: 'var(--white, #FFFFFF)',
    //     hover: 'var(--primary-dark, #9D4EDD)'
    //   },
    //   secondary: {
    //     background: 'var(--secondary, #32d5e8)',
    //     color: 'var(--white, #FFFFFF)', 
    //     hover: 'var(--dark, #2E2B3B)'
    //   },
    //   dark: {
    //     background: 'var(--dark, #2E2B3B)',
    //     color: 'var(--light, #F3F4F6)',
    //     hover: 'var(--darker, #17161D)'
    //   },
    //   glass: {
    //     background: 'var(--glass, rgba(255, 255, 255, 0.1))',
    //     color: 'var(--light, #F3F4F6)',
    //     hover: 'var(--glass-border, rgba(255, 255, 255, 0.2))',
    //     backdrop: 'blur(10px)',
    //     border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))'
    //   }
    // };
    const themes = {
        default: {
            background: 'var(--primary, #BB86FC)',
            color: 'var(--white, #FFFFFF)',
            hover: 'var(--primary-dark, #f2bb5d)'
        },
        glass: {
            background: 'var(--glass, rgba(255, 255, 255, 0.1))',
            color: 'var(--light, #F3F4F6)',
            hover: 'var(--glass-border, rgba(255, 255, 255, 0.2))',
            backdrop: 'blur(10px)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))'
        }
    };
    return themes[theme] || themes.default;
  }

  getPosition() {
    const position = this.getAttribute('position') || 'bottom-right';
    const positions = {
      'bottom-right': { bottom: '2rem', right: '2rem' },
      'bottom-left': { bottom: '2rem', left: '2rem' },
      'bottom-center': { bottom: '2rem', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '2rem', right: '2rem' },
      'top-left': { top: '2rem', left: '2rem' }
    };
    return positions[position] || positions['bottom-right'];
  }

  render() {
    const theme = this.getTheme();
    const position = this.getPosition();
    const showAfter = this.getAttribute('show-after') || '300';

    // Convert position object to CSS
    const positionCSS = Object.entries(position)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :host {
          position: fixed;
          ${positionCSS};
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        :host(.visible) {
          opacity: 1;
          visibility: visible;
        }

        .back-to-top-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: ${theme.background};
          color: ${theme.color};
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          ${theme.backdrop ? `backdrop-filter: ${theme.backdrop};` : ''}
          ${theme.border ? `border: ${theme.border};` : ''}
        }

        .back-to-top-btn:hover {
          background: ${theme.hover};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .back-to-top-btn:active {
          transform: translateY(0);
        }

        .icon {
          transition: transform 0.2s ease;
        }

        .back-to-top-btn:hover .icon {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .back-to-top-btn {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }
      </style>

      <button class="back-to-top-btn" aria-label="Back to top" title="Back to top">
        <i class="fas fa-chevron-up icon"></i>
      </button>
    `;

    // Store showAfter value for scroll handler
    this.showAfterPixels = parseInt(showAfter);
  }

  addEventListeners() {
    // Listen for scroll events on the window
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Listen for click on the button
    const button = this.shadowRoot.querySelector('.back-to-top-btn');
    if (button) {
      button.addEventListener('click', this.scrollToTop);
    }
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.handleScroll);
    
    const button = this.shadowRoot.querySelector('.back-to-top-btn');
    if (button) {
      button.removeEventListener('click', this.scrollToTop);
    }
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > this.showAfterPixels) {
      this.classList.add('visible');
    } else {
      this.classList.remove('visible');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

customElements.define('back-to-top', BackToTop);
