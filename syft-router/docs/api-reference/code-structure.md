# Router Code Structure

Understand the generated router file structure and how to navigate and modify your router code.

## Generated Router Structure

When you create a router, the system generates this structure:

```
my-router/
├── server.py              # Main FastAPI server
├── chat_service.py         # Chat service implementation
├── search_service.py       # Search service implementation
├── spawn_services.py       # Service monitoring and health checks
├── pyproject.toml          # Python dependencies and metadata
├── run.sh                  # Router startup script
├── README.md               # Router-specific documentation
├── .env.example            # Environment variables template
├── logs/                   # Application logs
│   └── app.log
└── data/                   # Local data storage
    └── (vector database files)
```

## Core Files Explained

### 1. `server.py` - Main Application Entry Point

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your services
from chat_service import ChatService
from search_service import SearchService
from spawn_services import SpawnServices

# Create FastAPI app
app = FastAPI(
    title="My Router",
    description="AI-powered chat and search router",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
config = load_config()
chat_service = ChatService(config)
search_service = SearchService(config)
spawn_services = SpawnServices(config)

# Define endpoints
@app.post("/chat")
async def chat(request: ChatRequest):
    return await chat_service.chat(request.message)

@app.post("/search")
async def search(request: SearchRequest):
    return await search_service.search(request.query)

@app.get("/health")
async def health():
    return spawn_services.get_health_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2. `chat_service.py` - Chat Implementation

**Default Router:**
```python
import ollama
from typing import Optional

class ChatService:
    def __init__(self, config: dict):
        self.client = ollama.Client(
            host=config.get('ollama_host', 'http://localhost:11434')
        )
        self.model = config.get('model', 'llama2')
        self.conversations = {}  # Store conversation history
    
    async def chat(self, message: str, conversation_id: Optional[str] = None) -> str:
        try:
            # Get or create conversation history
            if conversation_id:
                messages = self.conversations.get(conversation_id, [])
                messages.append({'role': 'user', 'content': message})
            else:
                messages = [{'role': 'user', 'content': message}]
            
            # Call Ollama
            response = self.client.chat(
                model=self.model,
                messages=messages
            )
            
            assistant_message = response['message']['content']
            
            # Store conversation history
            if conversation_id:
                messages.append({'role': 'assistant', 'content': assistant_message})
                self.conversations[conversation_id] = messages
            
            return assistant_message
            
        except Exception as e:
            return f"Error: {str(e)}"
```

### 3. `search_service.py` - Search Implementation

**Default Router:**
```python
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any

class SearchService:
    def __init__(self, config: dict):
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=config.get('chroma_path', './data')
        )
        collection_name = config.get('collection_name', 'documents')
        self.collection = self.client.get_or_create_collection(collection_name)
    
    async def search(self, query: str, limit: int = 5) -> Dict[str, Any]:
        try:
            # Perform vector similarity search
            results = self.collection.query(
                query_texts=[query],
                n_results=limit
            )
            
            # Format results
            documents = []
            for i, doc in enumerate(results['documents'][0]):
                documents.append({
                    'content': doc,
                    'score': results['distances'][0][i] if 'distances' in results else 0.0,
                    'metadata': results['metadatas'][0][i] if 'metadatas' in results else {},
                    'id': results['ids'][0][i] if 'ids' in results else str(i)
                })
            
            return {
                'query': query,
                'results': documents,
                'total_results': len(documents)
            }
            
        except Exception as e:
            return {
                'query': query,
                'results': [],
                'total_results': 0,
                'error': str(e)
            }
    
    def add_documents(self, documents: List[str], metadatas: List[Dict] = None):
        """Add documents to the collection."""
        ids = [f"doc_{i}" for i in range(len(documents))]
        self.collection.add(
            documents=documents,
            metadatas=metadatas or [{}] * len(documents),
            ids=ids
        )
```

### 4. `spawn_services.py` - Service Monitoring

```python
import requests
import logging
from typing import Dict, Any

class SpawnServices:
    def __init__(self, config: dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get overall router health status."""
        return {
            'status': 'healthy' if self.all_services_healthy() else 'unhealthy',
            'services': {
                'chat': 'running' if self.check_chat_health() else 'stopped',
                'search': 'running' if self.check_search_health() else 'stopped'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def check_chat_health(self) -> bool:
        """Check if chat service is healthy."""
        try:
            # Default router: Check Ollama
            if self.config.get('router_type') == 'default':
                response = requests.get(
                    "http://localhost:11434/api/tags",
                    timeout=5
                )
                return response.status_code == 200
            
            # Custom router: Implement your health check
            else:
                # TODO: Check your chat service health
                # Example: Test connection to your LLM API
                # response = requests.get(f"{self.config['llm_url']}/health")
                # return response.status_code == 200
                return True  # Placeholder
                
        except Exception as e:
            self.logger.error(f"Chat health check failed: {e}")
            return False
    
    def check_search_health(self) -> bool:
        """Check if search service is healthy."""
        try:
            # Default router: Check ChromaDB
            if self.config.get('router_type') == 'default':
                # ChromaDB health check
                from search_service import SearchService
                search = SearchService(self.config)
                search.collection.count()  # Simple operation to test
                return True
            
            # Custom router: Check your vector database
            else:
                # TODO: Check your vector database health
                # Example for Weaviate:
                # response = requests.get(f"{self.config['weaviate_url']}/v1/meta")
                # return response.status_code == 200
                return True  # Placeholder - UNCOMMENT for custom routers
                
        except Exception as e:
            self.logger.error(f"Search health check failed: {e}")
            return False
    
    def all_services_healthy(self) -> bool:
        """Check if all enabled services are healthy."""
        services_enabled = self.config.get('services', ['chat', 'search'])
        
        if 'chat' in services_enabled and not self.check_chat_health():
            return False
        
        if 'search' in services_enabled and not self.check_search_health():
            return False
        
        return True
```

### 5. `pyproject.toml` - Dependencies and Metadata

```toml
[project]
name = "my-router"
version = "1.0.0"
description = "Custom AI router for chat and search"
requires-python = ">=3.9"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn>=0.24.0",
    "pydantic>=2.5.0",
    "requests>=2.31.0",
    
    # Default router dependencies
    "ollama>=0.1.7",           # For chat
    "chromadb>=0.4.15",        # For search
    
    # Add your custom dependencies here
    # "openai>=1.0.0",         # For OpenAI chat
    # "weaviate-client>=3.24.0", # For Weaviate search
    # "pinecone-client>=2.2.0",  # For Pinecone search
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[tool.ruff]
line-length = 88
target-version = "py39"

[tool.black]
line-length = 88
target-version = ['py39']
```

Modify the dependencies section to include packages for your specific LLM provider and vector database. The dev dependencies help maintain code quality.

### 6. `run.sh` - Startup Script

Shell script that sets up the Python environment, installs dependencies, and starts your router server.

```bash
#!/bin/bash
set -e

echo "Starting router: my-router"

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Set up Python virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -e .

# Custom router: Add your dependencies here
# pip install openai weaviate-client  # Example for custom dependencies

# Set up environment variables
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Default configurations
export ROUTER_NAME="my-router"
export ROUTER_PORT="${ROUTER_PORT:-8001}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"

# Create necessary directories
mkdir -p logs data

# Start the router
echo "Starting router on port $ROUTER_PORT..."
uvicorn server:app \
    --host 0.0.0.0 \
    --port $ROUTER_PORT \
    --log-level ${LOG_LEVEL,,} \
    --access-log \
    --log-config logging.conf
```

This script handles the complete startup process, from environment setup to server launch. Customize the environment variables and dependencies for your specific router.

## Configuration Management

### Environment Variables

Create a `.env` file for local configuration. This file stores sensitive API keys and router-specific settings.

```bash
# Router Configuration
ROUTER_NAME=my-router
ROUTER_PORT=8001
LOG_LEVEL=INFO

# Default Router Settings
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
CHROMA_PATH=./data
COLLECTION_NAME=documents

# Custom Router Settings (examples)
# OPENAI_API_KEY=sk-your-key-here
# WEAVIATE_URL=https://your-cluster.weaviate.network
# WEAVIATE_API_KEY=your-api-key
# PINECONE_API_KEY=your-pinecone-key
# PINECONE_ENVIRONMENT=us-west1-gcp
```

Never commit this file to version control as it contains sensitive API keys. Use `.env.example` as a template.

## Testing Your Router

### `test_router.py`

Basic integration tests to verify your router's endpoints are working correctly.

```python
import pytest
import requests
from typing import Dict, Any

class TestRouter:
    base_url = "http://localhost:8001"
    
    def test_health_endpoint(self):
        """Test that health endpoint is responding."""
        response = requests.get(f"{self.base_url}/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "services" in data
    
    def test_chat_endpoint(self):
        """Test chat functionality."""
        response = requests.post(
            f"{self.base_url}/chat",
            json={"message": "Hello, world!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
    
    def test_search_endpoint(self):
        """Test search functionality."""
        response = requests.post(
            f"{self.base_url}/search",
            json={"query": "test query", "limit": 3}
        )
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "results" in data
        assert "total_results" in data

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
```

Run these tests after making changes to ensure your router is functioning properly. Add more specific tests for your custom implementations.

## Development Workflow

1. **Create router** via dashboard
2. **Navigate to router directory** in your SyftBox
3. **Open in IDE** (VS Code, Cursor, etc.)
4. **Implement services** (chat_service.py, search_service.py)
5. **Add dependencies** (pyproject.toml, run.sh)
6. **Configure environment** (.env file)
7. **Test locally** (run.sh, then test endpoints)
8. **Monitor health** (spawn_services.py)
9. **Deploy and publish** via dashboard

---

**Next Steps**:
- [Custom Chat Router](../router-guides/custom-chat-router.md) for chat implementation
- [Custom Search Router](../router-guides/custom-search-router.md) for search implementation
- [Monitoring](../router-guides/monitoring.md) for health checks