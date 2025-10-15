# Default Router Guide

In this tutorial, we present the steps to create a "batteries-included" router - a router that is not only responsible to interface with the network, but also spawn any stack you might need to run alongside it. All you need to bring will be the data you want to process through it.

## What is a Default Router?

A Default Router comes with pre-packaged components for ease of use:
- **🤖 Chat Service**: Pre-configured with Ollama for local LLM hosting
- **🔍 Search Service**: Built-in ChromaDB for vector storage and retrieval
- **📊 Monitoring**: Health checks and status tracking

Perfect for getting started quickly or local-only use cases without managing external infrastructure.

## Creating a Default Router

Prerequisites: ensure you have installed Syft Router.

### Step 1: Access the Dashboard
1. Open http://localhost:8080 or navigate to it within SyftUI.
2. Choose "Provider" profile if first time
3. Click "Create Router"

### Step 2: Configure Router

1. Configure router's metadata, such as `name` or `summary`. Keep the `summary` short and include in the long-form markdown `description` any further details. 

2. For the router type, select `Default`

3. Choose the services you want to support. 
*Note: If you have some data and want a lightweight setup, `Search` should suffice.*


### Step 3: Router Generation
The system automatically:
1. 📁 Creates router directory under `SyftBox/apps`
2. 🐍 Generates Python service files within that directory
3. 📦 Installs Ollama and ChromaDB dependencies
4. 🚀 Starts the router services

Here, there's nothing to do - just verify that upon generation, you can see the directory created/ the app visible in SyftUI. Let's explore the code briefly, so you know what it does.

## Generated Structure

```
my-router/
├── server.py            # Main FastAPI server
├── chat_service.py      # Ollama chat implementation (if chat selected, otherwise Not Implemented)
├── search_service.py    # ChromaDB search (if search selected, otherwise Not Implemented)
├── spawn_services.py    # Service monitoring
├── pyproject.toml       # Dependencies
├── run.sh               # Startup script
└── data/                # ChromaDB storage
```

## Add your first files [Search only]
If you checked `Search`, you can start adding your files to the AI assistant. 

1. Check under `SyftBox/apps` for an app called `local-rag`
2. Navigate to its UI once spotted
3. Select the file paths you want to process and give it a tiny bit of time to do it!


## Publishing Your Router

1. **Test thoroughly**: Ensure chat and search work
2. **Add metadata**: Go to router details → "Publish"
3. **Set pricing**: Configure per-request
4. **Publish**: Make available to other users

```
Summary: "AI assistant with document search"
Description: "Powered by Llama2 and ChromaDB"
Tags: ["chat", "search", "llama2"]
Pricing:
  Chat: $0.01 per request
  Search: $0.005 per request
```

## Default Services

### Test your Chat Service (Ollama)

To ensure everything is working, we recommend you to run this test.

```python
# Automatically configured
from ollama import Client

client = Client(host='http://localhost:11434')
response = client.chat(
    model='llama2',
    messages=[{'role': 'user', 'content': message}]
)
```

### Test your Search Service (ChromaDB)

To ensure everything is working, we recommend you to run this test.

```python
# Automatically configured  
import chromadb

client = chromadb.PersistentClient(path="./data")
collection = client.get_or_create_collection("documents")
results = collection.query(query_texts=[query], n_results=5)
```

## Testing Your Router (as the network does!)

### Via Dashboard
1. Go to router list
2. Select your router from the dropown list
3. Send test message: "Hello!"
4. Verify response from Ollama

### Via API
```bash
# Test chat endpoint
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{ \
    "message": "What is machine learning?", \
    "suffix-sender": "true", \
    "timeout": "5000", \
    "x-syft-from": "guest@syftbox.net", \
    "x-syft-url": "syft://<your_email>/app_data/my_router/rpc/chat" \
  }'
```
# Test search endpoint

```bash
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{ \
    "query": "machine learning concepts", \
    "suffix-sender": "true", \
    "timeout": "5000", \
    "x-syft-from": "guest@syftbox.net", \
    "x-syft-url": "syft://<your_email>/app_data/my_router/rpc/search" \
  }'
```

## Monitoring & Maintenance

The existing implementation checks on the status of the router frequently and shows it in the UI - so you don't have to worry further. 

To see what's your router is doing when it's misbehaving, check out the logs in SyftUI or via:

### Logs
```bash
# View router logs
tail -f ~/syftbox/apps/my-chat-bot/logs/app.log

# Common issues
- Ollama not running: Start with `ollama serve`
- ChromaDB issues: Check data/ directory permissions
- Port conflicts: Change port in run.sh
```

---

**Next Steps**: 
- [Custom Chat Router](custom-chat-router.md) for advanced chat features
- [Custom Search Router](custom-search-router.md) for external vector DBs
