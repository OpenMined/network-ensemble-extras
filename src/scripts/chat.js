// Application State
let state = {
  currentView: "chat",
  activeTab: "current",
  messages: [
    {
      id: 1,
      role: "system",
      content:
        "Welcome to the chat! Choose any model or create your own ensemble on the fly and try it out.",
    },
  ],
  inputValue: "",
  selectedModels: [],
  weights: [],
  ensembleMethod: "logprob_average",
  ensembleName: "Untitled",
  isConfigPanelOpen: false,
  isResponding: false,
  modelCounts: {},
  totalPrice: 0,
  availableModels: [],
  modelSearchTerm: "",
  isLoading: false,
};

// Sample model data
const sampleModels = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", inputTokenPrice: 0.03 },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    inputTokenPrice: 0.002,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    inputTokenPrice: 0.015,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    inputTokenPrice: 0.003,
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    inputTokenPrice: 0.00025,
  },
  {
    id: "llama-2-70b",
    name: "Llama 2 70B",
    provider: "Meta",
    inputTokenPrice: 0.0007,
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    inputTokenPrice: 0.008,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    inputTokenPrice: 0.0005,
  },
];

const previousChats = [
  {
    id: 1,
    name: "Coding Assistant",
    lastMessage: "Here's the solution to your React problem...",
    date: "2 hours ago",
    models: ["GPT-4", "Claude 3"],
  },
  {
    id: 2,
    name: "Math Solver",
    lastMessage: "The integral of x^2 sin(x) can be solved using...",
    date: "Yesterday",
    models: ["GPT-4", "Llama 3", "Mistral"],
  },
  {
    id: 3,
    name: "Creative Writing",
    lastMessage: "Here's a story about a space explorer who...",
    date: "3 days ago",
    models: ["Claude 3", "GPT-4"],
  },
  {
    id: 4,
    name: "Research Helper",
    lastMessage: "Based on recent papers in quantum computing...",
    date: "1 week ago",
    models: ["GPT-4", "PaLM 2"],
  },
];

// DOM Elements
const elements = {
  chatTitle: document.getElementById("chatTitle"),
  modelsBadge: document.getElementById("modelsBadge"),
  priceBadge: document.getElementById("priceBadge"),
  messagesContainer: document.getElementById("messagesContainer"),
  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  configPanel: document.getElementById("configPanel"),
  configCloseBtn: document.getElementById("configCloseBtn"),
  ensembleName: document.getElementById("ensembleName"),
  ensembleMethod: document.getElementById("ensembleMethod"),
  methodHelpText: document.getElementById("methodHelpText"),
  modelCount: document.getElementById("modelCount"),
  addModelBtn: document.getElementById("addModelBtn"),
  modelSelector: document.getElementById("modelSelector"),
  modelSearch: document.getElementById("modelSearch"),
  modelList: document.getElementById("modelList"),
  modelsContainer: document.getElementById("modelsContainer"),
  normalizeBtn: document.getElementById("normalizeBtn"),
  saveBtn: document.getElementById("saveBtn"),
  publishBtn: document.getElementById("publishBtn"),
  resetBtn: document.getElementById("resetBtn"),
  currentChatTab: document.getElementById("currentChatTab"),
  previousChatsTab: document.getElementById("previousChatsTab"),
  currentChatView: document.getElementById("currentChatView"),
  previousChatsView: document.getElementById("previousChatsView"),
  previousChatsList: document.getElementById("previousChatsList"),
  newChatBtn: document.getElementById("newChatBtn"),
  saveModal: document.getElementById("saveModal"),
  publishModal: document.getElementById("publishModal"),
};

// Initialize application
function init() {
  state.availableModels = sampleModels;
  setupEventListeners();
  updateUI();
  renderPreviousChats();
  renderModelList();
}

