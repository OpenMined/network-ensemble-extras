# Router Endpoints

This tutorial captures how the router API are being configured. You will notice quick that each router runs on its own port:
```
http://localhost:[ROUTER_PORT]/
```

However, this is not a regular FastAPIServer. If you have not noticed, you can easily allow others to query without ever opening a firewall for the whole internet to use. How does it work?

Syft runs relays which are responsible for forwarding of these messages. As communication is encrypted, these relays are blind to the messages exchanged, but it allows us to easily address services over the network in a unified way, just by knowing the email and the name of the router we want to query.


## Core Service Endpoints

All router endpoints are accessed through the SyftBox relay system, which routes requests based on the `x-syft-url` parameter. This allows secure communication without opening firewalls.

### Chat Endpoint

**POST** `https://syftbox.net/api/v1/send/`

Send chat messages to a router's chat service through the SyftBox relay.

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -H "timeout: 5000" \
  -d '{
    "message": "What is machine learning?",
    "conversation_id": "conv_123",
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/chat"
  }'
```

**Request Headers:**
- `x-syft-from`: Your email address (sender identification)
- `x-syft-url`: Target router endpoint in format `syft://owner_email/app_data/router_name/rpc/chat`
- `timeout`: Request timeout in milliseconds (default: 5000)

**Request Body:**
```json
{
  "message": "string (required) - The user's message",
  "conversation_id": "string (optional) - Conversation identifier",
  "model": "string (optional) - Specific model to use",
  "temperature": "number (optional) - Response randomness (0.0-1.0)",
  "max_tokens": "number (optional) - Maximum response length",
  "suffix-sender": "boolean (optional) - Include sender in response",
  "x-syft-url": "string (required) - Target router syft:// URL"
}
```

**Response (HTTP 202 Accepted):**
The SyftBox relay returns a polling response for async processing:
```json
{
  "request_id": "req_abc123",
  "status": "accepted",
  "data": {
    "poll_url": "/api/v1/requests/req_abc123/status",
    "message": "Request queued for processing"
  }
}
```

**Final Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "response": "Machine learning is a subset of artificial intelligence...",
    "conversation_id": "conv_123",
    "model_used": "gpt-3.5-turbo",
    "tokens_used": 150,
    "processing_time": 1.2
  }
}
```

### Search Endpoint

**POST** `https://syftbox.net/api/v1/send/`

Query a router's document search service through the SyftBox relay.

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -H "timeout: 5000" \
  -d '{
    "query": "machine learning concepts",
    "limit": 5,
    "filters": {"category": "technical"},
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/search"
  }'
```

**Request Body:**
```json
{
  "query": "string (required) - Search query",
  "limit": "number (optional) - Max results to return (default: 5)",
  "filters": "object (optional) - Metadata filters",
  "search_type": "string (optional) - 'vector', 'keyword', or 'hybrid'",
  "suffix-sender": "boolean (optional) - Include sender in response",
  "x-syft-url": "string (required) - Target router syft:// URL"
}
```

**Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "query": "machine learning concepts",
    "results": [
      {
        "content": "Machine learning is a method of data analysis...",
        "score": 0.95,
        "metadata": {
          "source": "ml-guide.pdf",
          "page": 1,
          "category": "technical"
        },
        "id": "doc_123"
      }
    ],
    "total_results": 1,
    "processing_time": 0.3
  }
}
```

### Using the SyftBoxSDK

For easier integration, use the SyftBoxSDK which handles the polling mechanism automatically:

