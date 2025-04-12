// Handle page rendering [Wait for the DOM to be fully loaded]
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

// Handle form submission [Wait for the DOM to be fully loaded]
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;
    
    try {
      // Get the HubSpot cookie
      const getCookie = name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };

      const hsFields = Array.from(formData).map(([name, value]) => ({ name, value }));
      const hsSubmissionData = {
        fields: hsFields,
        context: {
          hutk: getCookie('hubspotutk'),
          pageUri: window.location.href,
          pageName: document.title
        },
        submittedAt: Date.now()
      };

      // Submit to HubSpot
      const portalId = 'YOUR_PORTAL_ID';
      const formGuid = 'YOUR_FORM_GUID';
      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
      const hubspotResponse = await fetch(hubspotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hsSubmissionData)
      });
      
      if (hubspotResponse.ok) {
        const result = await hubspotResponse.json();
        const existingSuccess = document.getElementById("success-message");
        if (existingSuccess) {
          existingSuccess.remove();
        }
        const successContainer = document.createElement('div');
        successContainer.id = "success-message";
        successContainer.className = "mt-4";
        const successMessage = result.inlineMessage || `
          <div class="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 class="text-xl font-medium text-green-700 mb-2">Success!</h3>
            <p class="text-gray-700">Thank you for your submission. We'll be in touch soon.</p>
          </div>
        `;
        successContainer.innerHTML = successMessage;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.parentNode.insertBefore(successContainer, submitButton.nextSibling);
        
        // Reset the form fields but keep the success message visible
        form.reset();
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // Automatically dismiss the success message after 30 seconds
        setTimeout(() => {
          successContainer.style.transition = "opacity 1s ease-out";
          successContainer.style.opacity = "0";
          
          // Remove the element after the animation completes
          setTimeout(() => {
            if (successContainer.parentNode) {
              successContainer.remove();
            }
          }, 1000);
        }, 3000);
      } else {
        console.error('HubSpot submission failed:', await hubspotResponse.json());
        throw new Error("HubSpot submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Display error message below the form
      const errorDiv = document.createElement("div");
      errorDiv.className = "mt-4 p-3 bg-red-100 text-red-700 rounded";
      errorDiv.textContent = "There was an error submitting your request. Please try again.";
      const existingError = form.querySelector(".bg-red-100");
      if (existingError) {
        existingError.remove();
      }
      
      form.appendChild(errorDiv);
      
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
  
  // Optional: Add form validation
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.hasAttribute("required") && !input.value.trim()) {
        input.classList.add("border-red-500");
      } else {
        input.classList.remove("border-red-500");
      }
    });
  });
});