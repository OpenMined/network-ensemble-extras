# Custom Chat Router Guide

Connect your existing language models to your router and make powerful chat services available to users of the SyftBox network. This guide walks you through integrating your own language models while maintaining full control over conversation flows and model behavior.

## What is a Custom Chat Router?

A Custom Chat Router is perfect for users who already have language models deployed and want to keep using their existing infrastructure. Instead of starting fresh, you're bringing your own AI capabilities to the SyftBox network while maintaining complete control over how conversations happen.

This approach is also fantastic for creating unique chat experiences. You can implement custom conversation flows, use specialized prompts, deploy your fine-tuned models, or even build full RAG (Retrieval-Augmented Generation) systems that combine your documents with AI responses.

## Creating a Custom Chat Router

### Step 1: Generate Template
First, let's create the router template through the SyftBox dashboard:
1. Dashboard → "Create Router"
2. Name: `my-custom-chat` (or whatever makes sense for your chat service)
3. Type: **Custom** ✓ (this gives you full control over the chat implementation)
4. Services: **Chat Service** ✓ (we're focusing on conversational AI here)
5. Click "Create"

### Step 2: Project Structure
Once created, you'll see this structure in your SyftBox apps directory:
```
my-custom-chat/
├── server.py           # Main FastAPI server (handles routing)
├── chat_service.py     # Template for your custom chat implementation
├── spawn_services.py   # Monitors service health and status
├── pyproject.toml      # Where you'll add your LLM provider dependencies
└── run.sh              # Script that starts everything up
```

## Implementation Walkthrough

### Step 3: Open Your Router Project
Now let's dive into the code. Navigate to your router directory and open it in your favorite editor:
```bash
# Navigate to your SyftBox router
cd ~/SyftBox/apps/my-custom-chat

# Open in your IDE (Cursor, VS Code, etc.)
cursor .
```

### Step 4: Examine the Template

Let's look at what the system generated for you. The `chat_service.py` file contains a template with the essential structure you'll need to fill in:
```python
class CustomChatService(ChatService):
    def __init__(self, config: RouterConfig):
        super().__init__(config)
        self.accounting_client: UserClient = self.config.accounting_client()
        logger.info(f"Initialized accounting client: {self.accounting_client}")
        logger.info("Initialized custom chat service")
        self.app_name = self.config.project.name

        # This is where you'll initialize your language model client
        # Could be OpenAI, Anthropic, a local model, or your own API
        pass
    
    def generate_chat(
        self,
        model: str,
        messages: List[Message],
        user_email: EmailStr,
        transaction_token: Optional[str] = None,
        options: Optional[GenerationOptions] = None,
    ) -> ChatResponse:
        # This is the main method where chat magic happens
        # 1. Format the conversation for your language model
        # 2. Handle payment if you're charging for the service
        # 3. Get response from your model and return it in the right format
        pass
```

### Step 5: Implement Integration (Example: OpenAI)

Now comes the exciting part - connecting your actual language model! Here's a complete example using OpenAI, but you can adapt this pattern for Anthropic, local models, or any other AI service:

```python
import requests
from openai import OpenAI
from typing import List, Optional
from uuid import UUID

class CustomChatService(ChatService):
    def __init__(self, config: RouterConfig):
        super().__init__(config)
        self.accounting_client: UserClient = self.config.accounting_client()
        logger.info(f"Initialized accounting client: {self.accounting_client}")
        logger.info("Initialized custom chat service")
        self.app_name = self.config.project.name
        
        # Initialize OpenAI client - this connects to your language model
        self.client = OpenAI(
            api_key=config.get('openai_api_key'),
            base_url=config.get('base_url', 'https://api.openai.com/v1')
        )
        # Set a default model in case users don't specify one
        self.default_model = config.get('model', 'gpt-3.5-turbo')
    
    def generate_chat(
        self,
        model: str,
        messages: List[Message],
        user_email: EmailStr,
        transaction_token: Optional[str] = None,
        options: Optional[GenerationOptions] = None,
    ) -> ChatResponse:
        # 1. Prepare the conversation for your language model
        # Convert SyftBox message format to OpenAI's expected format
        payload = {
            "model": model or self.default_model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "stream": False,  # We'll handle streaming in a future version
        }
        # Add any generation options the user specified
        if options:
            if options.temperature is not None:
                payload["temperature"] = options.temperature  # Controls randomness
            if options.top_p is not None:
                payload["top_p"] = options.top_p  # Controls diversity
            if options.max_tokens is not None:
                payload["max_tokens"] = options.max_tokens  # Limits response length
            if options.stop_sequences:
                payload["stop"] = options.stop_sequences  # When to stop generating

        # 2. Handle payment transaction if you've set pricing for your service
        # IMPORTANT: Keep this transaction logic if you plan to charge for your router!
        # The transaction is created first, then confirmed only if the AI request succeeds.
        # This ensures users are only charged for successful responses, not failed attempts.
        query_cost = 0.0
        if self.pricing > 0 and transaction_token:
            # This is where the magic happens - we charge the user only if the chat succeeds
            with self.accounting_client.delegated_transfer(
                user_email,
                amount=self.pricing,
                token=transaction_token,
                app_name=self.app_name,
                app_ep_path="/chat",
            ) as payment_txn:
                # Make the actual request to your language model
                response = self.client.chat.completions.create(**payload)
                # Only confirm payment if we got a valid response
                # This is crucial - don't charge users for failed requests!
                if response.choices:
                    payment_txn.confirm()
                query_cost = self.pricing
        elif self.pricing > 0 and not transaction_token:
            raise ValueError(
                "Transaction token is required for paid services. Please provide a transaction token."
            )
        else:
            # Free service, just make the request
            response = self.client.chat.completions.create(**payload)

        # 3. Convert your language model's response to SyftBox format
        # This ensures compatibility with all SyftBox clients regardless of which model you use
        choice = response.choices[0]
        assistant_message = Message(
            role="assistant",
            content=choice.message.content,
        )

        # 4. Track token usage for analytics and billing
        # This helps users understand the cost and performance of your service
        usage_data = response.usage
        usage = ChatUsage(
            prompt_tokens=usage_data.prompt_tokens,  # Tokens in the user's messages
            completion_tokens=usage_data.completion_tokens,  # Tokens in your response
            total_tokens=usage_data.total_tokens,  # Sum of both
        )

        # 5. Return ChatResponse
        return ChatResponse(
            id=UUID(response.id),
            model=response.model,
            message=assistant_message,
            usage=usage,
            provider_info={"provider": "openai", "finish_reason": choice.finish_reason},
            cost=query_cost,
        )
```

### Step 6: Add Dependencies

Your custom router will need to connect to your language model provider, so let's add the necessary dependencies. Update your `pyproject.toml` file:
```toml
dependencies = [
    "openai>=1.0.0",  # For OpenAI
    "requests>=2.28.0",  # For HTTP requests
    # Or for other LLM providers:
    # "anthropic>=0.25.0",  # Anthropic
    # "google-generativeai>=0.3.0",  # Google Gemini
]
```

Alternatively, you can install packages directly in your `run.sh` startup script:
```bash
# Add this to run.sh before the server starts
pip install openai requests
```

### Step 7: Configure Your Service

Now you need to tell your router how to connect to your language model. You have a couple of options for configuration.

#### Option A: Environment Variables
The most secure way is using environment variables (keeps your API keys safe):
```bash
# Add to environment or .env
export OPENAI_API_KEY="your-key-here"
export MODEL_NAME="gpt-4"
export BASE_URL="https://api.openai.com/v1"
```

#### Option B: Config in Code
Or you can configure everything directly in your service code:
```python
# In your chat_service.py
config = {
    "openai_api_key": os.getenv("OPENAI_API_KEY"),
    "model": os.getenv("MODEL_NAME", "gpt-3.5-turbo"),
    "base_url": os.getenv("BASE_URL"),
    "pricing": {
        "enabled": True,
        "per_request": 0.01
    }
}
```

### Step 8: Implement Service Monitoring

This step is crucial - it tells SyftBox whether your chat service is healthy and ready to accept requests. You'll need to update `spawn_services.py` to properly monitor your language model connection.

```python
def spawn_custom_chat(self):
    """Monitor external LLM service health"""
    logger.info("💬 Setting up custom chat service...")
    try:
        # This is where you'd add health checks for your language model
        # For example: test the API connection, verify your API keys work, etc.
        # If everything looks good:
        self.custom_chat_url = "http://localhost:12345"
        self.config.state.update_service_state(
            # This tells SyftBox that your chat service is ready for conversations
            "chat",
            status=RunStatus.RUNNING,
            started_at=datetime.now().isoformat(),
            url=self.custom_chat_url,
        )
        return True

    except Exception as e:
        logger.error(f"❌ Custom chat service setup failed: {e}")
        self.config.state.update_service_state(
            "chat", status=RunStatus.FAILED, error=str(e)
        )
        return False

# Don't forget to uncomment the monitoring code in spawn_services.py!
# Without this, SyftBox won't know your service is available for users
```

## Testing Your Router

Time to see if everything works! You have two ways to test your custom chat router.

### Via Dashboard
The easiest way to test is through the SyftBox dashboard:
1. Go to router list in your dashboard
2. Select your router from the dropdown list
3. Send a test message like "Hello, how are you?" or "Tell me a joke"
4. You should see responses coming back from your language model

### Via API
For more advanced testing, you can hit the API directly:
```bash
# Test your chat endpoint with a curl command
curl -X GET https://syftbox.net/api/v1/send/ \
  -H "Content-Type: application/json" \
  -d '{ \
    "message": "What is machine learning?", \
    "suffix-sender": "true", \
    "timeout": "5000", \
    "x-syft-from": "guest@syftbox.net", \
    "x-syft-url": "syft://<your_email>/app_data/my_custom_chat/rpc/chat" \
  }'
```

## Publishing Your Router

Once you're happy with how your router works, you can make it available to other users on the SyftBox network:

1. **Test thoroughly**: Make sure conversations work reliably with your language model
2. **Add metadata**: Go to router details → "Publish" and write compelling descriptions
3. **Set pricing**: Configure how much you want to charge per conversation
4. **Publish**: Make your router discoverable to other users

```
Summary: "Advanced AI chat with custom model"
Description: "Powered by GPT-4/Claude with custom prompts"
Tags: ["chat", "ai", "custom", "gpt-4"]
Pricing:
  Chat: $0.02 per request
```

## Monitoring & Maintenance

The good news is that SyftBox automatically monitors your router's health and shows the status in the UI, so you don't need to build your own monitoring dashboard.

However, when things go wrong (and they sometimes do), you'll want to check the logs to see what's happening:

### Logs
```bash
# View router logs
tail -f ~/SyftBox/apps/my-custom-chat/logs/app.log

# Common issues you might encounter:
- API connection problems: Double-check your API keys and endpoints
- Model availability issues: Make sure the model you're requesting actually exists
- Rate limiting: Your API provider might be throttling requests - check your quotas
- Token limit errors: Watch your max_tokens settings, especially for longer conversations
```

---

**Next Steps**:
- [Custom Search Router](custom-search-router.md) for RAG capabilities  
- [Monitoring](monitoring.md) for production deployment
- [Accounting](../router-internals/accounting.md) for pricing optimization
- [Code Structure](../router-internals/code-structure.md) for advanced customization