// Configuration
const API_BASE_URL =  "http://localhost:8080";

// Global state
let chatHistory = [];
let routers = [];
let searchRouters = [];
let chatRouters = [];
let selectedDataSources = [];
let selectedChatSource = "";
let lastSearchResults = [];
let isLoading = false;
let syftboxBaseUrl = null;

// API Service Classes
class RouterService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async listRouters() {
    const response = await this.request("/router/list");
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.routers,
      };
    }
    return {
      success: false,
      error: response.error || "Failed to fetch routers",
    };
  }

  async getUsername() {
    return this.request("/username");
  }

  async getSyftBoxUrl() {
    return this.request("/sburl");
  }
}

class ChatService {
  joinUrls(baseUrl, endpoint) {
    const cleanBase = baseUrl.replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    return `${cleanBase}/${cleanEndpoint}`;
  }

  async getServerUrl() {
    if (syftboxBaseUrl) {
      return syftboxBaseUrl;
    }

    try {
      const response = await fetch(API_BASE_URL + "/sburl");
      if (!response.ok) {
        throw new Error(`Failed to fetch server URL: ${response.status}`);
      }

      const data = await response.json();
      syftboxBaseUrl = data.url.replace(/\/$/, "");
      return syftboxBaseUrl;
    } catch (error) {
      console.error("Failed to fetch server URL, using fallback:", error);
      syftboxBaseUrl = "https://dev.syftbox.net";
      return syftboxBaseUrl;
    }
  }

