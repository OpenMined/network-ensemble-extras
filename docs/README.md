# Syft NSAI Router Documentation

A comprehensive documentation website for the Syft NSAI Router platform, built with modern HTML, CSS, and JavaScript.

## 📖 Overview

This documentation website provides complete guides, tutorials, and reference materials for the Syft NSAI Router platform. It covers everything from basic setup to advanced customization for both router providers and clients.

## 🚀 Quick Start

### View Documentation

Simply open any of the HTML files in your web browser:

```bash
# Open the main documentation page
open docs/index.html

# Or start a local server (recommended)
cd docs
python -m http.server 8000
# Visit http://localhost:8000
```

### Using with Syft NSAI Router

1. **Copy to static directory** (for serving with the main application):
   ```bash
   cp -r docs/* backend/static/docs/
   ```

2. **Access via router**: Navigate to `http://localhost:8080/docs/` when running the router.

## 📁 Documentation Structure

```
docs/
├── index.html              # Main documentation homepage
├── getting-started.html    # Installation and setup guide
├── dashboard-guide.html    # Comprehensive dashboard tutorial
├── api-reference.html      # Complete API documentation
├── tutorials.html          # Step-by-step tutorials
└── README.md               # This file
```

## 📚 Documentation Pages

### 🏠 Homepage (`index.html`)
- **Overview**: Platform introduction and key features
- **Dual User Experience**: Provider vs Client modes
- **Architecture**: Platform components and structure
- **Quick Start**: One-command setup guide
- **Feature Highlights**: Router generation, chat services, search & RAG, monetization

### 🚀 Getting Started (`getting-started.html`)
- **Prerequisites**: Python 3.12+, uv, Bun
- **Installation**: Step-by-step setup process
- **Configuration**: Environment variables and custom ports
- **Troubleshooting**: Common issues and solutions
- **Verification**: Testing your installation

### 🎛️ Dashboard Guide (`dashboard-guide.html`)
- **Profile Onboarding**: Choosing Provider or Client mode
- **Navigation**: Header components and user interface
- **Provider Features**: 
  - Creating routers (Default vs Custom)
  - Managing router lifecycle
  - Publishing and monetization
  - Monitoring and status tracking
- **Client Features**:
  - Browsing published routers
  - Using the chat interface with multiple data sources
  - API integration guidance
- **Best Practices**: Tips for both providers and clients

### 📡 API Reference (`api-reference.html`)
- **Base Information**: URLs and authentication
- **Router Management API**: 
  - List, create, details, publish, delete endpoints
  - Request/response schemas
  - Query parameters and body formats
- **Router Service API**:
  - Chat endpoint with conversation history
  - Search endpoint with RAG capabilities
  - Health check and status monitoring
- **System API**: Username and SyftBox URL endpoints
- **Error Handling**: HTTP status codes and error response formats
- **SDK Examples**: Python and JavaScript integration code

### 🎓 Tutorials (`tutorials.html`)
- **Provider Tutorials**:
  - Creating your first router
  - Publishing and monetization setup
- **Client Tutorials**:
  - Using the chat interface
  - API integration in applications
- **Advanced Tutorials**:
  - Custom router development
  - Service implementation
- **Best Practices**: Tips for naming, pricing, monitoring, and documentation

## 🎨 Design Features

### Modern Styling
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Font Awesome**: Professional icons throughout the interface
- **Gradient Backgrounds**: Attractive visual elements
- **Interactive Elements**: Hover effects and smooth transitions

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Navigation**: Collapsible mobile menu
- **Grid Layouts**: Adaptive content organization
- **Typography**: Readable fonts and proper hierarchy

### User Experience
- **Smooth Scrolling**: Anchor link navigation
- **Copy-to-Clipboard**: Code examples can be copied
- **Syntax Highlighting**: Code blocks with proper formatting
- **Loading States**: Visual feedback for interactions

## 🔧 Customization

### Modifying Content

1. **Edit HTML files** directly for content changes
2. **Update styling** by modifying the `<style>` sections
3. **Add new pages** by creating additional HTML files and updating navigation

### Adding New Sections

