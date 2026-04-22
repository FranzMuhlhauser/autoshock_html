/* =====================================================
   AUTO SHOCK – main.js
   Shared JavaScript for all pages
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // === Funciones CRÍTICAS (above the fold, interactividad inmediata) ===
  initMobileMenu();
  initScrollReveal();
  highlightActiveNav();
  initScrollToTop();

  // === Funciones NO-CRÍTICAS (diferidas para reducir TBT) ===
  const deferInit = typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (cb) => setTimeout(cb, 150);

  deferInit(() => {
    initProductTabs();
    initAccordion();
    initWhatsAppChatbot();
    initContactForm();
    initEmailObfuscation();
    initYouTubeFacades();
  });

  // Register Service Worker for offline PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
});

/* ------------------------------------------------
   7. WhatsApp Chatbot (Webnetico Style - MultiStep)
   ------------------------------------------------ */
function initWhatsAppChatbot() {
  const container = document.querySelector(".wa-chat-container");
  if (!container) return;

  const floatBtn = document.getElementById("wa-float-btn");
  const drawer = document.getElementById("wa-drawer");

  // Steps
  const steps = {
    1: document.getElementById("wa-step-1"),
    2: document.getElementById("wa-step-2"),
    tren: document.getElementById("wa-step-tren"),
    marca: document.getElementById("wa-step-marca"),
    modelo: document.getElementById("wa-step-modelo"),
    ano: document.getElementById("wa-step-ano")
  };

  // Inputs & Buttons
  const userNameInput = document.getElementById("wa-user-name");
  const marcaInput = document.getElementById("wa-user-marca");
  const modeloInput = document.getElementById("wa-user-modelo");
  const anoInput = document.getElementById("wa-user-ano");

  const btnStep2 = document.getElementById("wa-to-step-2");
  const btnStepModelo = document.getElementById("wa-to-step-modelo");
  const btnStepAno = document.getElementById("wa-to-step-ano");
  const btnSendFinal = document.getElementById("wa-send-final");

  const displayName = document.getElementById("wa-display-name");

  let chatData = {
    name: "",
    product: "",
    marca: "",
    modelo: "",
    ano: ""
  };

  let stepHistory = [];

  // Typing indicator element
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "wa-typing wa-hidden";
  typingIndicator.innerHTML = "<span></span><span></span><span></span>";
  const drawerBody = document.querySelector(".wa-drawer-body");
  if (drawerBody) drawerBody.prepend(typingIndicator);

  function showStep(stepKey, pushToHistory = true) {
    const currentActive = Object.keys(steps).find(k => steps[k] && !steps[k].classList.contains("wa-hidden"));
    if (pushToHistory && currentActive) {
      stepHistory.push(currentActive);
    }

    // Hide all steps
    Object.values(steps).forEach(s => s && s.classList.add("wa-hidden"));

    // Show typing effect if it's not the first step
    if (stepKey !== 1 && typingIndicator) {
      typingIndicator.classList.remove("wa-hidden");
      setTimeout(() => {
        typingIndicator.classList.add("wa-hidden");
        if (steps[stepKey]) {
          steps[stepKey].classList.remove("wa-hidden");
          // Focus input if available
          const firstInput = steps[stepKey].querySelector("input");
          if (firstInput) firstInput.focus();
        }
      }, 800);
    } else {
      if (steps[stepKey]) steps[stepKey].classList.remove("wa-hidden");
    }
  }

  function goBack() {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory.pop();
      showStep(prevStep, false);
    }
  }

  function resetChat() {
    chatData = { name: "", product: "", marca: "", modelo: "", ano: "" };
    stepHistory = [];
    if (userNameInput) userNameInput.value = "";
    if (marcaInput) marcaInput.value = "";
    if (modeloInput) modeloInput.value = "";
    if (anoInput) anoInput.value = "";
    showStep(1, false);
  }

  // Toggle Drawer
  if (floatBtn) {
    // Accessibility: Set initial state
    floatBtn.setAttribute("aria-expanded", "false");

    floatBtn.addEventListener("click", () => {
      const isActive = drawer.classList.toggle("active");
      floatBtn.setAttribute("aria-expanded", isActive ? "true" : "false");

      if (!isActive) {
        setTimeout(resetChat, 300); // Reset after close animation
      } else {
        // Focus first element if opened
        setTimeout(() => {
          if (!steps[1].classList.contains("wa-hidden")) userNameInput.focus();
        }, 100);
      }
    });
  }

  // Global back button listener
  container.addEventListener("click", (e) => {
    if (e.target.closest(".wa-back-btn")) {
      goBack();
    }
  });

  // Step 1 -> Step 2
  if (btnStep2) {
    btnStep2.addEventListener("click", () => {
      const val = userNameInput.value.trim();
      if (!val) { userNameInput.style.borderColor = "#ff4d4d"; return; }
      chatData.name = val;
      if (displayName) displayName.textContent = val;
      showStep(2);
    });
    userNameInput.addEventListener("keypress", (e) => { if (e.key === "Enter") btnStep2.click(); });
  }

  // Step 2 & Tren Options
  container.addEventListener("click", (e) => {
    const optBtn = e.target.closest(".wa-opt-btn");
    if (!optBtn) return;

    chatData.product = optBtn.dataset.product;
    const next = optBtn.dataset.next;

    if (next === "step-tren") {
      showStep("tren");
    } else {
      showStep("marca");
    }
  });

  // Marca -> Modelo
  if (btnStepModelo) {
    btnStepModelo.addEventListener("click", () => {
      const val = marcaInput.value.trim();
      if (!val) { marcaInput.style.borderColor = "#ff4d4d"; return; }
      chatData.marca = val;
      showStep("modelo");
    });
    marcaInput.addEventListener("keypress", (e) => { if (e.key === "Enter") btnStepModelo.click(); });
  }

  // Modelo -> Año
  if (btnStepAno) {
    btnStepAno.addEventListener("click", () => {
      const val = modeloInput.value.trim();
      if (!val) { modeloInput.style.borderColor = "#ff4d4d"; return; }
      chatData.modelo = val;
      showStep("ano");
    });
    modeloInput.addEventListener("keypress", (e) => { if (e.key === "Enter") btnStepAno.click(); });
  }

  // Final Action
  if (btnSendFinal) {
    btnSendFinal.addEventListener("click", () => {
      const val = anoInput.value.trim();
      if (!val) { anoInput.style.borderColor = "#ff4d4d"; return; }
      chatData.ano = val;

      const message = `Hola Auto Shock! Mi nombre es ${chatData.name}.\n` +
        `Solicito información técnica para:\n` +
        `• Producto: ${chatData.product}\n` +
        `• Marca: ${chatData.marca}\n` +
        `• Modelo: ${chatData.modelo}\n` +
        `• Año: ${chatData.ano}`;

      const url = `https://wa.me/56986908605?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      drawer.classList.remove("active");
      setTimeout(resetChat, 500);
    });
    anoInput.addEventListener("keypress", (e) => { if (e.key === "Enter") btnSendFinal.click(); });
  }

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".wa-chat-container")) {
      drawer.classList.remove("active");
    }
  });
}

/* ------------------------------------------------
   1. Mobile Menu
   ------------------------------------------------ */
function initMobileMenu() {
  const toggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!toggle || !mobileMenu) return;

  // Accessibility Defaults
  toggle.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");

  // Store the element that opened the menu for focus restoration
  let previouslyFocused = null;

  // Focusable elements inside the menu
  const getFocusableElements = () => {
    const focusable = mobileMenu.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.from(focusable);
  };

  // Focus trap: cycle focus within menu when Tab is pressed
  mobileMenu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !mobileMenu.classList.contains("open")) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  toggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";

    // Update ARIA
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", !isOpen ? "true" : "false");

    if (isOpen) {
      // Store what was focused before opening
      previouslyFocused = document.activeElement;
      // Focus first link in menu
      const firstLink = mobileMenu.querySelector("a[href]");
      if (firstLink) setTimeout(() => firstLink.focus(), 50);
    } else {
      // Restore focus to what opened the menu
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    }
  });

  // Close on link click
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      toggle.classList.remove("open");
      document.body.style.overflow = "";
      // Restore focus
      toggle.focus();
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      toggle.classList.remove("open");
      document.body.style.overflow = "";
      toggle.focus();
    }
  });

  // Close when clicking outside
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) {
      mobileMenu.classList.remove("open");
      toggle.classList.remove("open");
      document.body.style.overflow = "";
      toggle.focus();
    }
  });
}

/* ------------------------------------------------
   2. Scroll Reveal (IntersectionObserver)
   ------------------------------------------------ */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  // prefers-reduced-motion: muestra todo sin animación
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0, 10);
          // Usar rAF para Timing preciso y sin janks
          setTimeout(() => {
            requestAnimationFrame(() => {
              entry.target.classList.add("visible");
            });
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  elements.forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = (i % 4) * 80;
    observer.observe(el);
  });
}

/* ------------------------------------------------
   3. Highlight active nav link
   ------------------------------------------------ */
function highlightActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

/* ------------------------------------------------
   4. Contact Form Validation
   ------------------------------------------------ */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    // Clear previous errors
    form
      .querySelectorAll(".form-error")
      .forEach((el) => el.classList.remove("visible"));

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    if (!name.value.trim() || name.value.trim().length < 2) {
      showError("name-error", "El nombre debe tener al menos 2 caracteres.");
      valid = false;
    }
    if (!isValidEmail(email.value.trim())) {
      showError(
        "email-error",
        "Por favor introduce un correo electrónico válido.",
      );
      valid = false;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(
        "message-error",
        "El mensaje debe tener al menos 10 caracteres.",
      );
      valid = false;
    }

    if (valid) handleFormSubmit(form);
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add("visible");
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleFormSubmit(form) {
  const btn = form.querySelector('button[type="submit"]');
  const successEl = document.getElementById("form-success");
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = "Enviando...";

  const formData = new FormData(form);

  const emailParts = ['auto_shock', 'hotmail', 'com'];
  const email = `${emailParts[0]}@${emailParts[1]}.${emailParts[2]}`;
  fetch(`https://formsubmit.co/ajax/${email}`, {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      btn.disabled = false;
      btn.textContent = originalText;
      form.reset();

      if (successEl) {
        successEl.textContent = "✅ ¡Mensaje enviado con éxito! Te contactaremos a la brevedad.";
        successEl.classList.add("visible");
      }
    })
    .catch(error => {
      btn.disabled = false;
      btn.textContent = originalText;
      alert("Hubo un error al enviar el mensaje. Por favor intenta nuevamente.");
      console.error("Error:", error);
    });
}

