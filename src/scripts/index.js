// Performance optimizations
let ticking = false;

function updateScrollPerformance() {
  // Use requestAnimationFrame to optimize scroll performance
  if (!ticking) {
    requestAnimationFrame(() => {
      // Any scroll-based updates can go here
      ticking = false;
    });
    ticking = true;
  }
}

// Optimize scroll performance
document.addEventListener('scroll', updateScrollPerformance, { passive: true });

// Stakeholder card hover interactions
function initStakeholderInteractions() {
  // The hover effects are now handled entirely by CSS
  // This function can be used for any additional JavaScript interactions if needed
}

// Handle form submission [Wait for the DOM to be fully loaded]
document.addEventListener("DOMContentLoaded", () => {
  // Initialize stakeholder interactions
  initStakeholderInteractions();
  
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
      // Always add data_owner field
      hsFields.push({ name: 'user_type', value: 'data_owner' });
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
      const hubspotFormURL = 'https://share.hsforms.com/2pFATp7yYRy-JbdaxRh9hfA3v1pm';
      const portalId = '6487402';
      const formGuid = 'a45013a7-bc98-472f-896d-d6b1461f617c';
      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
      const hubspotResponse = await fetch(hubspotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hsSubmissionData)
      });
      
      if (hubspotResponse.ok) {
        const result = await hubspotResponse.json();
        console.log(result)
        const existingSuccess = document.getElementById("success-message");
        if (existingSuccess) {
          existingSuccess.remove();
        }
        const successContainer = document.createElement('div');
        successContainer.id = "success-message";
        successContainer.className = "mt-3";
        const successMessage = result.inlineMessage || `<div class="alert alert-success text-center"> 
          <h3 class="fw-medium text-success mb-2">Success!</h3> 
          <p class="text-muted">We will reach out to you shortly.</p> 
        </div>`;
        successContainer.innerHTML = successMessage;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.parentNode.insertBefore(successContainer, submitButton.nextSibling);
        
        // Reset the form fields but keep the success message visible
        form.reset();
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        setTimeout(() => {
          successContainer.style.transition = "opacity 0.3s ease-out";
          successContainer.style.opacity = "0";
          
          // Remove the element after the animation completes
          setTimeout(() => {

            // const redirectUrl = 'https://form.asana.com/?k=oqCO1GBqyQ2bUi4pZ7xP_g&d=1185126988600652';

            if (successContainer.parentNode) {
              successContainer.remove();
            }
            
            // window.open(redirectUrl, "_blank", "noopener,noreferrer");
          }, 300);
        }, 3000);
      } else {
        console.error('HubSpot submission failed:', await hubspotResponse.json());
        throw new Error("HubSpot submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Display error message below the form
      const errorDiv = document.createElement("div");
      errorDiv.className = "alert alert-danger";
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
        input.classList.add("is-invalid");
      } else {
        input.classList.remove("is-invalid");
      }
    });
  });
});