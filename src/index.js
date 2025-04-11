// Handle page rendering
document.addEventListener("DOMContentLoaded", function () {
  const featuredModelsData = [
    {
      title: "MultiModal Fusion v2.4",
      author: "DeepMind Research",
      downloads: "12.4k downloads",
      rating: "4.9",
      tags: ["Vision", "NLP", "Audio"],
      gradient: "bg-gradient-to-r from-[#F79763] to-[#CC677B]",
    },
    {
      title: "Transformer Ensemble Pro",
      author: "OpenAI Contributors",
      downloads: "8.7k downloads",
      rating: "4.8",
      tags: ["NLP", "Few-shot", "Enterprise"],
      gradient: "bg-gradient-to-r from-[#6976AE] to-[#937098]",
    },
    {
      title: "BioMed Inference Engine",
      author: "Stanford ML Group",
      downloads: "5.2k downloads",
      rating: "4.7",
      tags: ["Healthcare", "Research", "Tabular"],
      gradient: "bg-gradient-to-r from-[#53BEA9] to-[#52AEC5]",
    },
    {
      title: "FinanceGPT Ensemble",
      author: "Quantitative Systems",
      downloads: "6.8k downloads",
      rating: "4.6",
      tags: ["Finance", "Time-series", "Forecasting"],
      gradient: "bg-gradient-to-r from-[#F8C073] to-[#F79763]",
    },
  ];

  const modelCardTemplate = document.getElementById("modelCardTemplate");
  const modelCardsContainer = document.getElementById("modelCards");

  function renderModelCard(model) {
    const card = modelCardTemplate.content.cloneNode(true);
    const gradientDiv = card.querySelector("[data-gradient]");
    const titleElement = card.querySelector("[data-title]");
    const authorElement = card.querySelector("[data-author]");
    const downloadsElement = card.querySelector("[data-downloads]");
    const ratingElement = card.querySelector("[data-rating]");
    const tagsContainer = card.querySelector("[data-tags]");

    gradientDiv.className = gradientDiv.className + ` ${model.gradient}`;
    titleElement.textContent = model.title;
    authorElement.textContent = `by ${model.author}`;
    downloadsElement.textContent = model.downloads;
    ratingElement.textContent = `${model.rating}/5`;

    model.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className =
        "text-xs bg-[#F4F3F6] text-[#2E2B3B] px-2 py-1 rounded-full";
      tagSpan.textContent = tag;
      tagsContainer.appendChild(tagSpan);
    });

    return card;
  }

  function displayModels(models) {
    if (modelCardsContainer) {
      modelCardsContainer.innerHTML = ""; // Clear existing cards
      models.forEach((model) => {
        const card = renderModelCard(model);
        modelCardsContainer.appendChild(card);
      });
    }
  }

  let selectedTab = "trending";
  const trendingModels = featuredModelsData;
  const newestModels = [...featuredModelsData].sort(() => Math.random() - 0.5); // Simulate newest
  const topRatedModels = [...featuredModelsData].sort(
    (a, b) => parseFloat(b.rating) - parseFloat(a.rating)
  );

  function updateTabStyles() {
    const trendingTab = document.getElementById("trendingTab");
    const newestTab = document.getElementById("newestTab");
    const topTab = document.getElementById("topTab");

    if (trendingTab) {
      trendingTab.className = `px-4 py-2 text-sm ${
        selectedTab === "trending"
          ? "bg-[#2E2B3B] text-white"
          : "bg-white text-[#464158]"
      }`;
    }
    if (newestTab) {
      newestTab.className = `px-4 py-2 text-sm ${
        selectedTab === "newest"
          ? "bg-[#2E2B3B] text-white"
          : "bg-white text-[#464158]"
      }`;
    }
    if (topTab) {
      topTab.className = `px-4 py-2 text-sm ${
        selectedTab === "top"
          ? "bg-[#2E2B3B] text-white"
          : "bg-white text-[#464158]"
      }`;
    }
  }

  function selectTab(tab) {
    selectedTab = tab;
    updateTabStyles();
    if (tab === "trending") {
      displayModels(trendingModels);
    } else if (tab === "newest") {
      displayModels(newestModels);
    } else if (tab === "top") {
      displayModels(topRatedModels);
    }
  }

  // Initial display
  selectTab(selectedTab);

  // Attach event listeners to the tabs
  const trendingTabButton = document.getElementById("trendingTab");
  const newestTabButton = document.getElementById("newestTab");
  const topTabButton = document.getElementById("topTab");

  if (trendingTabButton) {
    trendingTabButton.addEventListener("click", () => selectTab("trending"));
  }
  if (newestTabButton) {
    newestTabButton.addEventListener("click", () => selectTab("newest"));
  }
  if (topTabButton) {
    topTabButton.addEventListener("click", () => selectTab("top"));
  }
});

// Handle form submission
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the form element
  const form = document.querySelector("form");

  // Add event listener for form submission
  form.addEventListener("submit", async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get form data
    const formData = new FormData(form);

    // Convert FormData to JSON object
    const formDataObj = Object.fromEntries(formData.entries());

    try {
      // Define the URL to submit to - replace with your actual endpoint
      const submitUrl = "https://api.example.com/submit";

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Submitting...";
      submitButton.disabled = true;

      // Send the data to the server
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObj),
      });

      // Check if the request was successful
      if (response.ok) {
        const result = await response.json();

        // Display success message
        form.innerHTML = `
            <div class="text-center p-4">
              <h3 class="text-xl font-medium text-green-700 mb-2">Success!</h3>
              <p class="text-gray-700">Thank you for your submission. We'll be in touch soon.</p>
            </div>
          `;
      } else {
        // Handle error response
        throw new Error("Server responded with an error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Display error message below the form
      const errorDiv = document.createElement("div");
      errorDiv.className = "mt-4 p-3 bg-red-100 text-red-700 rounded";
      errorDiv.textContent =
        "There was an error submitting your request. Please try again.";

      // Remove any existing error messages
      const existingError = form.querySelector(".bg-red-100");
      if (existingError) {
        existingError.remove();
      }

      form.appendChild(errorDiv);

      // Reset button state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });

  // Optional: Add form validation
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      // Simple validation - check if required fields are filled
      if (input.hasAttribute("required") && !input.value.trim()) {
        input.classList.add("border-red-500");
      } else {
        input.classList.remove("border-red-500");
      }
    });
  });
});
