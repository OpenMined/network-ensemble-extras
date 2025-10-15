# Syft LLM Router Documentation

Welcome to the Syft LLM Router documentation. This guide will help you understand, create, and deploy LLM routers on the SyftBox platform.

## Table of Contents

### Getting Started
- [What is a Router?](what-is-a-router.md) - Understand router concepts and capabilities
- [Quick Start](quickstart.md) - Get up and running in 5 minutes

### Router Creation Guides
- [Default Router](router-guides/default-router.md) - Create a batteries-included router
- [Custom Chat Router](router-guides/custom-chat-router.md) - Build custom chat services
- [Custom Search Router](router-guides/custom-search-router.md) - Build custom search/RAG services
- [Code Structure](router-guides/code-structure.md) - Generated router file structure and development workflow
- [Online/Offline Status](router-guides/online-offline.md) - Router states and availability monitoring

### API Reference
- [Endpoints](api-reference/endpoints.md) - `/chat` and `/search` endpoints with SyftBox relay system
- [Authentication](api-reference/authentication.md) - Guest vs authenticated usage
- [Accounting & Pricing](api-reference/accounting.md) - Usage tracking, billing, and monetization

---

## Quick Navigation

**New to routers?** Start with [What is a Router?](what-is-a-router.md)

**Ready to build?** Jump to [Quick Start](quickstart.md)

**Need API docs?** Check [Endpoints](api-reference/endpoints.md) and [Authentication](api-reference/authentication.md)

**Want to customize?** See [Custom Chat Router](router-guides/custom-chat-router.md) or [Custom Search Router](router-guides/custom-search-router.md)

## 📁 Current Documentation Structure

```
docs/
├── README.md                    # This documentation overview
├── quickstart.md               # 5-minute setup guide
├── what-is-a-router.md         # Router concepts and capabilities
├── api-reference/
│   ├── accounting.md           # Usage tracking and billing
│   ├── authentication.md       # Guest vs authenticated access
│   └── endpoints.md            # Chat/search API endpoints
├── router-guides/
│   ├── code-structure.md       # Generated router file structure
│   ├── custom-chat-router.md   # Custom chat implementation
│   ├── custom-search-router.md # Custom search/RAG services
│   ├── default-router.md       # Batteries-included setup
│   └── online-offline.md       # Router status monitoring
├── tutorial.html              # Interactive tutorial (HTML)
└── tutorials.html             # Additional tutorials (HTML)
```

## 📚 Documentation Pages

### 🎯 Core Concepts

#### [What is a Router?](what-is-a-router.md)
- **Router Services**: Chat and Search capabilities explained
- **Router Types**: Default (batteries-included) vs Custom (bring-your-own)
- **Monetization**: Per-request pricing and usage analytics
- **Use Cases**: Personal AI assistant, secure monetization, research collaboration

#### [Quick Start](quickstart.md)
- **Prerequisites**: Python 3.12+, uv, Bun
- **One-Command Setup**: Get running in 5 minutes
- **First Router**: Create and test your first router
- **Troubleshooting**: Common setup issues and solutions

### 🛠️ Router Creation

#### [Default Router](router-guides/default-router.md)
- **Batteries Included**: Pre-configured Ollama (chat) + ChromaDB (search)
- **Minimal Setup**: Drag-and-drop files for instant AI
- **Local Processing**: Perfect for getting started quickly
- **Testing**: Verify chat and search functionality

#### [Custom Chat Router](router-guides/custom-chat-router.md)
- **Bring Your Own LLM**: OpenAI, Anthropic, local models
- **Full Control**: Custom conversation flows and prompts
- **Implementation Guide**: Complete code walkthrough
- **Integration Examples**: Connect to existing infrastructure

#### [Custom Search Router](router-guides/custom-search-router.md)
- **Vector Database Integration**: Weaviate, Pinecone, Qdrant
- **Custom Ranking**: Specialized retrieval strategies
- **RAG Services**: Combine multiple data sources
- **Production Ready**: Enterprise and high-scale deployments

#### [Code Structure](router-guides/code-structure.md)
- **Generated Files**: server.py, chat_service.py, search_service.py
- **Configuration**: Environment variables and dependencies
- **Testing**: Integration tests and development workflow
- **Deployment**: Production considerations

#### [Online/Offline Status](router-guides/online-offline.md)
- **Status States**: Online, Degraded, Offline, Unknown
- **Health Monitoring**: Automatic status detection
- **Implications**: How status affects request routing
- **Configuration**: Monitoring intervals and thresholds

