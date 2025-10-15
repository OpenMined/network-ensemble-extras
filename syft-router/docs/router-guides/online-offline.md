# Router Online/Offline Status

Understand router availability states and how to manage your router's online presence.

## Router Status States

Routers can exist in four distinct states that reflect their operational health and availability to handle requests. Understanding these states helps you monitor and troubleshoot your router effectively.

### Primary States

#### 🟢 Online (Healthy)
Your router is fully operational and performing optimally.
- Router is running and responding
- All services are operational
- Accepting new requests
- Health checks passing

This is the ideal state where your router can handle all incoming requests efficiently.

#### 🟡 Online (Degraded)
Your router is still serving requests but experiencing performance issues or partial service failures.
- Router is running but with issues
- Some services may be slow or failing
- Limited functionality available
- Performance below normal

Users may experience slower response times or reduced functionality in this state.

#### 🔴 Offline (Unhealthy)
Your router is completely unavailable and cannot serve any requests.
- Router is not responding
- Services are down or failing
- No requests being processed
- Health checks failing

This state requires immediate attention to restore service.

#### ⚫ Unknown
The router's status cannot be determined, typically during startup or network issues.
- Status cannot be determined
- Network connectivity issues
- Router may be starting up

This is usually a temporary state that resolves as the router completes initialization.

## Status Monitoring

### Automatic Status Detection

The SyftBox platform continuously monitors your router's health by making regular requests to its health endpoint. This automated monitoring ensures quick detection of any issues.

The system monitors router status through:

```python
# Health check endpoint monitoring
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "chat": "running",
            "search": "running"
        },
        "uptime": get_uptime(),
        "version": "1.0.0"
    }
```

Your router must implement this endpoint to participate in the monitoring system. The platform expects a JSON response with status information and service details.

### Status Check Intervals

The monitoring system uses configurable intervals and thresholds to determine when to change a router's status. These settings balance responsiveness with system stability.

```python
# Configuration for status monitoring
MONITORING_CONFIG = {
    "health_check_interval": 30,      # seconds
    "timeout": 10,                    # seconds for health check
    "max_failures": 3,               # consecutive failures before offline
    "recovery_checks": 2,             # successful checks to go online
    "degraded_threshold": 5000,       # ms response time for degraded
}
```

These configuration values determine how quickly the system detects issues and recovers from failures. Adjust them based on your router's expected performance characteristics.

### Status Transition Logic

Routers transition between states based on their health check responses and performance metrics. The system uses hysteresis to prevent rapid state changes that could cause instability.

```
[Unknown] → [Online] → [Degraded] → [Offline]
    ↑         ↑          ↑           ↑
Startup    Healthy    Slow/Errors   Failed
State      Response   Response      Health
                                    Checks
```

The transition logic ensures that temporary issues don't immediately mark a router as offline, while persistent problems are quickly detected and addressed.

## Implications of Status Changes

When your router's status changes, it affects how requests are routed and how usage is tracked:

- **Online → Degraded**: Router continues receiving requests but may be deprioritized
- **Degraded → Offline**: All traffic is redirected to other available routers
- **Offline → Online**: Router rejoins the active pool and begins receiving requests again

Monitoring these transitions helps you understand your router's reliability and identify patterns that might indicate underlying issues.

---

**Next Steps**:
- [Accounting](accounting.md) for usage tracking during downtime
- [Code Structure](code-structure.md) for implementation details