const fetch = require("node-fetch");

module.exports = async function (context, req) {
  const path = req.params["*"]; // <- gets "router/list", "sburl", etc.
  const targetUrl = `http://74.235.204.42:34141/${path}`;

  context.log("Proxying to:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body
    });

    const body = await response.text();

    context.res = {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain"
      },
      body
    };
  } catch (error) {
    context.log("Proxy error:", error);
    context.res = {
      status: 502,
      body: "Proxy error: " + error.message
    };
  }
};
