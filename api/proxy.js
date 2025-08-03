const fetch = require("node-fetch");

module.exports = async function (context, req) {
  const targetPath = req.url.replace("/api/proxy", "");
  const targetUrl = `http://74.235.204.42:34141${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const buffer = await response.buffer();

    context.res = {
      status: response.status,
      body: buffer,
      isRaw: true,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream"
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: `Proxy error: ${error.message}`
    };
  }
};
