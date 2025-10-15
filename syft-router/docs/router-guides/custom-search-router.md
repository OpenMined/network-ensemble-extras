# Custom Search Router Guide

Connect your existing vector database to your router and make its powerful search services available to users of the SyftBox network. This guide walks you through integrating your own infrastructure while keeping full control over your data and search capabilities. 

## What is a Custom Search Router?

A Custom Search Router is perfect for users who already have vector databases running and want to keep using their existing infrastructure. Instead of starting from scratch, you're bringing your own search capabilities to the SyftBox network while maintaining full control.

This approach is also fantastic for customizing your service offering. You can implement specialized retrieval strategies, custom ranking algorithms, or even combine multiple data sources into a single search experience.

## Creating a Custom Search Router

### Step 1: Generate Template
First, let's create the router template through the SyftBox dashboard:
1. Dashboard → "Create Router"
2. Name: `my-vector-search` (or whatever makes sense for your use case)
3. Type: **Custom** ✓ (this gives you full control over the implementation)
4. Services: **Search Service** ✓ (we're focusing on search capabilities here)
5. Click "Create"

### Step 2: Project Structure
Once created, you'll see this structure in your SyftBox apps directory:
```
my-vector-search/
├── server.py            # Main FastAPI server (handles routing)
├── search_service.py    # Template for your custom implementation
├── spawn_services.py    # Monitors service health and status
├── pyproject.toml       # Where you'll add your vector DB dependencies
└── run.sh               # Script that starts everything up
```

## Implementation Walkthrough

### Step 3: Open Your Router Project
Now let's dive into the code. Navigate to your router directory and open it in your favorite editor:
```bash
# Navigate to your SyftBox router
cd ~/SyftBox/apps/my-vector-search

# Open in your IDE (Cursor, VS Code, etc.)
cursor .
```

### Step 4: Examine the Template

Let's look at what the system generated for you. The `search_service.py` file contains a basic template with placeholder methods you'll need to fill in:
```python
class CustomSearchService(SearchService):
    def __init__(self, config: dict):
        self.accounting_client: UserClient = self.config.accounting_client()
        logger.info(f"Initialized accounting client: {self.accounting_client}")
        logger.info("Initialized custom search service")
        self.app_name = self.config.project.name

        # TODO: Initialize your vector database client
        # Example: Weaviate, Pinecone, Qdrant client
        pass
    
     def search_documents(
        self,
        user_email: EmailStr,
        query: str,
        options: Optional[SearchOptions] = None,
        transaction_token: Optional[str] = None,
    ) -> SearchResponse:
        # TODO: Implement your search logic
        # 1. Query your vector database
        # 2. Process results
        # 3. Return formatted response
        pass
```

### Step 5: Implement Integration (Example: Weaviate)

Now comes the fun part - connecting your actual vector database! Here's a complete example using Weaviate, but the same pattern works for Pinecone, Qdrant, or any other vector DB:

```python
import weaviate
from typing import List, Dict, Any

class SearchService:
    def __init__(self, config: dict):
        self.accounting_client: UserClient = self.config.accounting_client()
        logger.info(f"Initialized accounting client: {self.accounting_client}")
        logger.info("Initialized custom search service")
        self.app_name = self.config.project.name

        # Initialize Weaviate client - this connects to your vector database
        self.client = weaviate.Client(
            url=config.get('weaviate_url', 'http://localhost:8080'),
            auth_client_secret=weaviate.AuthApiKey(
                api_key=config.get('weaviate_api_key')
            ) if config.get('weaviate_api_key') else None
        )
        # The collection where your documents are stored
        self.collection_name = config.get('collection_name', 'Documents')
    
    def search_documents(
        self,
        user_email: EmailStr,
        query: str,
        options: Optional[SearchOptions] = None,
        transaction_token: Optional[str] = None,
    ) -> SearchResponse:
        # 1. Prepare the search payload for your vector database
        # We'll limit results to 10 by default, but users can specify more
        limit = options.limit if options else 10
        payload = {
            "query": query,
            "limit": limit,
            # You can add more search parameters here based on your DB's capabilities
        }

        # 2. Handle payment transaction if you've set pricing for your service
        # IMPORTANT: Keep this transaction logic if you plan to charge for your router!
        # The transaction is created first, then confirmed only if the search succeeds.
        # This ensures users are only charged for successful searches, not failed attempts.
        query_cost = 0.0
        if self.pricing > 0 and transaction_token:
            # This is where the magic happens - we charge the user only if the search succeeds
            with self.accounting_client.delegated_transfer(
                user_email,
                amount=self.pricing,
                token=transaction_token,
                app_name=self.app_name,
                app_ep_path="/search",
            ) as payment_txn:
                # Make the actual search request to your vector database
                response = self.client.query.get("Document", query=payload)
                response.raise_for_status()
                results = response.json()["results"]
                # Only confirm payment if we got actual results
                # This is crucial - don't charge users for empty searches or errors!
                if results:
                    payment_txn.confirm()
                query_cost = self.pricing
        elif self.pricing > 0 and not transaction_token:
            raise ValueError(
                "Transaction token is required for paid services. Please provide a transaction token."
            )
        else:
            # Free service, just make the request
            response = self.client.query.get("Document", query=payload)
            response.raise_for_status()
            results = response.json()["results"]

        # 3. Convert your database results to the standard SyftBox format
        # This ensures compatibility with all SyftBox clients regardless of which DB you use
        documents = [
            DocumentResult(
                id=str(result["id"]),
                score=result["score"],  # Relevance score from your vector DB
                content=result["content"],  # The actual document text
                metadata=result.get("metadata", {}),  # Any extra info about the document
            )
            for result in results
        ]

        # 4. Return SearchResponse
        return SearchResponse(
            id=UUID.uuid4(),
            query=query,
            results=documents,
            provider_info={"provider": "custom", "results_count": len(documents)},
            cost=query_cost,
        )
```

### Step 6: Add Dependencies

Your custom router will need to connect to your vector database, so let's add the necessary dependencies. Update your `pyproject.toml` file:
```toml
dependencies = [
    "weaviate-client>=3.24.0",  # For Weaviate
    # Or for other vector DBs:
    # "pinecone-client>=2.2.0",  # Pinecone
    # "qdrant-client>=1.6.0",    # Qdrant
]
```

Alternatively, you can install packages directly in your `run.sh` startup script:
```bash
# Add this to run.sh before the server starts
pip install weaviate-client
```

### Step 7: Configure Your Vector Database

Now you need to tell your router how to connect to your vector database. You have a couple of options for configuration.

#### Option A: Environment Variables
The most secure way is using environment variables:
```bash
# Add to environment or .env
export WEAVIATE_URL="https://your-cluster.weaviate.network"
export WEAVIATE_API_KEY="your-api-key"
export COLLECTION_NAME="Documents"
```

#### Option B: Config in Code
Or you can configure everything directly in your service code:
```python
config = {
    "weaviate_url": os.getenv("WEAVIATE_URL", "http://localhost:8080"),
    "weaviate_api_key": os.getenv("WEAVIATE_API_KEY"),
    "collection_name": os.getenv("COLLECTION_NAME", "Documents"),
    "pricing": {
        "enabled": True,
        "per_query": 0.01
    }
}
```

### Step 8: Implement Service Monitoring

This step is crucial - it tells SyftBox whether your search service is healthy and ready to accept requests. You'll need to update `spawn_services.py` to properly monitor your vector database connection. 

```python
def spawn_custom_search(self):
    """Monitor external vector database health"""
    logger.info("🔍 Setting up custom search service...")
    try:
        # This is where you'd add health checks for your vector database
        # For example: test the connection, verify your collections exist, etc.
        # If everything looks good:
        self.custom_search_url = "http://localhost:23456"
        self.config.state.update_service_state( 
            # This tells SyftBox that your search service is ready for requests
            "search",
            status=RunStatus.RUNNING,
            started_at=datetime.now().isoformat(),
            url=self.custom_search_url,
        )
        return True

    except Exception as e:
        logger.error(f"❌ Custom search service setup failed: {e}")
        self.config.state.update_service_state(
            "search", status=RunStatus.FAILED, error=str(e)
        )
        return False

# Don't forget to uncomment the monitoring code in spawn_services.py!
# Without this, SyftBox won't know your service is available for users
```

## Testing Your Router

Time to see if everything works! You have two ways to test your custom search router.

### Via Dashboard
The easiest way to test is through the SyftBox dashboard:
1. Go to router list in your dashboard
2. Select your router from the dropdown list
3. Send a test search query like "machine learning concepts"
4. You should see results coming back from your vector database

### Via API
For more advanced testing, you can hit the API directly:
```bash
# Test your search endpoint with a curl command
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{ \
    "query": "machine learning concepts", \
    "suffix-sender": "true", \
    "timeout": "5000", \
    "x-syft-from": "guest@syftbox.net", \
    "x-syft-url": "syft://<your_email>/app_data/my_vector_search/rpc/search" \
  }'
```

## Publishing Your Router

Once you're happy with how your router works, you can make it available to other users on the SyftBox network:

1. **Test thoroughly**: Make sure search works reliably with your vector database
2. **Add metadata**: Go to router details → "Publish" and fill in descriptions
3. **Set pricing**: Configure how much you want to charge per search request
4. **Publish**: Make your router discoverable to other users

```
Summary: "Advanced vector search with custom database"
Description: "Powered by Weaviate/Pinecone with custom ranking"
Tags: ["search", "vector", "rag", "custom"]
Pricing:
  Search: $0.01 per request
```

## Monitoring & Maintenance

The good news is that SyftBox automatically monitors your router's health and shows the status in the UI, so you don't need to build your own monitoring dashboard.

However, when things go wrong (and they sometimes do), you'll want to check the logs to see what's happening:

### Logs
```bash
# View router logs
tail -f ~/SyftBox/apps/my-router/logs/app.log

# Common issues you might encounter:
- Vector DB connection problems: Double-check your URL and API keys
- Network timeouts: Your vector DB might be slow - try increasing timeout values
- Authentication errors: Make sure your API credentials are still valid
- Empty results: Verify your collection names and that you actually have data indexed
```

---

**Next Steps**:
- [Accounting](../router-internals/accounting.md) for pricing optimization
- [Code Structure](../router-internals/code-structure.md) for advanced customization