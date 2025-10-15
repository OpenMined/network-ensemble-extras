# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a static website project with no build system or package.json. All files are served directly.

**Development Server**: Use any static file server to serve the project:
```bash
# Using Python (if available)
python -m http.server 8000

# Using Node.js (if available)  
npx http-server .
```

## Architecture

### Core Structure
- **Static Website**: Pure HTML/CSS/JavaScript with no build tools or frameworks
- **Web Components**: Custom elements for reusable UI components (header, footer, etc.)
- **Theme System**: CSS custom properties with light/dark theme support via `data-theme` attribute
- **Multi-page Application**: Separate HTML files for different sections/audiences

### Key Components

**Web Components** (`src/components/`):
- `site-header.js`: Navigation with theme-aware styling and responsive mobile menu
- `site-footer.js`: Simple footer with copyright
- `back-to-top.js`: Scroll-to-top functionality  
- All components use Shadow DOM and observe theme changes

**Theme System** (`src/styles/main.css`):
- CSS custom properties define colors for light/dark themes
- Theme toggling via JavaScript sets `data-theme="dark"` on document element
- Components automatically re-render when theme changes via `themeChanged` event

**Form Integration** (`src/scripts/index.js`):
- HubSpot form integration with API submission
- Contact form handles submissions with success/error states
- Uses HubSpot tracking cookies for attribution

### Page Structure

**Main Pages**:
- `index.html`: Homepage with hero, problem statement, vision, and technology overview
- `about.html`: Manifesto and vision for Network-Sourced AI
- `protocol.html`: Comprehensive technical documentation and product hierarchy
- `for-publishers.html`: Publisher-focused content
- `for-organizations.html`: Content for organizations with sensitive data
- `chat.html`: Interactive demo/chat interface
- `syft-router/install.html`: Installation instructions

**Documentation Section** (`syft-sdk/`):
- Separate documentation site for SDK with its own styles
- Contains quickstart, tutorials, concepts, and API documentation
- Independent styling from main site

### Styling Architecture

**CSS Organization**:
- `main.css`: Global variables, theme system, base styles, reusable components
- `index.css`: Homepage-specific styles
- `docs.css`: Documentation page styles  
- `chat.css`: Chat interface styles

**Theme Implementation**:
- Light theme uses warm, accessible colors with high contrast
- Dark theme switches to purple/cyan palette
- All components respect theme via CSS custom properties
- Theme persistence via localStorage

### Content Strategy

The site targets three main audiences with dedicated pages:
1. **Publishers & Media**: Content protection and attribution
2. **AI Companies**: Access to diverse, legal data sources  
3. **Researchers & Institutions**: Sensitive data sharing with privacy

### Technical Considerations

**Performance**:
- Scroll performance optimization using requestAnimationFrame
- Passive event listeners for scroll events
- Minimal JavaScript footprint with no external dependencies

**Accessibility**:
- Semantic HTML structure
- ARIA labels on interactive elements
- Focus management for mobile menu
- High contrast color schemes in both themes

**Responsive Design**:
- Mobile-first approach with progressive enhancement
- Flexible grid systems using CSS Grid and Flexbox
- Responsive navigation that collapses on mobile devices