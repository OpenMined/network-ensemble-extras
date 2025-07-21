document.querySelectorAll(".overview-title").forEach((title) => {
  title.addEventListener("click", function () {
    document
      .querySelectorAll(".overview-item")
      .forEach((item) => item.classList.remove("active"));
    this.parentElement.classList.add("active");
  });
});

document.querySelectorAll(".tab-header").forEach((header) => {
  header.addEventListener("click", function () {
    const tabIndex = this.dataset.tab;

    // Remove active from all headers and items
    document
      .querySelectorAll(".tab-header")
      .forEach((h) => h.classList.remove("active"));
    document
      .querySelectorAll(".option-item")
      .forEach((item) => item.classList.remove("active"));

    // Add active to clicked header and corresponding item
    this.classList.add("active");
    document.querySelectorAll(".option-item")[tabIndex].classList.add("active");
  });
});

// Federated RAG Animation Logic
function animateFederatedRAG() {
  // Helper to set opacity
  function setOpacity(id, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', value);
  }
  // Helper to animate line (grow from user to owner)
  function animateLine(id, x1, y1, x2, y2, duration = 400) {
    const line = document.getElementById(id);
    if (!line) return;
    line.setAttribute('opacity', 1);
    line.setAttribute('x2', x1);
    line.setAttribute('y2', y1);
    setTimeout(() => {
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
    }, 10);
  }
  // Reset all
  function reset() {
    setOpacity('query1', 0);
    setOpacity('query2', 0);
    setOpacity('query3', 0);
    setOpacity('query4', 0);
    setOpacity('approve1', 0);
    setOpacity('approve2', 0);
    setOpacity('approve3', 0);
    setOpacity('approve4', 0);
    setOpacity('data1', 0);
    setOpacity('data3', 0);
    setOpacity('data4', 0);
    setOpacity('agg2user', 0);
    setOpacity('response', 0);
    // Remove pulses
    document.getElementById('user').classList.remove('pulse');
    document.getElementById('aggregator').classList.remove('pulse');
  }
  reset();
  // 1. User pulses
  document.getElementById('user').classList.add('pulse');
  setTimeout(() => {
    // 2. Query lines animate to all owners
    animateLine('query1', 0, -2, -80, 8);
    animateLine('query2', 0, -2, 80, 8);
    animateLine('query3', 0, -2, -80, 43);
    animateLine('query4', 0, -2, 80, 43);
    setTimeout(() => {
      // 3. Owners approve/deny (1,3,4 approve; 2 deny)
      setOpacity('approve1', 1); // green
      setOpacity('approve2', 1); // red
      setOpacity('approve3', 1); // green
      setOpacity('approve4', 1); // green
      setTimeout(() => {
        // 4. Data chunks animate to aggregator (1,3,4)
        setOpacity('data1', 1);
        setOpacity('data3', 1);
        setOpacity('data4', 1);
        setTimeout(() => {
          // 5. Aggregator pulses
          document.getElementById('aggregator').classList.add('pulse');
          setTimeout(() => {
            // 6. Response to user
            setOpacity('agg2user', 1);
            setTimeout(() => {
              setOpacity('response', 1);
              setTimeout(() => {
                reset();
              }, 1200);
            }, 500);
          }, 600);
        }, 700);
      }, 700);
    }, 700);
  }, 700);
}

// Add pulse animation CSS
(function addPulseCSS() {
  if (document.getElementById('federated-rag-pulse-style')) return;
  const style = document.createElement('style');
  style.id = 'federated-rag-pulse-style';
  style.innerHTML = `
    .pulse circle, .pulse rect {
      animation: federated-rag-pulse 0.7s infinite alternate;
    }
    @keyframes federated-rag-pulse {
      0% { filter: drop-shadow(0 0 0px var(--primary)); }
      100% { filter: drop-shadow(0 0 8px var(--primary)); }
    }
  `;
  document.head.appendChild(style);
})();

