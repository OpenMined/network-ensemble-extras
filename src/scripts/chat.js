// Configuration
// const API_BASE_URL =  "/api" || "http://74.235.204.42:34141" || "http://localhost:8080";
const API_BASE_URL = location.hostname === "localhost"
  ? "http://74.235.204.42:34141" || "http://localhost:8080"
  : "/api";


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
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
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
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          errorDetails: JSON.stringify(data, null, 2)
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
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

        if (response.status === 200 && data?.data?.message?.status_code === 200) {
          return {
            success: true,
            data,
          };
        } else if (response.status === 202 || data?.data?.message?.status_code !== 200) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        } else {
          return {
            success: false,
            error: data.message || `HTTP ${response.status}: ${response.statusText}`,
            errorDetails: JSON.stringify(data, null, 2)
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
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

// Mobile configuration toggle
function initConfigToggle() {
  const configToggle = document.getElementById('configToggle');
  const configPanel = document.getElementById('configPanel');
  
  if (configToggle && configPanel) {
    configToggle.addEventListener('click', () => {
      configPanel.classList.toggle('collapsed');
      const isCollapsed = configPanel.classList.contains('collapsed');
      configToggle.innerHTML = isCollapsed 
        ? '<i class="fas fa-cog"></i>' 
        : '<i class="fas fa-times"></i>';
    });
  }
}

// Helper functions
function extractFilenames(text) {
  const matches = text.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}

function getRouterStatus(router, type) {
  const service = router.services.find(s => s.type === type);
  return {
    isEnabled: service?.enabled || false,
    pricing: service?.pricing || 0
  };
}

function calculateTotalPrice() {
  let total = 0;
  
  // Add pricing for selected data sources (search services)
  selectedDataSources.forEach(sourceName => {
    const router = searchRouters.find(r => r.name === sourceName);
    if (router) {
      const searchService = router.services.find(s => s.type === 'search');
      if (searchService) {
        total += searchService.pricing || 0;
      }
    }
  });
  
  // Add pricing for selected chat source
  if (selectedChatSource) {
    const router = chatRouters.find(r => r.name === selectedChatSource);
    if (router) {
      const chatService = router.services.find(s => s.type === 'chat');
      if (chatService) {
        total += chatService.pricing || 0;
      }
    }
  }
  
  return total;
}

function updateCostDisplay() {
  const costDisplay = document.getElementById('costDisplay');
  const costValue = document.getElementById('costValue');
  
  if (costDisplay && costValue) {
    if (selectedDataSources.length > 0 || selectedChatSource) {
      const total = calculateTotalPrice();
      if (total === 0) {
        costValue.innerHTML = '<span class="text-green-600 font-medium">Free</span>';
      } else {
        costValue.innerHTML = `<span class="text-gray-700 font-medium">$${total.toFixed(2)}</span>`;
      }
      costDisplay.style.display = 'block';
    } else {
      costDisplay.style.display = 'none';
    }
  }
}

function showError(message, details = null) {
  const errorDisplay = document.getElementById('errorDisplay');
  const errorText = document.getElementById('errorText');
  const errorToggle = document.getElementById('errorDetailsToggle');
  const errorDetail = document.getElementById('errorDetails');
  
  if (errorDisplay && errorText) {
    errorText.textContent = message;
    
    if (details && errorToggle && errorDetail) {
      errorToggle.style.display = 'inline';
      errorDetail.textContent = details;
      errorToggle.onclick = () => {
        if (errorDetail.classList.contains('hidden')) {
          errorDetail.classList.remove('hidden');
          errorToggle.textContent = 'Hide details';
        } else {
          errorDetail.classList.add('hidden');
          errorToggle.textContent = 'See more information';
        }
      };
    } else if (errorToggle && errorDetail) {
      errorToggle.style.display = 'none';
      errorDetail.classList.add('hidden');
    }
    
    errorDisplay.classList.remove("hidden");
  }
}

function hideError() {
  const errorDisplay = document.getElementById('errorDisplay');
  if (errorDisplay) {
    errorDisplay.classList.add("hidden");
  }
}

function setLoading(loading) {
  isLoading = loading;
  const sendButton = document.getElementById("sendButton");
  const messageInput = document.getElementById("messageInput");

  if (sendButton) {
    sendButton.disabled = loading;
    if (loading) {
      sendButton.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span class="sr-only">Sending...</span>
      `;
    } else {
      sendButton.innerHTML = `
        <i class="fa-solid fa-paper-plane"></i>
        <span class="sr-only">Send</span>
      `;
    }
  }

  if (messageInput) {
    messageInput.disabled = loading;
  }

  if (loading) {
    showLoadingMessage();
  } else {
    hideLoadingMessage();
  }
}

function showLoadingMessage() {
  const chatMessages = document.getElementById('chatMessages');
  const emptyState = document.getElementById('emptyState');
  const chatContainer = document.getElementById('chatMessagesContainer');

  if (chatMessages && chatContainer) {
    if (emptyState) {
      emptyState.style.display = "none";
    }

    // Remove existing loading message
    const existingLoading = chatMessages.querySelector('#loadingMessage');
    if (existingLoading) {
      existingLoading.remove();
    }

    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loadingMessage";
    loadingDiv.className = "flex justify-start mt-4";
    loadingDiv.innerHTML = `
      <div class="bg-gray-100 text-gray-900 max-w-xs px-4 py-3 rounded-2xl rounded-bl-md">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span class="text-sm">Thinking...</span>
        </div>
      </div>
    `;

    chatMessages.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

function hideLoadingMessage() {
  const loadingMessage = document.getElementById("loadingMessage");
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

function addMessageToChat(message, role) {
  const chatMessages = document.getElementById('chatMessages');
  const emptyState = document.getElementById('emptyState');
  const chatContainer = document.getElementById('chatMessagesContainer');

  if (chatMessages && chatContainer) {
    if (emptyState) {
      emptyState.style.display = "none";
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;

    const isAssistant = role === "assistant";
    let sourcesHtml = "";

    if (isAssistant && lastSearchResults.length > 0) {
      const uniqueFilenames = Array.from(new Set(lastSearchResults.map((r) => r.metadata?.filename)));
      const sourcesLinks = uniqueFilenames
        .map((filename, i) => {
          const source = lastSearchResults.find((r) => r.metadata?.filename === filename);
          return `
            <span class="tooltip mr-2">
              <span class="underline cursor-pointer hover:text-gray-800">${filename}</span>
              <span class="tooltiptext">${source ? source.content : "No content found"}</span>
            </span>
            ${i < uniqueFilenames.length - 1 ? "," : ""}
          `;
        })
        .join("");

      sourcesHtml = `
        <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <span class="font-semibold">Sources: </span>
          ${sourcesLinks}
        </div>
      `;
    }

    messageDiv.innerHTML = `
      <div class="max-w-2xl px-4 py-3 rounded-2xl ${
        role === "user"
          ? "bg-blue-500 text-white rounded-br-md"
          : "bg-gray-100 text-gray-900 rounded-bl-md"
      }">
        <p class="text-sm whitespace-pre-wrap leading-relaxed">${message}</p>
        ${sourcesHtml}
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Dropdown functionality
function createDropdown(buttonId, menuId, isMulti = false) {
  const button = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);
  
  if (!button || !menu) return;
  
  const icon = button.querySelector('svg');

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    
    // Close all dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.dropdown-button svg').forEach(i => i.classList.remove('rotate-180'));
    
    if (!isOpen) {
      menu.classList.add('open');
      if (icon) icon.classList.add('rotate-180');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      if (icon) icon.classList.remove('rotate-180');
    }
  });
}

function updateChatSourceDropdown() {
  const container = document.getElementById('chatSourceDropdown');
  const empty = document.getElementById('chatSourceEmpty');
  const menu = document.getElementById('chatSourceMenu');
  
  if (!container || !empty || !menu) return;
  
  if (chatRouters.length === 0) {
    container.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  empty.style.display = 'none';
  
  menu.innerHTML = '';
  
  chatRouters.forEach(router => {
    const { isEnabled, pricing } = getRouterStatus(router, 'chat');
    const item = document.createElement('button');
    item.className = `dropdown-item ${!isEnabled ? 'disabled' : ''} ${selectedChatSource === router.name ? 'selected' : ''}`;
    
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 truncate">${router.name}</div>
          <div class="text-sm text-gray-500 truncate">by ${router.author}</div>
          <div class="mt-1 flex items-center space-x-2">
            <span class="status-badge ${isEnabled ? 'status-available' : 'status-disabled'}">
              ${isEnabled ? '✓ Available' : '✗ Disabled'}
            </span>
            ${pricing > 0 ? 
              `<span class="status-badge status-paid">$${pricing}/req</span>` :
              `<span class="status-badge status-free">Free</span>`
            }
          </div>
        </div>
        ${selectedChatSource === router.name ? `
          <div class="ml-2">
            <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    item.addEventListener('click', () => {
      selectedChatSource = router.name;
      updateChatSourceDisplay();
      updateCostDisplay();
      menu.classList.remove('open');
      const button = document.getElementById('chatSourceButton');
      if (button) {
        const icon = button.querySelector('svg');
        if (icon) icon.classList.remove('rotate-180');
      }
    });
    
    menu.appendChild(item);
  });
}

function updateChatSourceDisplay() {
  const placeholder = document.getElementById('chatSourcePlaceholder');
  const selected = document.getElementById('chatSourceSelected');
  const name = document.getElementById('chatSourceName');
  const author = document.getElementById('chatSourceAuthor');
  
  if (placeholder && selected && name && author) {
    if (selectedChatSource) {
      const router = chatRouters.find(r => r.name === selectedChatSource);
      if (router) {
        placeholder.style.display = 'none';
        selected.style.display = 'block';
        name.textContent = router.name;
        author.textContent = `by ${router.author}`;
      }
    } else {
      placeholder.style.display = 'block';
      selected.style.display = 'none';
    }
  }
}

function updateDataSourcesDropdown() {
  const container = document.getElementById('dataSourcesContainer');
  const empty = document.getElementById('dataSourcesEmpty');
  const menu = document.getElementById('dataSourcesMenu');
  
  if (!container || !empty || !menu) return;
  
  if (searchRouters.length === 0) {
    container.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  empty.style.display = 'none';
  
  menu.innerHTML = '';
  
  // Clear all button
  if (selectedDataSources.length > 0) {
    const clearButton = document.createElement('div');
    clearButton.className = 'px-4 py-2 border-b border-gray-200';
    clearButton.innerHTML = `
      <button type="button" class="text-sm text-blue-600 hover:text-blue-800">
        Clear all selections
      </button>
    `;
    clearButton.querySelector('button').addEventListener('click', () => {
      selectedDataSources = [];
      updateDataSourcesDisplay();
      updateDataSourcesDropdown();
      updateCostDisplay();
    });
    menu.appendChild(clearButton);
  }
  
  searchRouters.forEach(router => {
    const { isEnabled, pricing } = getRouterStatus(router, 'search');
    const isSelected = selectedDataSources.includes(router.name);
    const item = document.createElement('button');
    item.className = `dropdown-item ${!isEnabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`;
    
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 truncate">${router.name}</div>
          <div class="text-sm text-gray-500 truncate">by ${router.author}</div>
          <div class="mt-1 flex items-center space-x-2">
            <span class="status-badge ${isEnabled ? 'status-available' : 'status-disabled'}">
              ${isEnabled ? '✓ Available' : '✗ Disabled'}
            </span>
            ${pricing > 0 ? 
              `<span class="status-badge status-paid">$${pricing}/req</span>` :
              `<span class="status-badge status-free">Free</span>`
            }
          </div>
        </div>
        <div class="ml-2 flex items-center">
          <div class="w-5 h-5 border-2 rounded flex items-center justify-center ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }">
            ${isSelected ? `
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      if (isSelected) {
        selectedDataSources = selectedDataSources.filter(name => name !== router.name);
      } else {
        selectedDataSources.push(router.name);
      }
      updateDataSourcesDisplay();
      updateDataSourcesDropdown();
      updateCostDisplay();
    });
    
    menu.appendChild(item);
  });
}

function updateDataSourcesDisplay() {
  const display = document.getElementById('dataSourcesDisplay');
  if (display) {
    if (selectedDataSources.length > 0) {
      display.innerHTML = `
        <div class="font-medium text-gray-900">
          ${selectedDataSources.length} source${selectedDataSources.length > 1 ? 's' : ''} selected
        </div>
        <div class="text-sm text-gray-500 truncate">
          ${selectedDataSources.slice(0, 2).join(', ')}
          ${selectedDataSources.length > 2 ? ` +${selectedDataSources.length - 2} more` : ''}
        </div>
      `;
    } else {
      display.innerHTML = '<span class="text-gray-500">Select data sources</span>';
    }
  }
}

function updateSourcePreview() {
  const preview = document.getElementById('sourcePreview');
  if (preview) {
    preview.innerHTML = '';
    
    searchRouters.slice(0, 3).forEach(router => {
      const { isEnabled, pricing } = getRouterStatus(router, 'search');
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg';
      
      item.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 text-sm truncate">${router.name}</div>
          <div class="text-xs text-gray-500 truncate">by ${router.author}</div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="status-badge ${isEnabled ? 'status-available' : 'status-disabled'}">
            ${isEnabled ? '✓' : '✗'}
          </span>
          ${pricing === 0 ? `
            <span class="status-badge status-free">Free</span>
          ` : ''}
        </div>
      `;
      
      preview.appendChild(item);
    });
    
    if (searchRouters.length > 3) {
      const more = document.createElement('div');
      more.className = 'text-center py-2';
      more.innerHTML = `
        <span class="text-xs text-gray-500">
          +${searchRouters.length - 3} more sources available
        </span>
      `;
      preview.appendChild(more);
    }
  }
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

      updateChatSourceDropdown();
      updateDataSourcesDropdown();
      updateSourcePreview();
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

      if (syftboxUrl && syftboxUrlLink) {
        syftboxUrlLink.href = urlResponse.data.url;
        syftboxUrlLink.textContent = urlResponse.data.url
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
        syftboxUrl.classList.remove("hidden");
        syftboxUrl.classList.add("flex");
      }
    }
  } catch (error) {
    // Silently fail, URL won't be shown
  }
}

async function handleSendMessage() {
  const messageInput = document.getElementById("messageInput");
  if (!messageInput) return;
  
  const message = messageInput.value.trim();

  if (!message || !selectedChatSource) {
    showError("Please enter a message and select a chat source");
    return;
  }

  setLoading(true);
  hideError();

  try {
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

      // Update lastSearchResults for tooltips
      lastSearchResults = searchResults;
    }

    // Add user message to chat history
    const userMessage = { role: "user", content: message };
    chatHistory.push(userMessage);
    addMessageToChat(message, "user");

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
      // Show improved error message from chatService
      showError(
        chatResponse.error || "Something bad happened. Please try again later.",
        chatResponse.errorDetails
      );
      setLoading(false);
      return;
    }

    // Clear input
    messageInput.value = "";
  } catch (error) {
    console.error("Error in chat:", error);
    let errorMessage = "An error occurred";

    if (error instanceof Error) {
      if (error.message.includes("message not found")) {
        errorMessage =
          "Server error: The selected router service is currently unavailable. Please try a different router or try again later.";
      } else if (error.message.includes("500")) {
        errorMessage =
          "Server error: The router service is experiencing issues. Please try again later.";
      } else {
        errorMessage = error.message;
      }
    }

    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Event listeners
function initEventListeners() {
  const sendButton = document.getElementById("sendButton");
  const messageInput = document.getElementById("messageInput");

  if (sendButton) {
    sendButton.addEventListener("click", handleSendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Initialize dropdowns
  createDropdown('chatSourceButton', 'chatSourceMenu', false);
  createDropdown('dataSourcesButton', 'dataSourcesMenu', true);
}

// Initialize the application
async function init() {
  await loadUserInfo();
  await loadRouters();
  initConfigToggle();
  initEventListeners();
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);