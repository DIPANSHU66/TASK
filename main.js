/* ==========================================
   STATE & DATA LOGIC: PRICING MATRIX
   ========================================== */
const pricingMatrix = {
  currencies: {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    INR: { symbol: '₹', rate: 80.0 }
  },
  billing: {
    monthly: { discount: 1.0 },
    annual: { discount: 0.8 } // flat 20% annual discount
  },
  tiers: {
    developer: { baseRate: 29 },
    scale: { baseRate: 79 },
    enterprise: { baseRate: 149 }
  }
};

let currentCurrency = 'USD';
let currentBilling = 'monthly';

/**
 * Updates pricing display with strict state isolation.
 * Modifies ONLY the specific leaf text nodes containing the price & currency
 * to prevent global component re-renders or layout thrashing.
 */
function updatePrices() {
  const currencyObj = pricingMatrix.currencies[currentCurrency];
  const billingObj = pricingMatrix.billing[currentBilling];

  for (const tierId in pricingMatrix.tiers) {
    const tier = pricingMatrix.tiers[tierId];
    const priceValEl = document.getElementById(`price-val-${tierId}`);
    const priceSymbolEl = document.getElementById(`price-symbol-${tierId}`);

    if (priceValEl && priceSymbolEl) {
      const finalPrice = Math.round(tier.baseRate * currencyObj.rate * billingObj.discount);

      // Perform strict text node update
      if (priceValEl.firstChild) {
        priceValEl.firstChild.nodeValue = finalPrice;
      } else {
        priceValEl.textContent = finalPrice;
      }

      if (priceSymbolEl.firstChild) {
        priceSymbolEl.firstChild.nodeValue = currencyObj.symbol;
      } else {
        priceSymbolEl.textContent = currencyObj.symbol;
      }
    }
  }
}

/* ==========================================
   FEATURE 2: BENTO-TO-ACCORDION CONTEXT LOCK
   ========================================== */
let activeIndex = 0; // shared index across layouts
let isMobileView = window.innerWidth < 768;

/**
 * Synchronizes layout states between Bento and Accordion modes.
 * Measure scrollHeight dynamically for smooth transition on mobile.
 */
function updateFeatureLayout() {
  const isMobile = window.innerWidth < 768;
  const cards = document.querySelectorAll('.feature-card');

  cards.forEach((card) => {
    const index = parseInt(card.dataset.index, 10);
    const body = card.querySelector('.feature-body');

    if (isMobile) {
      if (index === activeIndex) {
        card.classList.add('is-active');
        card.setAttribute('aria-expanded', 'true');
        body.style.height = `${body.scrollHeight}px`;
        body.style.opacity = '1';
      } else {
        card.classList.remove('is-active');
        card.setAttribute('aria-expanded', 'false');
        body.style.height = '0';
        body.style.opacity = '0';
      }
    } else {
      // Desktop: Clear mobile heights to let CSS Bento Grid manage structure
      body.style.height = '';
      body.style.opacity = '';
      card.removeAttribute('aria-expanded');

      if (index === activeIndex) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    }
  });
}

// Attach listeners to Feature Bento/Accordion nodes
function initFeatureListeners() {
  const cards = document.querySelectorAll('.feature-card');

  cards.forEach((card) => {
    const index = parseInt(card.dataset.index, 10);
    const header = card.querySelector('.feature-header');

    // Desktop hover tracking
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 768) {
        activeIndex = index;
        updateFeatureLayout();
      }
    });

    // Mobile click/touch toggle tracking
    header.addEventListener('click', (e) => {
      if (window.innerWidth < 768) {
        activeIndex = index;
        updateFeatureLayout();
      }
    });

    // Accessibility support (Keyboard space/enter activation)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activeIndex = index;
        updateFeatureLayout();
      }
    });
  });
}

// Window resize listener with cross-breakpoint context transfer lock
window.addEventListener('resize', () => {
  const currentIsMobile = window.innerWidth < 768;
  if (currentIsMobile !== isMobileView) {
    isMobileView = currentIsMobile;
    updateFeatureLayout();
  } else if (isMobileView) {
    // If resizing within mobile, adjust active accordion height dynamically
    const activeCard = document.querySelector(`.feature-card[data-index="${activeIndex}"]`);
    if (activeCard) {
      const body = activeCard.querySelector('.feature-body');
      body.style.height = `${body.scrollHeight}px`;
    }
  }
});


/* ==========================================
   INITIALIZATION & EVENT BINDINGS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize features and pricing values
  initFeatureListeners();
  updateFeatureLayout();
  updatePrices();

  // 2. Billing Toggle UI Controls
  const billingMonthly = document.getElementById('billing-monthly');
  const billingAnnual = document.getElementById('billing-annual');
  const billingSlider = document.getElementById('billing-slider');

  function selectBilling(cycle) {
    currentBilling = cycle;
    if (cycle === 'monthly') {
      billingMonthly.classList.add('active');
      billingMonthly.setAttribute('aria-checked', 'true');
      billingAnnual.classList.remove('active');
      billingAnnual.setAttribute('aria-checked', 'false');
      billingSlider.style.transform = 'translateX(0)';
    } else {
      billingAnnual.classList.add('active');
      billingAnnual.setAttribute('aria-checked', 'true');
      billingMonthly.classList.remove('active');
      billingMonthly.setAttribute('aria-checked', 'false');
      // Slide over by width of the switcher
      billingSlider.style.transform = 'translateX(88px)';
    }
    updatePrices();
  }

  if (billingMonthly && billingAnnual) {
    billingMonthly.addEventListener('click', () => selectBilling('monthly'));
    billingAnnual.addEventListener('click', () => selectBilling('annual'));

    billingMonthly.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectBilling('monthly'); }
    });
    billingAnnual.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectBilling('annual'); }
    });
  }

  // 3. Currency Selector Dropdown Controls
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updatePrices();
    });
  }

  // 4. CTA and Button animations/handlers
  const actions = ['nav-cta-btn', 'hero-primary-cta', 'hero-secondary-cta'];
  actions.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        alert(`${el.textContent.trim()} action initialized. Connection secure.`);
      });
    }
  });
});

// 5. LOADER SEQUENCE AND ENTRANCE ORCHESTRATION (<500ms Cap)
window.addEventListener('load', () => {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    // Fade out the loader overlay (duration 300ms)
    setTimeout(() => {
      loader.classList.add('fade-out');
      // Staggered layout element entries begin
      document.body.classList.add('stagger-ready');
    }, 150); // Small initial hold for loading sequence polish
  }
});