1. Create new HTML file following the existing structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <!-- Copy head section from existing pages -->
   </head>
   <body>
       <!-- Copy navigation section -->
       <!-- Add your content -->
       <!-- Copy footer section -->
   </body>
   </html>
   ```

2. Update navigation in all existing files:
   ```html
   <a href="your-new-page.html" class="nav-link text-gray-700 font-medium">New Page</a>
   ```

### Styling Customization

The documentation uses a consistent color scheme:
- **Primary**: Indigo (`#4f46e5`)
- **Secondary**: Teal (`#14b8a6`) 
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Error**: Red (`#ef4444`)

## 🚀 Deployment Options

### 1. Static File Hosting
Deploy to any static hosting service:
- **GitHub Pages**: Push to a `gh-pages` branch
- **Netlify**: Drag and drop the `docs/` folder
- **Vercel**: Connect your repository
- **S3 + CloudFront**: Upload to AWS S3

### 2. Integration with Router
Copy documentation to the router's static directory:
```bash
# Copy documentation to backend static directory
cp -r docs/* backend/static/docs/

# Access at http://localhost:8080/docs/
```

### 3. Local Development Server
For development and testing:
```bash
# Python
cd docs && python -m http.server 8000

# Node.js
cd docs && npx serve .

# PHP
cd docs && php -S localhost:8000
```

## 🛠️ Development

### Prerequisites for Editing
- Text editor with HTML/CSS/JS support
- Modern web browser for testing
- Optional: Live reload server for development

### File Structure
Each page follows a consistent structure:
```html
<!-- Navigation (consistent across all pages) -->
<nav>...</nav>

<!-- Page-specific header -->
<div class="bg-indigo-600">...</div>

<!-- Main content sections -->
<div class="bg-white">...</div>
<div class="bg-gray-50">...</div>

<!-- Footer (consistent across all pages) -->
<footer>...</footer>

<!-- JavaScript for interactivity -->
<script>...</script>
```

### Best Practices
- **Consistency**: Use the same navigation and footer across all pages
- **Accessibility**: Include proper ARIA labels and semantic HTML
- **Performance**: Optimize images and minimize CSS/JS
- **SEO**: Use proper meta tags and heading hierarchy
- **Mobile**: Test on various screen sizes

## 🔍 Content Guidelines

### Writing Style
- **Clear and Concise**: Use simple language and short sentences
- **Step-by-Step**: Break complex processes into numbered steps
- **Examples**: Include code examples and practical use cases
- **Visual Aids**: Use icons, colors, and spacing for clarity

### Code Examples
- **Syntax Highlighting**: Use proper code blocks with language specification
- **Copy-to-Clipboard**: Include copy buttons for longer code snippets
- **Comments**: Add explanatory comments in code examples
- **Testing**: Verify all code examples work correctly

### Screenshots and Diagrams
- **High Quality**: Use clear, high-resolution images
- **Annotations**: Add arrows and callouts to highlight important elements
- **Consistent Style**: Maintain visual consistency across all diagrams
- **Alt Text**: Include descriptive alt text for accessibility

## 🤝 Contributing

To contribute to the documentation:

1. **Fork** the repository
2. **Create** a feature branch for your changes
3. **Edit** the relevant HTML files
4. **Test** your changes in a browser
5. **Submit** a pull request with a clear description

### Contribution Guidelines
- Follow the existing HTML structure and styling
- Test on multiple browsers and screen sizes
- Update navigation links when adding new pages
- Use semantic HTML and proper accessibility attributes
- Include examples and practical use cases

## 📞 Support

- **Issues**: Report documentation bugs or improvements
- **Discussions**: Ask questions and share feedback
- **Community**: Join the OpenMined community for support
- **Updates**: Documentation is updated with each platform release

## 📄 License

This documentation is part of the Syft NSAI Router project and follows the same licensing terms as the main project.

---

<div align="center">

**Built with ❤️ by the OpenMined Community**

[OpenMined](https://www.openmined.org/) • [SyftBox](https://syftbox.net/) • [GitHub](https://github.com/openmined)

</div> 