/* ------------------------------------------------
   5. Scroll to Top
   ------------------------------------------------ */
function initScrollToTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  // Usando passive:true para no bloquear el scroll del browser
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const show = window.scrollY > 400;
        btn.style.opacity = show ? "1" : "0";
        btn.style.pointerEvents = show ? "auto" : "none";
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ------------------------------------------------
   6. Product Tabs (Showcase) + Hash Deep Linking
   ------------------------------------------------ */
function initProductTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".showcase-content");

  if (!tabs.length || !contents.length) return;

  // Activate a specific tab by its ID
  function activateTab(targetId) {
    // Find and activate the matching tab button
    tabs.forEach((t) => t.classList.remove("active"));
    const matchingTab = Array.from(tabs).find(t => t.dataset.tab === targetId);
    if (matchingTab) matchingTab.classList.add("active");

    // Show the matching content
    contents.forEach((c) => {
      c.classList.remove("active");
      if (c.id === targetId) {
        c.classList.add("active");
      }
    });
  }

  // Handle mobile deep linking for hash navigation
  function activateMobileForHash(targetId) {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // Map product IDs to their mobile group wrappers
    const groupMap = {
      'livianos': 'mg-amortiguadores',
      'portalon': 'mg-amortiguadores',
      'camiones': 'mg-amortiguadores',
      'cataliticos': 'mg-cataliticos',
      'tren-delantero': 'mg-tren-delantero'
    };

    const groupId = groupMap[targetId];
    if (!groupId) return;

    const mobileGroups = document.querySelectorAll('.mobile-group-wrapper');
    const mobileBtns = document.querySelectorAll('.mobile-category-btn');
    const subCatBtns = document.querySelectorAll('.sub-cat-btn');
    const amSubmenu = document.getElementById('amortiguadores-submenu');
    const backBtn = document.getElementById('back-to-categories');

    // Activate the correct mobile group
    mobileGroups.forEach(g => g.classList.remove('active-group'));
    const targetGroup = document.getElementById(groupId);
    if (targetGroup) targetGroup.classList.add('active-group');

    // Highlight the correct category button
    mobileBtns.forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-outline');
      if (b.getAttribute('data-target') === groupId) {
        b.classList.remove('btn-outline');
        b.classList.add('btn-primary');
      }
    });

    // For amortiguadores sub-categories, activate the specific sub-cat
    if (groupId === 'mg-amortiguadores') {
      // Hide the sub-menu, show the content directly
      if (amSubmenu) amSubmenu.classList.add('hide');
      if (backBtn) backBtn.classList.remove('hide');

      // Reset all sub-cat content
      const amGroup = document.getElementById('mg-amortiguadores');
      if (amGroup) {
        amGroup.querySelectorAll('.showcase-content').forEach(c => {
          c.classList.remove('active-mobile-show');
        });
      }

      // Show the target content
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active-mobile-show');

      // Highlight the matching sub-cat button
      subCatBtns.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
        if (b.getAttribute('data-sub') === targetId) {
          b.classList.remove('btn-outline');
          b.classList.add('btn-primary');
        }
      });
    }
  }

  // Tab click handlers
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
    });
  });

  // On page load: check URL hash and activate the correct tab + scroll
  const hash = window.location.hash.substring(1); // Remove '#'
  if (hash) {
    const validTabs = ['livianos', 'portalon', 'camiones', 'cataliticos', 'tren-delantero'];
    if (validTabs.includes(hash)) {
      // Activate the tab (desktop)
      activateTab(hash);

      // Activate mobile navigation
      activateMobileForHash(hash);

      // Scroll to the product section after a brief delay (allows layout to settle)
      setTimeout(() => {
        const targetEl = document.getElementById(hash);
        if (targetEl) {
          const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 70;
          const offset = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 300);
    }
  }
}

/* ------------------------------------------------
   8. FAQ Accordion
   ------------------------------------------------ */
function initAccordion() {
  const accordionItems = document.querySelectorAll(".faq-item");
  if (!accordionItems.length) return;

  accordionItems.forEach((item, index) => {
    const header = item.querySelector(".faq-header");
    const content = item.querySelector(".faq-content");

    // Accessibility: set IDs and ARIA attributes
    const contentId = `faq-content-${index}`;
    if (content) content.id = contentId;
    header.setAttribute("aria-expanded", "false");
    header.setAttribute("aria-controls", contentId);
    if (content) content.setAttribute("role", "region");

    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      accordionItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        const otherHeader = otherItem.querySelector(".faq-header");
        const otherContent = otherItem.querySelector(".faq-content");
        if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
        if (otherContent) otherContent.style.maxHeight = null;
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        if (content) {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    });
  });
}