// Setup event listeners
function setupEventListeners() {
  // Chat tabs
  elements.currentChatTab.addEventListener("click", () => switchTab("current"));
  elements.previousChatsTab.addEventListener("click", () =>
    switchTab("previous")
  );

  // Config panel
  elements.settingsBtn.addEventListener("click", () => toggleConfigPanel());
  elements.configCloseBtn.addEventListener("click", () => toggleConfigPanel());

  // Chat input
  elements.chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  elements.sendBtn.addEventListener("click", sendMessage);

  // Ensemble config
  elements.ensembleName.addEventListener("input", (e) => {
    state.ensembleName = e.target.value;
    updateUI();
  });

  elements.ensembleMethod.addEventListener("change", (e) => {
    state.ensembleMethod = e.target.value;
    updateMethodHelpText();
    updateUI();
  });

  // Model selection
  elements.addModelBtn.addEventListener("click", () => toggleModelSelector());
  elements.modelSearch.addEventListener("input", (e) => {
    state.modelSearchTerm = e.target.value;
    renderModelList();
  });

  // Actions
  elements.saveBtn.addEventListener("click", () => showSaveModal());
  elements.publishBtn.addEventListener("click", () => showPublishModal());
  elements.resetBtn.addEventListener("click", resetEnsemble);
  elements.normalizeBtn.addEventListener("click", normalizeWeights);
  elements.newChatBtn.addEventListener("click", () => {
    resetEnsemble();
    switchTab("current");
  });

  // Modal events
  setupModalEvents();

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !elements.modelSelector.contains(e.target) &&
      !elements.addModelBtn.contains(e.target)
    ) {
      elements.modelSelector.classList.add("hidden");
    }
  });
}

function setupModalEvents() {
  // Save modal
  document
    .getElementById("saveModalClose")
    .addEventListener("click", () => hideModal("saveModal"));
  document
    .getElementById("saveCancelBtn")
    .addEventListener("click", () => hideModal("saveModal"));
  document
    .getElementById("saveConfirmBtn")
    .addEventListener("click", saveEnsemble);

  // Publish modal
  document
    .getElementById("publishModalClose")
    .addEventListener("click", () => hideModal("publishModal"));
  document
    .getElementById("publishCancelBtn")
    .addEventListener("click", () => hideModal("publishModal"));
  document
    .getElementById("publishConfirmBtn")
    .addEventListener("click", publishEnsemble);
}

// UI Update functions
function updateUI() {
  elements.chatTitle.textContent = state.ensembleName;
  elements.modelsBadge.textContent = `${state.selectedModels.length} Models`;
  elements.priceBadge.textContent = `$${state.totalPrice.toFixed(3)}/1K Tokens`;
  elements.modelCount.textContent = state.selectedModels.length;

  // Update input state
  const hasModels = state.selectedModels.length > 0;
  elements.chatInput.disabled = !hasModels;
  elements.sendBtn.disabled =
    !hasModels || state.inputValue.trim() === "" || state.isResponding;
  elements.saveBtn.disabled = !hasModels;
  elements.publishBtn.disabled = !hasModels;

  elements.chatInput.placeholder = hasModels
    ? "Message your ensemble..."
    : "Add models to start chatting...";

  // Update config panel state
  if (state.isConfigPanelOpen) {
    elements.configPanel.classList.add("open");
  } else {
    elements.configPanel.classList.remove("open");
  }

  // Update normalize button visibility
  if (
    state.ensembleMethod === "weighted_logprob" &&
    state.selectedModels.length > 0
  ) {
    elements.normalizeBtn.classList.remove("hidden");
  } else {
    elements.normalizeBtn.classList.add("hidden");
  }

  updateTotalPrice();
  renderSelectedModels();
}

function updateTotalPrice() {
  let price = 0;
  state.selectedModels.forEach((model, index) => {
    const modelPrice = model.inputTokenPrice || 0;
    if (state.ensembleMethod === "weighted_logprob") {
      const modelWeight = state.weights[index] || 1;
      price += modelPrice * modelWeight;
    } else {
      price += modelPrice * (1 / Math.max(1, state.selectedModels.length));
    }
  });
  state.totalPrice = price;
}