```python
import asyncio
from syftbox_sdk import SyftBoxSDK

# Initialize SDK
sdk = SyftBoxSDK()

# Chat request
async def chat_example():
    response = await sdk.syft_fetch(
        "syft://router_owner@example.com/app_data/my_router/rpc/chat",
        {
            "body": {
                "message": "What is machine learning?",
                "conversation_id": "conv_123"
            },
            "from_email": "user@example.com"
        }
    )
    
    if response and response.get("body"):
        print(f"Response: {response['body']['response']}")

# Search request
async def search_example():
    response = await sdk.syft_fetch(
        "syft://router_owner@example.com/app_data/my_router/rpc/search",
        {
            "body": {
                "query": "machine learning concepts",
                "limit": 5
            },
            "from_email": "user@example.com"
        }
    )
    
    if response and response.get("body"):
        results = response['body']['results']
        print(f"Found {len(results)} results")

# Run examples
asyncio.run(chat_example())
asyncio.run(search_example())
```

The SDK automatically handles:
- Request ID generation
- Polling for async responses
- Error handling and retries
- Response parsing

## Health and Status Endpoints

### Health Check

**POST** `https://syftbox.net/api/v1/send/`

Check overall router health through the SyftBox relay system.

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -H "timeout: 5000" \
  -d '{
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/health"
  }'
```

**Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "status": "healthy",
    "services": {
      "chat": "running",
      "search": "running"
    },
    "uptime": "2h 45m",
    "version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Service Status

**POST** `https://syftbox.net/api/v1/send/`

Check specific service status through the relay.

```bash
# Check chat service status
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "service": "chat",
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/status"
  }'
```

**Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "service": "chat",
    "status": "running",
    "last_request": "2024-01-15T10:30:00Z",
    "response_time_avg": "150ms",
    "error_rate": "0.1%",
    "requests_today": 142
  }
}
```

## Router Information Endpoints

### Router Metadata

**POST** `https://syftbox.net/api/v1/send/`

Get router information and capabilities through the SyftBox relay.

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/info"
  }'
```

**Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "name": "my-ai-router",
    "version": "1.0.0",
    "description": "AI-powered chat and search router",
    "author": "router_owner@example.com",
    "services": {
      "chat": {
        "enabled": true,
        "models": ["gpt-3.5-turbo", "gpt-4"],
        "pricing": {
          "per_request": 0.01,
          "per_token": 0.0001
        }
      },
      "search": {
        "enabled": true,
        "collection_size": 10000,
        "pricing": {
          "per_request": 0.005
        }
      }
    },
    "published": true,
    "tags": ["chat", "search", "ai"]
  }
}
```

### OpenAPI Schema

**POST** `https://syftbox.net/api/v1/send/`

Get the router's OpenAPI schema through the SyftBox relay.

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/openapi"
  }'
```

**Note:** Interactive documentation (Swagger UI) is available when accessing the router directly on its local port, but not through the relay system.

## Authentication

### Guest Access

For guest access, use the anonymous email address in the `x-syft-from` header:

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: guest@syft.org" \
  -d '{
    "message": "Hello as guest!",
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/chat"
  }'
```

### Authenticated Access

For authenticated requests, include the `Authorization` header with your SyftBox token:

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "x-syft-from: user@example.com" \
  -d '{
    "message": "Hello with authentication!",
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/chat"
  }'
```

Authentication tokens are obtained from the SyftBox dashboard and stored in `~/.syftbox/accounting_config.json`.

## Error Responses

SyftBox relay responses follow a consistent format. Errors can occur at the relay level or from the target router:

### Relay Errors (HTTP 4xx/5xx)
```json
{
  "error": "invalid_request",
  "message": "Missing required field: x-syft-url",
  "code": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Authentication Errors (HTTP 401)
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired SyftBox token",
  "code": 401,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Router Not Found (HTTP 404)
```json
{
  "status": "ERROR",
  "message": "No request found or router unavailable",
  "request_id": "req_abc123"
}
```

### Polling Timeout (HTTP 500)
```json
{
  "error": "No response exists. Polling timed out",
  "message": "Router did not respond within timeout period",
  "code": 500
}
```

### Router Errors (Wrapped in Success Response)
When the router itself returns an error, it's wrapped in a successful polling response:
```json
{
  "status": "success",
  "status_code": 500,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "error": "service_unavailable",
    "message": "Chat service is currently offline",
    "service": "chat",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Advanced Router Endpoints

### Custom Endpoints

Routers can implement custom endpoints beyond chat and search. Access any custom endpoint using the SyftBox relay pattern:

```bash
# Custom endpoint example: document upload
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "document": "base64_encoded_content",
    "filename": "document.pdf",
    "metadata": {"category": "research"},
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/upload"
  }'
