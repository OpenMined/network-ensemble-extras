module.exports = async function (context, req) {
  const path = req.params.restOfPath || "";
  const targetUrl = `http://74.235.204.42:8080/${path}`;

  context.log("Proxying to:", targetUrl);

  try {
    const fetch = require("node-fetch");
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body
    });

    const body = await response.text();

    context.res = {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json"
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