function updateMethodHelpText() {
  const helpTexts = {
    logprob_average: "Simple averaging of scores from all models",
    weighted_logprob: "Weighted average based on model confidence",
    majority_voting: "Choose the most common answer across models",
  };
  elements.methodHelpText.textContent = helpTexts[state.ensembleMethod] || "";
}

function switchTab(tab) {
  state.activeTab = tab;

  if (tab === "current") {
    elements.currentChatTab.classList.add("active");
    elements.previousChatsTab.classList.remove("active");
    elements.currentChatView.classList.remove("hidden");
    elements.previousChatsView.classList.add("hidden");
  } else {
    elements.currentChatTab.classList.remove("active");
    elements.previousChatsTab.classList.add("active");
    elements.currentChatView.classList.add("hidden");
    elements.previousChatsView.classList.remove("hidden");
  }
}

function toggleConfigPanel() {
  state.isConfigPanelOpen = !state.isConfigPanelOpen;
  updateUI();
}

function toggleModelSelector() {
  elements.modelSelector.classList.toggle("hidden");
}

// Model management
function addModel(model) {
  const existingIndex = state.selectedModels.findIndex(
    (m) => m.id === model.id
  );

  if (existingIndex >= 0) {
    state.modelCounts[model.id] = (state.modelCounts[model.id] || 1) + 1;
    return;
  }

  const newModel = {
    ...model,
    inputTokenPrice: model.inputTokenPrice || 0,
    weight: state.ensembleMethod === "weighted_logprob" ? 1 : 1,
  };

  state.selectedModels.push(newModel);
  state.weights.push(1);
  state.modelCounts[model.id] = 1;

  elements.modelSelector.classList.add("hidden");
  state.modelSearchTerm = "";
  elements.modelSearch.value = "";

  updateUI();
  renderModelList();
}

function removeModel(index) {
  const removedModel = state.selectedModels[index];
  state.selectedModels.splice(index, 1);
  state.weights.splice(index, 1);

  if (
    state.selectedModels.filter((m) => m.id === removedModel.id).length === 0
  ) {
    delete state.modelCounts[removedModel.id];
  }

  updateUI();
}

function updateModelWeight(index, weight) {
  const numWeight = parseFloat(weight) || 0;
  state.selectedModels[index].weight = numWeight;
  state.weights[index] = numWeight;
  updateUI();
}

function normalizeWeights() {
  if (
    state.ensembleMethod !== "weighted_logprob" ||
    state.selectedModels.length === 0
  )
    return;

  const totalWeight = state.weights.reduce(
    (sum, weight) => sum + (weight || 0),
    0
  );
  if (totalWeight === 0) return;

  state.weights = state.weights.map((weight) => (weight || 0) / totalWeight);
  state.selectedModels.forEach((model, index) => {
    model.weight = state.weights[index];
  });

  updateUI();
}

function resetEnsemble() {
  state.selectedModels = [];
  state.weights = [];
  state.ensembleMethod = "logprob_average";
  state.ensembleName = "Untitled";
  state.messages = [
    {
      id: 1,
      role: "system",
      content:
        "Welcome to the chat! Choose any model or create your own ensemble on the fly and try it out.",
    },
  ];
  state.modelCounts = {};
  state.isConfigPanelOpen = true;

  elements.ensembleName.value = "Untitled";
  elements.ensembleMethod.value = "logprob_average";

  updateMethodHelpText();
  updateUI();
  renderMessages();
}