  async request(endpoint, options = {}) {
    try {
      const serverUrl = await this.getServerUrl();
      const fullUrl = this.joinUrls(serverUrl, endpoint);
      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async pollForResponse(pollUrl, maxAttempts = 20) {
    const serverUrl = await this.getServerUrl();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const fullUrl = this.joinUrls(serverUrl, pollUrl);
        const response = await fetch(fullUrl);
        const data = await response.json();

        if (
          response.status === 200 &&
          data?.data?.message?.status_code === 200
        ) {
          return {
            success: true,
            data,
          };
        } else if (
          response.status === 202 ||
          data?.data?.message?.status_code !== 200
        ) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        } else {
          return {
            success: false,
            error:
              data.message || `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }

    return {
      success: false,
      error: "Request timed out after maximum attempts",
    };
  }

  async search(routerName, author, query) {
    const encodedQuery = encodeURIComponent(query);
    const syftUrl = `syft://${author}/app_data/${routerName}/rpc/search?query="${encodedQuery}"`;
    const encodedSyftUrl = encodeURIComponent(syftUrl);

    const endpoint = `/api/v1/send/msg?x-syft-url=${encodedSyftUrl}&x-syft-from=guest@syft.org`;

    const response = await this.request(endpoint, {
      method: "POST",
    });

    if (response.success && response.data?.data?.poll_url) {
      return this.pollForResponse(response.data.data.poll_url);
    }

    return response;
  }

  async chat(routerName, author, messages) {
    const syftUrl = `syft://${author}/app_data/${routerName}/rpc/chat`;
    const encodedSyftUrl = encodeURIComponent(syftUrl);

    const endpoint = `/api/v1/send/msg?x-syft-url=${encodedSyftUrl}&x-syft-from=guest@syft.org`;

    const payload = {
      model: "tinyllama:latest",
      messages,
    };

    const response = await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.success && response.data?.data?.poll_url) {
      return this.pollForResponse(response.data.data.poll_url);
    }

    return response;
  }
}

// Initialize services
const routerService = new RouterService();
const chatService = new ChatService();

// Helper functions
function extractFilenames(text) {
  const matches = text.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}

function showError(message) {
  const errorDisplay = document.getElementById("errorDisplay");
  const errorText = document.getElementById("errorText");
  errorText.textContent = message;
  errorDisplay.classList.remove("hidden");
}

function hideError() {
  const errorDisplay = document.getElementById("errorDisplay");
  errorDisplay.classList.add("hidden");
}

function setLoading(loading) {
  isLoading = loading;
  const sendButton = document.getElementById("sendButton");
  const messageInput = document.getElementById("messageInput");

  sendButton.disabled = loading;
  messageInput.disabled = loading;

  if (loading) {
    sendButton.textContent = "Sending...";
    showLoadingMessage();
  } else {
    sendButton.textContent = "Send";
    hideLoadingMessage();
  }
}

function showLoadingMessage() {
  const chatMessages = document.getElementById("chatMessages");
  const emptyState = document.getElementById("emptyState");

  if (emptyState) {
    emptyState.style.display = "none";
  }

  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loadingMessage";
  loadingDiv.className = "flex justify-start";
  loadingDiv.innerHTML = `
                <div class="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span class="text-sm">Thinking...</span>
                    </div>
                </div>
            `;

  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideLoadingMessage() {
  const loadingMessage = document.getElementById("loadingMessage");
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

function addMessageToChat(message, role) {
  const chatMessages = document.getElementById("chatMessages");
  const emptyState = document.getElementById("emptyState");

  if (emptyState) {
    emptyState.style.display = "none";
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `flex ${
    role === "user" ? "justify-end" : "justify-start"
  }`;

  const isAssistant = role === "assistant";
  let sourcesHtml = "";

  if (isAssistant && lastSearchResults.length > 0) {
    const uniqueFilenames = Array.from(
      new Set(lastSearchResults.map((r) => r.metadata?.filename))
    );
    const sourcesLinks = uniqueFilenames
      .map((filename, i) => {
        const source = lastSearchResults.find(
          (r) => r.metadata?.filename === filename
        );
        return `
                        <span class="tooltip mr-2">
                            <span class="underline cursor-pointer">${filename}</span>
                            <span class="tooltiptext">${
                              source ? source.content : "No content found"
                            }</span>
                        </span>
                        ${i < uniqueFilenames.length - 1 ? "," : ""}
                    `;
      })
      .join("");

    sourcesHtml = `
                    <div class="mt-2 text-xs text-gray-500">
                        <span class="font-semibold">Sources used: </span>
                        ${sourcesLinks}
                    </div>
                `;
  }

  messageDiv.innerHTML = `
                <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }">
                    <p class="text-sm whitespace-pre-wrap">${message}</p>
                    ${sourcesHtml}
                </div>
            `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateRouterSelects() {
  const dataSourcesSelect = document.getElementById("dataSources");
  const chatSourceSelect = document.getElementById("chatSource");

  // Clear existing options
  dataSourcesSelect.innerHTML = "";
  chatSourceSelect.innerHTML = '<option value="">Select a chat source</option>';

  // Populate data sources (search routers)
  searchRouters.forEach((router) => {
    const option = document.createElement("option");
    option.value = router.name;
    option.textContent = `${router.name} (${router.author})`;
    dataSourcesSelect.appendChild(option);
  });

  // Populate chat sources
  chatRouters.forEach((router) => {
    const option = document.createElement("option");
    option.value = router.name;
    option.textContent = `${router.name} (${router.author})`;
    chatSourceSelect.appendChild(option);
  });
}

async function loadRouters() {
  try {
    const response = await routerService.listRouters();
    if (response.success && response.data) {
      routers = response.data;

      // Filter routers with search service
      searchRouters = routers.filter(
        (router) =>
          router.published &&
          router.services.some(
            (service) => service.type === "search" && service.enabled
          )
      );

      // Filter routers with chat service
      chatRouters = routers.filter(
        (router) =>
          router.published &&
          router.services.some(
            (service) => service.type === "chat" && service.enabled
          )
      );

      updateRouterSelects();
    }
  } catch (error) {
    console.error("Error loading routers:", error);
  }
}

async function loadUserInfo() {
  try {
    const usernameResponse = await routerService.getUsername();
    if (usernameResponse.success && usernameResponse.data?.username) {
      document.getElementById("username").textContent =
        usernameResponse.data.username;
    } else {
      document.getElementById("username").textContent = "Unknown User";
    }
  } catch (error) {
    document.getElementById("username").textContent = "Unknown User";
  }

  try {
    const urlResponse = await routerService.getSyftBoxUrl();
    if (urlResponse.success && urlResponse.data) {
      const syftboxUrl = document.getElementById("syftboxUrl");
      const syftboxUrlLink = document.getElementById("syftboxUrlLink");

      syftboxUrlLink.href = urlResponse.data.url;
      syftboxUrlLink.textContent = urlResponse.data.url
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      syftboxUrl.classList.remove("hidden");
      syftboxUrl.classList.add("flex");
    }
  } catch (error) {
    // Silently fail, URL won't be shown
  }
}

async function handleSendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message || !selectedChatSource) {
    showError("Please enter a message and select a chat source");
    return;
  }

  // Add user message to chat history
  const userMessage = { role: "user", content: message };
  chatHistory.push(userMessage);
  addMessageToChat(message, "user");
  // Clear the input
  messageInput.value = "";

  setLoading(true);
  hideError();

  try {
    let enhancedMessage = message;
    const uniqueFiles = new Set();
    let searchResults = [];

    // If data sources are selected, search them first
    if (selectedDataSources.length > 0) {
      for (const routerName of selectedDataSources) {
        const router = searchRouters.find((r) => r.name === routerName);
        if (router) {
          try {
            const searchResponse = await chatService.search(
              router.name,
              router.author,
              message
            );
            if (searchResponse.success && searchResponse.data) {
              const results = searchResponse.data.data.message.body.results;
              searchResults.push(...results);

              // Collect unique filenames
              results.forEach((result) => {
                if (result.metadata?.filename) {
                  uniqueFiles.add(result.metadata.filename);
                }
              });
            }
          } catch (error) {
            console.error(`Error searching router ${routerName}:`, error);
          }
        }
      }

      // Collect search results for context
      if (searchResults.length > 0) {
        const sourceContent = searchResults
          .map((result) => result.content)
          .join("\n\n");
        enhancedMessage = sourceContent;
      }

      // Update lastSearchResults for tooltips
      lastSearchResults = searchResults;
    }

    // Add user message to chat history
    // const userMessage = { role: "user", content: message };
    // chatHistory.push(userMessage);
    // addMessageToChat(message, "user");

    // Find the selected chat router
    const chatRouter = chatRouters.find((r) => r.name === selectedChatSource);
    if (!chatRouter) {
      throw new Error("Selected chat source not found");
    }

    // Prepare messages for chat
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant that answers questions based on the provided source context.

Use the provided sources to answer the user's question accurately and comprehensively. If you do not know the answer from the sources, say so.`,
      },
      ...chatHistory,
      { role: "user", content: message },
    ];

    // If we have search results, add them as a separate system message for context
    if (selectedDataSources.length > 0 && searchResults.length > 0) {
      const formattedContext = searchResults
        .map(
          (result) =>
            `[${result.metadata?.filename || "unknown"}]\n${result.content}`
        )
        .join("\n\n");

      messages.splice(-1, 0, {
        role: "system",
        content: `Here is relevant source context to help answer the user's question:\n\n${formattedContext}`,
      });
    }

    // Send chat request
    const chatResponse = await chatService.chat(
      chatRouter.name,
      chatRouter.author,
      messages
    );

    if (chatResponse.success && chatResponse.data) {
      const assistantMessage = {
        role: "assistant",
        content: chatResponse.data.data.message.body.message.content,
      };
      chatHistory.push(assistantMessage);
      addMessageToChat(assistantMessage.content, "assistant");
    } else {
      throw new Error(chatResponse.error || "Failed to get chat response");
    }

    // Clear the input
    // messageInput.value = "";
  } catch (error) {
    console.error("Error in chat:", error);
    showError(error instanceof Error ? error.message : "An error occurred");
  } finally {
    setLoading(false);
  }
}

// Event listeners
document
  .getElementById("sendButton")
  .addEventListener("click", handleSendMessage);

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
});

document.getElementById("dataSources").addEventListener("change", (e) => {
  selectedDataSources = Array.from(
    e.target.selectedOptions,
    (option) => option.value
  );
});

document.getElementById("chatSource").addEventListener("change", (e) => {
  selectedChatSource = e.target.value;
});

// Tab functionality
// document.getElementById("routersTab").addEventListener("click", () => {
//   // Switch to routers tab (placeholder)
//   document.getElementById("routersTab").className =
//     "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 bg-blue-50";
//   document.getElementById("chatTab").className =
//     "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 hover:bg-gray-100";
// });

// document.getElementById("chatTab").addEventListener("click", () => {
//   // Switch to chat tab (current)
//   document.getElementById("chatTab").className =
//     "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 bg-blue-50";
//   document.getElementById("routersTab").className =
//     "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 hover:bg-gray-100";
// });

// Initialize the application
async function init() {
  await loadUserInfo();
  await loadRouters();
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