// Model Ensembling Animation
function animateModelEnsemble() {
  function pulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('pulse');
  }
  function unpulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('pulse');
  }
  function setOpacity(id, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', value);
  }
  // Reset
  unpulse('me-model1'); unpulse('me-model2'); unpulse('me-model3');
  setOpacity('me-line1', 0.5); setOpacity('me-line2', 0.5); setOpacity('me-line3', 0.5);
  setOpacity('me-ensemble', 0.9); setOpacity('me-final', 1);
  setTimeout(() => {
    pulse('me-model1');
    setTimeout(() => {
      pulse('me-model2');
      setTimeout(() => {
        pulse('me-model3');
        setTimeout(() => {
          unpulse('me-model1'); unpulse('me-model2'); unpulse('me-model3');
          pulse('me-ensemble');
          setTimeout(() => {
            unpulse('me-ensemble');
            // Final answer highlight
            const final = document.getElementById('me-final');
            if (final) {
              final.style.transition = 'color 0.3s';
              final.style.color = 'var(--primary)';
              setTimeout(() => { final.style.color = ''; }, 800);
            }
          }, 700);
        }, 700);
      }, 700);
    }, 700);
  }, 400);
}

// Permissioned AI Animation
function animatePermissionedAI() {
  function pulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('pulse');
  }
  function unpulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('pulse');
  }
  function setOpacity(id, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', value);
  }
  // Reset
  unpulse('pai-query'); unpulse('pai-owner1'); unpulse('pai-owner2');
  setOpacity('pai-flow1', 0.8); setOpacity('pai-flow2', 0.8);
  setTimeout(() => {
    pulse('pai-query');
    setTimeout(() => {
      unpulse('pai-query');
      pulse('pai-owner1');
      setTimeout(() => {
        unpulse('pai-owner1');
        pulse('pai-owner2');
        setTimeout(() => {
          unpulse('pai-owner2');
        }, 700);
      }, 700);
    }, 700);
  }, 400);
}

// Unified Access Animation
function animateUnifiedAccess() {
  function pulseBox(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('pulse');
  }
  function unpulseBox(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('pulse');
  }
  // Reset
  unpulseBox('ua-search-box'); unpulseBox('ua-chat-box');
  setTimeout(() => {
    pulseBox('ua-search-box');
    setTimeout(() => {
      unpulseBox('ua-search-box');
      pulseBox('ua-chat-box');
      setTimeout(() => {
        unpulseBox('ua-chat-box');
      }, 700);
    }, 700);
  }, 400);
}

// Interoperable Animation
function animateInteroperable() {
  function pulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('pulse');
  }
  function unpulse(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('pulse');
  }
  // Reset
  unpulse('interop-center');
  unpulse('interop-node1'); unpulse('interop-node2'); unpulse('interop-node3'); unpulse('interop-node4');
  setTimeout(() => {
    pulse('interop-center');
    setTimeout(() => {
      pulse('interop-node1');
      setTimeout(() => {
        pulse('interop-node2');
        setTimeout(() => {
          pulse('interop-node3');
          setTimeout(() => {
            pulse('interop-node4');
            setTimeout(() => {
              unpulse('interop-center');
              unpulse('interop-node1');
              unpulse('interop-node2');
              unpulse('interop-node3');
              unpulse('interop-node4');
            }, 700);
          }, 400);
        }, 400);
      }, 400);
    }, 700);
  }, 400);
}

// Attach events
function attachStackCardAnimations() {
  const meBtn = document.getElementById('play-model-ensemble-anim');
  if (meBtn) meBtn.onclick = animateModelEnsemble;
  const paiBtn = document.getElementById('play-permissioned-ai-anim');
  if (paiBtn) paiBtn.onclick = animatePermissionedAI;
  const uaBtn = document.getElementById('play-unified-access-anim');
  if (uaBtn) uaBtn.onclick = animateUnifiedAccess;
  const ioBtn = document.getElementById('play-interoperable-anim');
  if (ioBtn) ioBtn.onclick = animateInteroperable;
}
document.addEventListener('DOMContentLoaded', attachStackCardAnimations);