// Rendering functions
function renderModelList() {
  const filteredModels = state.availableModels.filter(
    (model) =>
      model.name.toLowerCase().includes(state.modelSearchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(state.modelSearchTerm.toLowerCase())
  );

  elements.modelList.innerHTML = filteredModels
    .map(
      (model) => `
                <div class="model-selector-item" data-model-id="${model.id}">
                    <div class="model-selector-info">
                        <div class="model-selector-name">${model.name}</div>
                        <div class="model-selector-provider">
                            ${model.provider} • $${(
        model.inputTokenPrice || 0
      ).toFixed(3)}/1K tokens
                        </div>
                    </div>
                </div>
            `
    )
    .join("");

  // Add click handlers
  elements.modelList
    .querySelectorAll(".model-selector-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        const modelId = item.dataset.modelId;
        const model = state.availableModels.find((m) => m.id === modelId);
        if (model) addModel(model);
      });
    });
}

function renderSelectedModels() {
  if (state.selectedModels.length === 0) {
    elements.modelsContainer.innerHTML =
      '<div class="empty-models">No models added yet</div>';
    return;
  }

  elements.modelsContainer.innerHTML = `
                <div class="models-list">
                    ${state.selectedModels
                      .map(
                        (model, index) => `
                        <div class="model-item">
                            <div class="model-item-header">
                                <div class="model-item-info">
                                    <div class="model-number">${index + 1}</div>
                                    <div class="model-details">
                                        <div class="model-name">${
                                          model.name
                                        }</div>
                                        <div class="model-provider">${
                                          model.provider
                                        }</div>
                                    </div>
                                </div>
                                <button class="remove-model" data-index="${index}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x "><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                </button>
                            </div>
                            
                            ${
                              state.ensembleMethod === "weighted_logprob"
                                ? `
                                <div class="weight-control">
                                    <div class="weight-label">
                                        <span class="weight-text">Weight</span>
                                        <span class="weight-value">${(
                                          state.weights[index] || 0
                                        ).toFixed(2)}</span>
                                    </div>
                                    <div class="weight-slider-container">
                                        <input type="range" class="weight-slider" min="0" max="10" step="0.1" 
                                               value="${
                                                 state.weights[index] || 0
                                               }" data-index="${index}">
                                        <input type="number" class="weight-input" min="0" max="10" step="0.1"
                                               value="${
                                                 state.weights[index] || 0
                                               }" data-index="${index}">
                                    </div>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

  // Add event listeners for remove buttons
  elements.modelsContainer.querySelectorAll(".remove-model").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      removeModel(index);
    });
  });

  // Add event listeners for weight controls
  elements.modelsContainer
    .querySelectorAll(".weight-slider, .weight-input")
    .forEach((input) => {
      input.addEventListener("input", (e) => {
        const index = parseInt(e.target.dataset.index);
        updateModelWeight(index, e.target.value);
      });
    });
}

function renderMessages() {
  elements.messagesContainer.innerHTML = state.messages
    .map(
      (message) => `
                <div class="message ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }">
                    <div class="message-content">
                        ${
                          message.role === "assistant" ||
                          message.role === "system"
                            ? `<div class="markdown-content">${marked.parse(
                                message.content
                              )}</div>`
                            : `<p>${message.content}</p>`
                        }
                        ${
                          message.models
                            ? `
                            <div class="message-models">
                                <span>Models: ${message.models.join(
                                  ", "
                                )}</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
    )
    .join("");

  // Scroll to bottom
  elements.messagesContainer.scrollTop =
    elements.messagesContainer.scrollHeight;
}

function renderPreviousChats() {
  elements.previousChatsList.innerHTML = previousChats
    .map(
      (chat) => `
                <div class="previous-chat-item" data-chat-id="${chat.id}">
                    <div class="previous-chat-content">
                        <h3 class="previous-chat-name">${chat.name}</h3>
                        <p class="previous-chat-message">${chat.lastMessage}</p>
                        <div class="previous-chat-meta">
                            <span class="previous-chat-date">${chat.date}</span>
                            <div class="previous-chat-models">
                                ${chat.models
                                  .map(
                                    (model) =>
                                      `<span class="previous-chat-model">${model}</span>`
                                  )
                                  .join(", ")}
                            </div>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");

  // Add click handlers
  elements.previousChatsList
    .querySelectorAll(".previous-chat-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        // Load selected chat logic would go here
        switchTab("current");
      });
    });
}