```

### Batch Processing

For routers that support batch operations, send multiple items in a single request:

```bash
curl -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "queries": [
      {"query": "machine learning", "id": "q1"},
      {"query": "deep learning", "id": "q2"}
    ],
    "limit": 3,
    "suffix-sender": "true",
    "x-syft-url": "syft://router_owner@example.com/app_data/my_router/rpc/batch_search"
  }'
```

**Response (after polling):**
```json
{
  "status": "success",
  "status_code": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "results": [
      {
        "id": "q1",
        "query": "machine learning",
        "results": [...],
        "status": "success"
      },
      {
        "id": "q2",
        "query": "deep learning",
        "results": [...],
        "status": "success"
      }
    ],
    "processing_time": 0.8
  }
}
```

## Rate Limiting

The SyftBox platform implements rate limiting at multiple levels:

### Platform Rate Limits
- **Guest users** (`guest@syft.org`): 10 requests/minute, 100/day
- **Authenticated users**: Based on subscription tier (1000+/day)
- **Per-router limits**: Set by individual router owners

### Router-Level Rate Limits
Individual routers may implement their own rate limiting, returned in response headers:

```json
{
  "status": "success",
  "status_code": 429,
  "headers": {
    "x-ratelimit-limit": "100",
    "x-ratelimit-remaining": "0",
    "x-ratelimit-reset": "1642262400",
    "retry-after": "60"
  },
  "body": {
    "error": "rate_limit_exceeded",
    "message": "Too many requests. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Direct Router Access

While the SyftBox relay system is the primary access method, routers also run locally and can be accessed directly for development and testing:

### Local Development Access

```bash
# Direct chat request (local development only)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello locally!"}'

# Health check
curl http://localhost:8001/health

# API documentation
open http://localhost:8001/docs
```

### WebSocket Support (Local Only)

Some routers may implement WebSocket endpoints for real-time communication:

```javascript
// Connect to local router WebSocket
const ws = new WebSocket('ws://localhost:8001/ws/chat');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello!',
    conversation_id: 'conv_123'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data.content);
};
```

**Note:** WebSocket connections are only available for direct local access and are not supported through the SyftBox relay system.

## Polling Mechanism

The SyftBox relay uses an asynchronous request-response pattern with polling:

1. **Initial Request**: Returns HTTP 202 with a `request_id` and `poll_url`
2. **Polling Phase**: Client polls the `poll_url` until response is ready
3. **Final Response**: Returns the actual router response

### Manual Polling Example

```bash
# Step 1: Send initial request
RESPONSE=$(curl -s -X POST https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "x-syft-from: user@example.com" \
  -d '{
    "message": "Hello!",
    "suffix-sender": "true",
    "x-syft-url": "syft://owner@example.com/app_data/router/rpc/chat"
  }')

# Step 2: Extract poll URL
POLL_URL=$(echo $RESPONSE | jq -r '.data.poll_url')

# Step 3: Poll for result
while true; do
  RESULT=$(curl -s "https://syftbox.net${POLL_URL}")
  STATUS=$(echo $RESULT | jq -r '.status // "pending"')
  
  if [ "$STATUS" != "pending" ]; then
    echo $RESULT | jq '.body'
    break
  fi
  
  sleep 1
done
```

The SyftBoxSDK handles this polling automatically, making integration much simpler.

---

**Next Steps**:
- [Request & Response](request-response.md) for detailed schemas
- [Authentication](authentication.md) for auth implementation
- [HTTP Usage](http-usage.md) for integration examples