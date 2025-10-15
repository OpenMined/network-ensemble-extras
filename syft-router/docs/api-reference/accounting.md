# Accounting & Pricing

This guide explains how usage tracking, billing, and pricing work for your router services.

## Overview

Syft Router accounting uses OpenMined's hosted accounting service to handle billing and usage tracking for your router. The system provides:
- **📊 Usage Tracking**: You can monitor requests, tokens, and performance across all your services
- **💰 Automated Billing**: Users are charged based on their usage with automatic payment processing
- **📈 Analytics**: You can view usage patterns and revenue through detailed dashboards
- **🔒 Access Control**: The system enforces rate limits and quotas to maintain service quality

## Pricing Models

### 1. Per-Request Pricing

This model charges users a fixed amount for each API call:

```json
{
  "pricing_type": "per_request",
  "amount": 0.01,
  "currency": "USD",
  "description": "$0.01 per search query"
}
```

**This pricing model works best for:**
- Search services
- Simple chat responses  
- Predictable workloads
- Fixed-cost operations

### 2. Per-Token Pricing

Per-token pricing is not currently supported. We will add this feature in a future beta version.


## Implementing Accounting

### Integration with Router Services

The accounting system integrates with your router services through OpenMined's hosted accounting service. The following example shows how this works with a custom chat router:

```python
# Real example from CustomChatService showing proper accounting integration
class CustomChatService(ChatService):
    def __init__(self, config: RouterConfig):
        super().__init__(config)
        # This connects to OpenMined's hosted accounting service
        self.accounting_client: UserClient = self.config.accounting_client()
        logger.info(f"Initialized accounting client: {self.accounting_client}")
        self.app_name = self.config.project.name
        
        # Initialize your language model client
        self.client = OpenAI(
            api_key=config.get('openai_api_key'),
            base_url=config.get('base_url', 'https://api.openai.com/v1')
        )
    
    def generate_chat(
        self,
        model: str,
        messages: List[Message],
        user_email: EmailStr,
        transaction_token: Optional[str] = None,
        options: Optional[GenerationOptions] = None,
    ) -> ChatResponse:
        # Prepare request payload for your language model
        payload = {
            "model": model or self.default_model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "stream": False,
        }
        
        # Handle payment transaction - this is where the accounting magic happens!
        # The transaction is created first, then confirmed only if the AI request succeeds.
        query_cost = 0.0
        if self.pricing > 0 and transaction_token:
            with self.accounting_client.delegated_transfer(
                user_email,                    # Who is being charged
                amount=self.pricing,           # How much to charge
                token=transaction_token,       # Payment authorization from user
                app_name=self.app_name,        # Your router name for billing
                app_ep_path="/chat",           # Which endpoint was used
            ) as payment_txn:
                # Only make the expensive API call inside the transaction context
                response = self.client.chat.completions.create(**payload)
                
                # Only confirm payment if we got a valid response
                # This ensures users are only charged for successful requests!
                if response.choices:
                    payment_txn.confirm()  # This actually charges the user
                query_cost = self.pricing
                
        elif self.pricing > 0 and not transaction_token:
            raise ValueError(
                "Transaction token is required for paid services. Please provide a transaction token."
            )
        else:
            # Free service - no payment needed
            response = self.client.chat.completions.create(**payload)
        
        # Convert response to SyftBox format with usage tracking
        choice = response.choices[0]
        usage = ChatUsage(
            prompt_tokens=response.usage.prompt_tokens,
            completion_tokens=response.usage.completion_tokens,
            total_tokens=response.usage.total_tokens,
        )
        
        return ChatResponse(
            id=UUID(response.id),
            model=response.model,
            message=Message(role="assistant", content=choice.message.content),
            usage=usage,
            provider_info={"provider": "openai", "finish_reason": choice.finish_reason},
            cost=query_cost,  # This gets tracked for analytics
        )
```

### How the Accounting System Works

OpenMined's hosted accounting service handles all the billing complexity:

1. **Transaction Creation**: When a paid request comes in, a transaction is created but not yet charged
2. **Service Execution**: Your router processes the request (chat, search, etc.)
3. **Conditional Payment**: Payment is only confirmed if the service request was successful
4. **Usage Tracking**: All usage data (tokens, cost, response time) is automatically recorded
5. **Analytics**: Data flows into dashboards for monitoring and optimization

**Key benefits of this system:**
- Users are never charged for failed requests
- The system handles retries and error recovery automatically
- Built-in fraud protection and rate limiting keep your service secure
- You get real-time usage monitoring and alerts

## Viewing Usage and Balances

You can monitor your router's performance and earnings through the SyftBox dashboard:

- **Usage Analytics**: You can view request counts, token usage, and response times
- **Revenue Tracking**: The dashboard shows earnings from your router services over time
- **User Activity**: You can monitor which users are accessing your services most frequently
- **Balance Information**: The dashboard displays your current account balance and transaction history

The SyftBox UI updates all this information in real-time, so you have complete visibility into your router's performance and profitability.

---

**Next Steps**:
- [Metadata](metadata.md) for pricing configuration in publishing
- [Authentication](../api-reference/authentication.md) for user tier management
- [Monitoring](../router-guides/monitoring.md) for usage tracking