# What is a Router?

A **Syft Router** is a service that runs on SyftBox, enabling data owners to configure local AI capabilities and publish them to the network.

Routers are discoverable through their metadata and accessible via standardized endpoints for LLM chat generation and document search. Think of it as your personal AI service that you can create from your own data, share with others, and even monetize through flexible policies.

## Core Concepts

### Router Services
A router acts as a bridge between network users and your private assets (data or models). Through a simple, unified specification, users can discover and access assets on the network that would otherwise be unavailable. 

**Supported service types:**
- **Chat Services**: Conversational AI powered by your locally or remotely hosted LLMs
- **Search Services**: Document retrieval returning the most relevant snippets (e.g., top-5 results)

### Two Types of Routers

To accommodate both new and experienced users, there are two router types:

#### 1. Default Router (Batteries Included)
- **Chat service**: Pre-configured with Ollama for local LLM hosting
- **Search service**: Built-in ChromaDB for vector storage and retrieval
- **Minimal setup**: Simply drag-and-drop your files to expose them instantly
- **Perfect for**: Getting started quickly or local-only use cases

#### 2. Custom Router (Bring Your Own Infrastructure)

For users with existing infrastructure who need more control:
- **Generated template**: When created, provides a code template with placeholder methods
- **Flexible integration**: Template handles user request routing to your existing servers
- **Your choice of tools**: Connect your own vector databases (Weaviate, Pinecone, Qdrant) or models (OpenAI, Anthropic, OpenRouter, etc.)
- **Production ready**: Designed for enterprise and high-scale deployments

## Router Capabilities

### Chat Service
```
User: "What's the weather like?"
Router: "Good evening! It's partly cloudy tonight with temperatures around 12°C. 
         Tomorrow, expect mild conditions with a mix of sun and clouds and highs near 18°C."
```
Queries are processed through your chosen LLM and responses are returned. This can be a standalone language model or a RAG (Retrieval-Augmented Generation) system that combines your documents with AI generation.

### Search Service
```
User: "Find documents about machine learning"
Router: 
> **Source**: Document A
> "Machine learning is a subfield of AI that focuses on algorithms capable of 
> improving automatically through experience... data-driven models are trained 
> using labeled or unlabeled datasets to recognize patterns and make predictions..."
> **Confidence:** 0.92

> **Source**: Document A  
> "Recent advances in deep learning techniques have enabled systems to outperform 
> humans in image and speech recognition tasks. These methods rely heavily on 
> large-scale neural networks..."
> **Confidence:** 0.87

> **Source**: Document B
> "Applications of machine learning span multiple industries — from finance to 
> healthcare. For example, predictive maintenance uses ML algorithms to detect 
> equipment failures before they occur..."
> **Confidence:** 0.83
```

### Monetization Policies
You can set pricing per request. This way you can revenue whenever users access your AI capabilities or data, without giving it away.

### Usage Analytics
You can monitor your router's performance, track user engagement, and optimize based on real usage patterns across the network.

## Why Use Syft Routers?

- **⚡ Quick Setup**: You can create your personalized AI assistant in under 5 minutes

- **🔒 Secure Monetization**: You can generate revenue from your data without exposing the raw content

- **🎓 Empower Research**: Enable academic researchers to advance critical questions with your unique insights

- **🌐 Federated AI**: With attribution-based control, collaborative improvements lead to genuinely more capable models for everyone

---

**Next Steps**: Ready to create your first router? Check out the [Quick Start](quickstart.md) guide.