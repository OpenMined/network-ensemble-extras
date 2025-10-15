# Authentication

Understand guest vs authenticated access and implement authentication for your router.

## Authentication Overview

Syft LLM Routers offer flexible access control to accommodate different use cases. You can choose between open access for public services or token-based authentication for premium features and higher limits.

The system supports two access modes:
- **👥 Guest Mode**: Open access with rate limits
- **🔐 Authenticated Mode**: Token-based access with user tracking

## Guest Mode Access

### When to Use Guest Mode
Guest mode is perfect for scenarios where you want to provide immediate access without requiring users to sign up or authenticate.
- Public demos and showcases
- Free tier services
- Educational content

This mode removes barriers to entry while still protecting your router from abuse through reasonable rate limits.

### Guest Mode Limitations
To prevent abuse and ensure fair usage, guest mode comes with built-in restrictions that encourage users to authenticate for better service.
```
Rate Limits:
  • 10 requests per minute
  • 100 requests per day
  • Basic feature access only
  • No conversation history
  • No premium models
```
These limits are designed to allow meaningful testing while encouraging conversion to authenticated access for regular use.

### Using Guest Mode
Guest access is as simple as making a direct API call. No tokens, no setup, no authentication headers required.

```bash
# Guest access - no auth headers needed
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

Notice how clean this is - just include your message and routing information, and you're ready to go. The `x-syft-url` parameter tells the system which router should handle your request.
## Authenticated Mode

For users who need more robust access or want to build production applications, authenticated mode provides significantly enhanced capabilities and fewer restrictions.

### Benefits of Authentication
- **Higher rate limits**: 1000+ requests per day
- **User tracking**: Conversation history and preferences  
- **Paid services**: Advanced models and services

Authentication unlocks the full potential of the router system, including access to premium models and persistent conversation management.

### Authentication Flow

#### 1. Obtain Accounting Token
Getting started with authentication is straightforward. Users automatically receive their token when they first connect to the Syft LLM Router dashboard.

The token will be stored under `~/.syftbox/accounting_config.json` for easy access by your applications.

#### 2. Use Access Token
Once you have your token, using it is just a matter of adding the Authorization header to your requests. The system will automatically recognize you and apply your account's limits and preferences.

```bash
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{ \
    "message": "What is machine learning?", \
    "suffix-sender": "true", \
    "timeout": "5000", \
    "x-syft-from": "guest@syftbox.net", \
    "x-syft-url": "syft://<your_email>/app_data/my_router/rpc/chat" \
  }'
```

The key difference here is the `Authorization: Bearer` header containing your JWT token. This single addition transforms your request from guest access to full authenticated access with all its benefits.