### 🌐 API Reference

#### [Endpoints](api-reference/endpoints.md)
- **SyftBox Relay**: Secure communication without firewalls
- **Chat Endpoint**: Conversational AI through relay system
- **Search Endpoint**: Document search and RAG capabilities
- **Health Checks**: Status monitoring and diagnostics
- **SDK Integration**: SyftBoxSDK for easier development

#### [Authentication](api-reference/authentication.md)
- **Guest Mode**: Open access with rate limits
- **Authenticated Mode**: Token-based access with tracking
- **Access Tokens**: Automatic token management
- **Benefits**: Higher limits and conversation history

#### [Accounting & Pricing](api-reference/accounting.md)
- **Usage Tracking**: Monitor requests, tokens, performance
- **Billing Integration**: OpenMined's hosted accounting service
- **Pricing Models**: Per-request pricing (per-token coming)
- **Payment Flow**: Conditional charging for successful requests only

## 🚀 Getting Started

### Prerequisites
- [Python 3.12+](https://www.python.org/)
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [Bun](https://bun.sh/) (JavaScript runtime)

### Quick Setup
```bash
# Clone and start everything
git clone <repository-url>
cd syft-llm-router
./run.sh
```

### First Router
1. **Access Dashboard**: Open http://localhost:8080
2. **Choose Profile**: Provider (create) or Client (use)
3. **Create Router**: Click "Create Router" → Default for quick start
4. **Test**: Send a message to verify it's working

## 🏗️ Architecture

### Router Types
- **Default Router**: Batteries-included with Ollama + ChromaDB
- **Custom Router**: Bring your own LLM/vector database

### Communication
- **SyftBox Relay**: Secure messaging without opening firewalls
- **Local Access**: Direct HTTP for development and testing
- **Authentication**: Guest mode or token-based access

### Services
- **Chat Service**: Conversational AI with history tracking
- **Search Service**: Vector similarity search and RAG
- **Health Monitoring**: Automatic status detection and reporting

## 💻 Development Workflow

### Router Development
1. **Create Router**: Use dashboard to generate template
2. **Navigate to Code**: Find router in `~/SyftBox/apps/router-name/`
3. **Implement Services**: Fill in chat_service.py and search_service.py
4. **Test Locally**: Verify endpoints work via dashboard or API
5. **Publish**: Make router available to network users

### Code Examples

#### Testing Chat Endpoint
```bash
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is machine learning?",
    "suffix-sender": "true",
    "timeout": "5000",
    "x-syft-from": "guest@syftbox.net",
    "x-syft-url": "syft://your-email@example.com/app_data/my_router/rpc/chat"
  }'
```

#### Testing Search Endpoint  
```bash
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning concepts",
    "suffix-sender": "true", 
    "timeout": "5000",
    "x-syft-from": "guest@syftbox.net",
    "x-syft-url": "syft://your-email@example.com/app_data/my_router/rpc/search"
  }'
```

## 🔧 Troubleshooting

### Common Issues
- **Port conflicts**: Change `SYFTBOX_ASSIGNED_PORT` in environment
- **Dependencies**: Run `rm -rf .venv && ./run.sh` to reinstall
- **Ollama not running**: Start with `ollama serve`
- **ChromaDB issues**: Check `data/` directory permissions
- **Network issues**: Verify SyftBox relay connectivity

### Monitoring
- **Router Logs**: Check `~/SyftBox/apps/router-name/logs/app.log`
- **Health Status**: Monitor via dashboard or `/health` endpoint
- **Usage Analytics**: View request counts and performance metrics

## 🤝 Contributing

### Documentation Updates
1. **Edit Markdown**: Update relevant `.md` files in `docs/`
2. **Test Changes**: Verify links and formatting work correctly  
3. **Update README**: Reflect any structural changes here
4. **Submit PR**: Include clear description of changes

### Content Guidelines
- **Clear Examples**: Include working code samples
- **Step-by-Step**: Break complex processes into numbered steps
- **Current Info**: Ensure all links and commands are up-to-date
- **Cross-References**: Link related sections appropriately

## 📄 License

This documentation is part of the Syft NSAI Router project and follows the same licensing terms as the main project.

---

<div align="center">

**Built with ❤️ by the OpenMined Community**

[OpenMined](https://www.openmined.org/) • [SyftBox](https://syftbox.net/) • [GitHub](https://github.com/openmined)

</div> 