// Chat functionality
function sendMessage() {
  const inputValue = elements.chatInput.value.trim();
  if (
    inputValue === "" ||
    state.selectedModels.length === 0 ||
    state.isResponding
  )
    return;

  // Add user message
  const userMessage = {
    id: Date.now(),
    role: "user",
    content: inputValue,
  };

  state.messages.push(userMessage);
  elements.chatInput.value = "";
  state.inputValue = "";
  state.isResponding = true;

  renderMessages();
  showTypingIndicator();
  updateUI();

  // Simulate API response
  setTimeout(() => {
    const response = generateFallbackResponse(
      inputValue,
      state.selectedModels,
      state.ensembleMethod
    );

    const assistantMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: response,
      models: state.selectedModels.map((model) => model.name),
    };

    state.messages.push(assistantMessage);
    state.isResponding = false;

    hideTypingIndicator();
    renderMessages();
    updateUI();
  }, 1500);
}

function generateFallbackResponse(prompt, models, method) {
  const responseOptions = [
    "Based on the ensemble's combined knowledge, I can provide a comprehensive answer to your question.",
    "The models in this ensemble have different strengths, which allows me to give you a well-rounded response.",
    "By leveraging multiple models, I can offer a more reliable answer than any single model could provide.",
  ];

  let response =
    responseOptions[Math.floor(Math.random() * responseOptions.length)];

  if (prompt.includes("hello") || prompt.includes("hi")) {
    response += " Hello! How can I assist you today?";
  } else if (prompt.includes("?")) {
    response +=
      " To answer your question, I'd need more context, but I can provide some general guidance...";
  } else if (
    prompt.toLowerCase().includes("what") ||
    prompt.toLowerCase().includes("how")
  ) {
    response += " I can help with that question. Here's some information...";
  } else {
    response += " I understand your request. Here's what I can offer...";
  }

  return (
    response +
    ` [Note: This is a simulated response. In a real implementation, this would connect to actual model APIs]`
  );
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typingIndicator";
  indicator.innerHTML =
    '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  elements.messagesContainer.appendChild(indicator);
  elements.messagesContainer.scrollTop =
    elements.messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) {
    indicator.remove();
  }
}

// Modal functions
function showSaveModal() {
  document.getElementById("saveEnsembleName").value = state.ensembleName;
  elements.saveModal.classList.remove("hidden");
}

function showPublishModal() {
  elements.publishModal.classList.remove("hidden");
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function saveEnsemble() {
  console.log("Saving ensemble:", {
    name: state.ensembleName,
    method: state.ensembleMethod,
    models: state.selectedModels,
  });

  hideModal("saveModal");

  const systemMessage = {
    id: Date.now(),
    role: "system",
    content: `Ensemble "${state.ensembleName}" has been saved successfully.`,
  };

  state.messages.push(systemMessage);
  renderMessages();
}

function publishEnsemble() {
  console.log("Publishing to leaderboard:", {
    name: state.ensembleName,
    method: state.ensembleMethod,
    models: state.selectedModels,
  });

  hideModal("publishModal");

  const systemMessage = {
    id: Date.now(),
    role: "system",
    content: `Ensemble "${state.ensembleName}" has been submitted for benchmark evaluation. Results will be available in a few hours.`,
  };

  state.messages.push(systemMessage);
  renderMessages();
}

// Update input value tracking
elements.chatInput.addEventListener("input", (e) => {
  state.inputValue = e.target.value;
  updateUI();
});

// Initialize the application
updateMethodHelpText();
init();