/* ------------------------------------------------
   9. Email Obfuscation (Anti-Spam)
   ------------------------------------------------ */
function initEmailObfuscation() {
  // Obfuscated email parts (split to avoid harvesting)
  const emailParts = {
    user: ['auto_shock', 'hotmail', 'com'],
    separator: { at: '@', dot: '.' }
  };

  // Reconstruct email
  const email = emailParts.user[0] + emailParts.separator.at + emailParts.user[1] + emailParts.separator.dot + emailParts.user[2];

  // Update all email links
  const emailLinks = document.querySelectorAll('.email-link, a[href^="mailto:"]');
  emailLinks.forEach(link => {
    if (link.href.startsWith('mailto:')) {
      link.href = 'mailto:' + email;
    }
    if (link.textContent.includes('@') || link.classList.contains('email-link')) {
      link.textContent = email;
    }
  });

  // Update email text spans
  const emailSpans = document.querySelectorAll('.email-text');
  emailSpans.forEach(span => {
    span.textContent = email;
  });
}

/* ------------------------------------------------
   10. YouTube Facade (Performance Optimization)
   ------------------------------------------------ */
function initYouTubeFacades() {
  const facades = document.querySelectorAll(".yt-facade");
  if (!facades.length) return;

  facades.forEach(facade => {
    const videoId = facade.dataset.ytId;
    if (!videoId) return;

    // Set background thumbnail
    facade.style.backgroundImage = `url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg')`;

    // Add play button if not already there
    if (!facade.querySelector(".play-btn")) {
      const playBtn = document.createElement("div");
      playBtn.className = "play-btn";
      playBtn.setAttribute("role", "button");
      playBtn.setAttribute("aria-label", "Reproducir video");
      facade.appendChild(playBtn);
    }

    // On click: replace with iframe
    facade.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}?autoplay=1`);
      iframe.setAttribute("title", facade.dataset.ytTitle || "Video de YouTube");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "true");
      
      // Clear facade and append iframe
      facade.innerHTML = "";
      facade.appendChild(iframe);
      
      // Optional: adjust height if needed
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      facade.style.cursor = "default";
    }, { once: true });
  });
}
