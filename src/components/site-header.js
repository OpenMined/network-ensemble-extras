// components/site-header.js
class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["logo-src", "logo-text", "current-page"];
  }

  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  connectedCallback() {
    // Check for saved theme on initial load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' && !document.documentElement.hasAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const logoSrc = this.getAttribute("logo-src") || "";
    const logoText = this.getAttribute("logo-text") || "OpenMined";
    const currentPage = this.getAttribute("current-page") || "";
    const theme = this.getTheme();

    // Define theme-specific CSS variables
    const themeVars = {
      light: {
        '--header-bg': 'rgba(255, 255, 255, 0.95)',
        '--header-border': 'rgba(0, 0, 0, 0.08)',
        '--section-bg': '#F9FAFB',
        '--section-bg-alt': '#F3F4F6',
        '--card-border': '#E5E7EB',
        '--card-bg': '#FFFFFF',
        '--text-primary': '#17161D',
        '--text-secondary': '#4A5568',
        '--primary': '#6976AE',
        '--secondary': '#937098',
        '--glass-light': 'rgba(255, 255, 255, 0.8)',
        '--gray-light': '#9CA3AF',
        '--shadow': '0 1px 3px rgba(0,0,0,0.05)'
      },
      dark: {
        '--header-bg': 'rgba(46, 43, 59, 0.95)',
        '--header-border': 'rgba(255, 255, 255, 0.1)',
        '--section-bg': '#2E2B3B',
        '--section-bg-alt': '#17161D',
        '--card-border': '#4B5563',
        '--card-bg': '#2E2B3B',
        '--text-primary': '#ffffff',
        '--text-secondary': '#D1D5DB',
        '--primary': '#BB86FC',
        '--secondary': '#32d5e8',
        '--glass-light': 'rgba(23, 22, 29, 0.5)',
        '--gray-light': '#9CA3AF',
        '--shadow': '0 1px 3px rgba(0,0,0,0.3)'
      }
    };

    const currentThemeVars = themeVars[theme] || themeVars.light;

    // You can customize these social links as needed
    const socialLinks = [
      {
        href: "https://slack.openmined.org",
        title: "Slack",
        icon: "fab fa-slack",
      },
      {
        href: "https://openmined.org",
        title: "OpenMined",
        icon: "fas fa-globe",
      },
      {
        href: "https://twitter.com/openminedorg",
        title: "Twitter",
        icon: "fab fa-twitter",
      },
    ];

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :host {
          display: block;
          ${Object.entries(currentThemeVars).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
        
        header {
          background: var(--header-bg);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--header-border);
          box-shadow: var(--shadow);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo {
          width: 3rem;
          height: 3rem;
          border-radius: 8px;
          object-fit: contain;
        }

        .logo-text {
          color: var(--primary, #BB86FC);
          font-family: 'Rubik', sans-serif;
          font-size: 1.375rem;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }

        .logo-text:hover {
          opacity: 0.8;
        }
        
        .nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1.75rem;
        }
        
        .nav-links a {
          color: var(--text-secondary);
          font-family: 'Roboto', sans-serif;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9375rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .nav-links a:hover {
          background: var(--glass-light);
          color: var(--primary);
        }
        
        .nav-links a.active {
          background: var(--glass-light);
          color: var(--primary);
        }

        .social-icons {
          display: flex;
          gap: 1rem;
        }

        .social-icon {
          color: var(--gray-light, #9CA3AF);
          font-size: 1.25rem;
          transition: all 0.3s ease;
          padding: 0.5rem;
          border-radius: 6px;
          text-decoration: none;
        }

        .social-icon:hover {
          color: var(--secondary, #32d5e8);
          background: rgba(50, 213, 232, 0.1);
          transform: translateY(-2px);
        }
        
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .mobile-toggle:hover {
          background: var(--glass-light);
        }
        
        @media (max-width: 968px) {
            .header-left {
              gap: 1rem;
            }
            
            .nav-links {
              gap: 1rem;
            }
            
            .social-icons {
              gap: 0.5rem;
            }
        }
        
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block;
          }
          
          .header-content {
            flex-wrap: wrap;
          }
          
          .header-left {
            order: 1;
            flex: 1;
          }
          
          .mobile-toggle {
            order: 2;
          }
          
          .social-icons {
            order: 3;
          }
          
          .nav-links {
            order: 4;
            width: 100%;
            flex-direction: column;
            padding: 1rem 0;
            gap: 0.5rem;
            display: none;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            margin-top: 1rem;
            box-shadow: var(--shadow);
          }
          
          .nav-links.open {
            display: flex;
          }
          
          .nav-links a {
            padding: 1rem;
            text-align: center;
          }
        }
      </style>
        
      <header>
        <nav class="container">
          <div class="header-content">
            <div class="header-left">
              <a href="/" class="logo-container">
                ${
                  logoSrc
                    ? `<img src="${logoSrc}" alt="${logoText} Logo" class="logo" />`
                    : ""
                }
                <span class="logo-text">${logoText}</span>
              </a>
              <ul class="nav-links">
                <li><a href="/" ${
                  currentPage === "home" ? 'class="active"' : ""
                }>Home</a></li>
                <li><a href="/about.html" ${
                  currentPage === "about"
                    ? 'class="active"'
                    : ""
                }>About</a></li>
                <li><a href="/protocol.html" ${
                  currentPage === "protocol"
                    ? 'class="active"'
                    : ""
                }>Protocol</a></li>
                <li><a href="/for-publishers.html" ${
                  currentPage === "publishers"
                    ? 'class="active"'
                    : ""
                }>Syft for Publishers</a></li>
              </ul>
            </div>
              
            <button class="mobile-toggle" aria-label="Toggle navigation">
              <i class="fas fa-bars"></i>
            </button>
            
            <div class="social-icons">
              ${socialLinks
                .map(
                  (social) => `
                  <a
                    href="${social.href}"
                    title="${social.title}"
                    target="_blank"
                    rel="noopener"
                    class="social-icon"
                  >
                    <i class="${social.icon}"></i>
                  </a>
                `
                )
                .join("")
              }
            </div>
          </div>
        </nav>
      </header>
    `;
  }

  addEventListeners() {
    const toggle = this.shadowRoot.querySelector(".mobile-toggle");
    const navLinks = this.shadowRoot.querySelector(".nav-links");

    if (toggle) {
      toggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");

        // Toggle hamburger/close icon
        const icon = toggle.querySelector("i");
        if (navLinks.classList.contains("open")) {
          icon.className = "fas fa-times";
        } else {
          icon.className = "fas fa-bars";
        }
      });
    }

    // Listen for theme changes - bind once for proper removal
    this.boundHandleThemeChange = this.handleThemeChange.bind(this);
    window.addEventListener('themeChanged', this.boundHandleThemeChange);
  }

  handleThemeChange() {
    this.render();
    this.addEventListeners(); // Re-add event listeners after re-render
  }

  removeEventListeners() {
    const toggle = this.shadowRoot.querySelector(".mobile-toggle");
    if (toggle) {
      toggle.removeEventListener("click", this.toggleMobileMenu);
    }
    if (this.boundHandleThemeChange) {
      window.removeEventListener('themeChanged', this.boundHandleThemeChange);
    }
  }
}

customElements.define("site-header", SiteHeader);
