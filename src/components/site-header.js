// components/site-header.js
class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["logo-src", "logo-text", "current-page"];
  }

  // Create static stylesheet that can be shared across instances
  static getStyleSheet() {
    if (!this.styleSheet) {
      this.styleSheet = new CSSStyleSheet();
      this.styleSheet.replaceSync(`
        header {
          background: linear-gradient(135deg, var(--section-bg), var(--section-bg-alt));
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--card-border);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
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
          font-size: 1.5rem;
          font-weight: 400;
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
          gap: 0rem;
        }
        
        .nav-links a {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 4px;
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

        .header-icons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          color: var(--gray-light, #9CA3AF);
          font-size: 1.25rem;
          transition: all 0.3s ease;
          padding: 0.5rem;
          border-radius: 6px;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .header-icon:hover {
          color: var(--secondary, #32d5e8);
          background: rgba(50, 213, 232, 0.1);
          transform: translateY(-2px);
        }

        /* Theme toggle specific styles */
        .theme-toggle {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          border-radius: 6px;
          overflow: hidden;
        }

        .theme-toggle i {
          position: absolute;
          transition: all 0.4s ease;
        }

        .theme-toggle .fa-sun {
          opacity: 0;
          transform: rotate(180deg) scale(0.5);
        }

        .theme-toggle .fa-moon {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        /* Dark theme styles for toggle */
        :host([data-theme="dark"]) .theme-toggle .fa-sun {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        :host([data-theme="dark"]) .theme-toggle .fa-moon {
          opacity: 0;
          transform: rotate(180deg) scale(0.5);
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
          
          .header-icons {
            gap: 0.5rem;
          }
        }
        
        @media (max-width: 1070px) {
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
          
          .header-icons {
            order: 3;
            width: 100%;
            justify-content: center;
            justify-content: space-evenly;
            display: none;
            padding: 1rem 0;
            background: var(--section-bg);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            margin-top: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header-icons.open {
            display: flex;
          }

          .nav-links {
            order: 4;
            width: 100%;
            flex-direction: column;
            padding: 1rem 0;
            gap: 0.5rem;
            display: none;
            border-radius: 8px;
            margin-top: 1rem;
          }
          
          .nav-links.open {
            display: flex;
          }
          
          .nav-links a {
            padding: 1rem;
            display: flex;
            text-align: center;
          }
        }
      `);
    }
    return this.styleSheet;
  }

  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  createThemeStyleSheet(themeVars) {
    const themeSheet = new CSSStyleSheet();
    themeSheet.replaceSync(`
      :host {
        display: block;
        ${Object.entries(themeVars).map(([key, value]) => `${key}: ${value};`).join('\n        ')}
      }
    `);
    return themeSheet;
  }

  connectedCallback() {
    // Check for saved theme preference on component load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    this.render();
    // Note: addEventListeners() is now called at the end of render()
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update the host attribute for CSS targeting
    this.setAttribute('data-theme', newTheme);
    
    // Dispatch theme change event for other components
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: newTheme } 
    }));
    
    // Update theme variables without full re-render
    this.updateThemeStyles(newTheme);
  }

  updateThemeStyles(theme) {
    const themeVars = {
      light: {
        '--section-bg': '#F9FAFB',
        '--section-bg-alt': '#F3F4F6',
        '--card-border': '#E5E7EB',
        '--text-primary': '#17161D',
        '--primary': '#6976AE',
        '--secondary': '#937098',
        '--glass-light': 'rgba(255, 255, 255, 0.8)',
        '--gray-light': '#9CA3AF'
      },
      dark: {
        '--section-bg': '#2E2B3B',
        '--section-bg-alt': '#17161D',
        '--card-border': '#4B5563',
        '--text-primary': '#ffffff',
        '--primary': '#BB86FC',
        '--secondary': '#32d5e8',
        '--glass-light': 'rgba(255, 255, 255, 0.1)',
        '--gray-light': '#9CA3AF'
      }
    };

    const currentThemeVars = themeVars[theme] || themeVars.light;
    
    // Update only the theme stylesheet without destroying DOM
    this.shadowRoot.adoptedStyleSheets = [
      SiteHeader.getStyleSheet(),
      this.createThemeStyleSheet(currentThemeVars)
    ];
  }

  render() {
    const logoSrc = this.getAttribute("logo-src") || "";
    const logoText = this.getAttribute("logo-text") || "OpenMined";
    const currentPage = this.getAttribute("current-page") || "";
    const theme = this.getTheme();

    // Update host attribute for CSS targeting
    this.setAttribute('data-theme', theme);

    // Define theme-specific CSS variables
    const themeVars = {
      light: {
        '--section-bg': '#F9FAFB',
        '--section-bg-alt': '#F3F4F6',
        '--card-border': '#E5E7EB',
        '--text-primary': '#17161D',
        '--primary': '#6976AE',
        '--secondary': '#937098',
        '--glass-light': 'rgba(255, 255, 255, 0.8)',
        '--gray-light': '#9CA3AF'
      },
      dark: {
        '--section-bg': '#2E2B3B',
        '--section-bg-alt': '#17161D',
        '--card-border': '#4B5563',
        '--text-primary': '#ffffff',
        '--primary': '#BB86FC',
        '--secondary': '#32d5e8',
        '--glass-light': 'rgba(255, 255, 255, 0.1)',
        '--gray-light': '#9CA3AF'
      }
    };

    const currentThemeVars = themeVars[theme] || themeVars.light;

    // Apply stylesheets to shadow root
    this.shadowRoot.adoptedStyleSheets = [
      SiteHeader.getStyleSheet(),
      this.createThemeStyleSheet(currentThemeVars)
    ];

    const headerLinks = [
      {
        type: "theme-toggle",
        title: "Toggle dark mode",
        icon: "fas fa-sun", // We'll handle both icons in the template
      },
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
              <button class="mobile-toggle" aria-label="Toggle navigation">
                <i class="fas fa-bars"></i>
              </button>
              <ul class="nav-links">
                <li><a href="/" ${
                  currentPage === "home" ? 'class="active"' : ""
                }>Home</a></li>
                <li><a href="/for-publishers.html" ${
                  currentPage === "publishers"
                    ? 'class="active"'
                    : ""
                }>For Publishers</a></li>
                <li><a href="/sensitive-assets.html" ${
                  currentPage === "sensitive-assets"
                    ? 'class="active"'
                    : ""
                }>For Sensitive Assets</a></li>
                <li><a href="/docs.html" ${
                  currentPage === "docs"
                    ? 'class="active"'
                    : ""
                }>About Technology</a></li>
              </ul>
            </div>
            
            <div class="header-icons">
              ${headerLinks.map((headerLink) => {
                if (headerLink.type === "theme-toggle") {
                  return `
                    <button class="header-icon theme-toggle" aria-label="${headerLink.title}">
                      <i class="fas fa-sun"></i>
                      <i class="fas fa-moon"></i>
                    </button>
                  `;
                } else {
                  return `
                    <a
                      href="${headerLink.href}"
                      title="${headerLink.title}"
                      target="_blank"
                      rel="noopener"
                      class="header-icon"
                    >
                      <i class="${headerLink.icon}"></i>
                    </a>
                  `;
                }
              }).join("")}
            </div>
          </div>
        </nav>
      </header>
    `;

    // Re-attach event listeners after DOM recreation
    this.addEventListeners();
  }

  addEventListeners() {
    const toggle = this.shadowRoot.querySelector(".mobile-toggle");
    const navLinks = this.shadowRoot.querySelector(".nav-links");
    const headerIcons = this.shadowRoot.querySelector(".header-icons");
    const themeToggle = this.shadowRoot.querySelector(".theme-toggle");

    // Store bound function references for proper cleanup
    if (toggle) {
      this.mobileToggleHandler = () => {
        navLinks.classList.toggle("open");
        headerIcons.classList.toggle("open");

        // Toggle hamburger/close icon
        const icon = toggle.querySelector("i");
        if (navLinks.classList.contains("open")) {
          icon.className = "fas fa-times";
        } else {
          icon.className = "fas fa-bars";
        }
      };
      toggle.addEventListener("click", this.mobileToggleHandler);
    }

    // Theme toggle
    if (themeToggle) {
      this.themeToggleHandler = () => {
        this.toggleTheme();
      };
      themeToggle.addEventListener("click", this.themeToggleHandler);
    }

    // Listen for theme changes (bind once and store reference)
    if (!this.boundHandleThemeChange) {
      this.boundHandleThemeChange = this.handleThemeChange.bind(this);
    }
    document.addEventListener('themeChanged', this.boundHandleThemeChange);
  }

  handleThemeChange() {
    const theme = this.getTheme();
    this.setAttribute('data-theme', theme);
    this.updateThemeStyles(theme);
  }

  removeEventListeners() {
    // Store references to bound functions for proper cleanup
    if (this.mobileToggleHandler) {
      const toggle = this.shadowRoot.querySelector(".mobile-toggle");
      if (toggle) {
        toggle.removeEventListener("click", this.mobileToggleHandler);
      }
    }
    
    if (this.themeToggleHandler) {
      const themeToggle = this.shadowRoot.querySelector(".theme-toggle");
      if (themeToggle) {
        themeToggle.removeEventListener("click", this.themeToggleHandler);
      }
    }
    
    if (this.boundHandleThemeChange) {
      document.removeEventListener('themeChanged', this.boundHandleThemeChange);
    }
  }
}

customElements.define("site-header", SiteHeader);