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
   INTERACTIVE BENTO CARD MODULES
   ========================================== */

/* 1. Workflow Engine Simulator (Card 0) */
let currentCycleValue = 1482;
function initWorkflowEngineSimulator() {
  const nodes = [
    document.getElementById('node-0'),
    document.getElementById('node-1'),
    document.getElementById('node-2')
  ];
  const paths = [
    document.getElementById('flow-path-1'),
    document.getElementById('flow-path-2')
  ];
  const metric = document.getElementById('workflow-metric-val');

  let activeStep = 0;
  setInterval(() => {
    // Reset all
    nodes.forEach(n => { if (n) n.classList.remove('active'); });
    paths.forEach(p => { if (p) p.classList.remove('active'); });

    // Step sequence
    activeStep = (activeStep + 1) % 4;

    if (activeStep < 3) {
      if (nodes[activeStep]) nodes[activeStep].classList.add('active');
    }
    if (activeStep === 1 && paths[0]) {
      paths[0].classList.add('active');
    }
    if (activeStep === 2 && paths[1]) {
      paths[1].classList.add('active');
    }

    if (activeStep === 3) {
      currentCycleValue += 1;
      if (metric) {
        metric.textContent = `EXEC_CYCLES: ${currentCycleValue.toLocaleString()}`;
      }
    }
  }, 1200);

  // Manual Node Click
  nodes.forEach((node, idx) => {
    if (node) {
      node.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        currentCycleValue += 10;
        if (metric) metric.textContent = `EXEC_CYCLES: ${currentCycleValue.toLocaleString()}`;
      });
    }
  });
}

/* 2. Console Box Log Simulator (Card 1) */
function initConsoleLogSimulator() {
  const box = document.getElementById('console-box');
  if (!box) return;

  const mockLogs = [
    { type: 'ok', msg: 'Syncing local node checkpoints...' },
    { type: 'ok', msg: 'Aethera edge connection stable on wss://aethera.net' },
    { type: 'sync', msg: 'Sync completed: database checkpoint mapped (1.4ms)' },
    { type: 'info', msg: 'Routing data packet 0x98A2 to US-East-1' },
    { type: 'sync', msg: 'Distributed stack synchronization verified' },
    { type: 'info', msg: 'Core CPU load check: 12% utilization active' },
    { type: 'ok', msg: 'Failover checks verified: no disruptions reported' }
  ];

  let logIndex = 0;
  // Initial lines
  for (let i = 0; i < 4; i++) {
    appendConsoleLine(mockLogs[i].type, mockLogs[i].msg);
    logIndex++;
  }

  setInterval(() => {
    const log = mockLogs[logIndex % mockLogs.length];
    appendConsoleLine(log.type, log.msg);
    logIndex++;

    // Prune old logs to keep terminal height bounded
    if (box.children.length > 8) {
      box.removeChild(box.firstChild);
    }
  }, 2200);

  function appendConsoleLine(type, text) {
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = `<span class="console-tag ${type}">[${type.toUpperCase()}]</span> <span>${text}</span>`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }
}

/* 3. 3D Memory Vector Canvas Simulator (Card 2) */
function initMemoryCanvasSimulator() {
  const canvas = document.getElementById('memory-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  const particleCount = 45;
  let speedMultiplier = 1;
  let isHovered = false;
  let canvasStatVal = 81402;

  // Resize handler for canvas
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Define memory nodes
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = (Math.random() - 0.5) * 160;
      this.y = (Math.random() - 0.5) * 160;
      this.z = Math.random() * 160;
      this.radius = Math.random() * 1.5 + 1;
    }
    update(speed) {
      // Orbit around Y axis
      const angle = 0.015 * speed;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const x1 = this.x * cos - this.z * sin;
      const z1 = this.z * cos + this.x * sin;
      
      this.x = x1;
      this.z = z1;
    }
    draw(width, height) {
      // Perspective projection
      const focalLength = 120;
      const scale = focalLength / (focalLength + this.z);
      const projX = this.x * scale + width / 2;
      const projY = this.y * scale + height / 2;

      if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
        ctx.beginPath();
        ctx.arc(projX, projY, this.radius * scale, 0, Math.PI * 2);
        
        // Color shifts depending on hover
        const alpha = Math.max(0.1, 1 - this.z / 160);
        if (isHovered) {
          ctx.fillStyle = `rgba(255, 200, 1, ${alpha * 0.95})`; // Forsythia gold
        } else {
          ctx.fillStyle = `rgba(217, 232, 226, ${alpha * 0.7})`; // Mystic Mint
        }
        ctx.fill();
      }
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lines between nearby particles
    ctx.strokeStyle = isHovered ? 'rgba(255, 200, 1, 0.05)' : 'rgba(217, 232, 226, 0.03)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < 40) {
          const focalLength = 120;
          const scaleI = focalLength / (focalLength + particles[i].z);
          const scaleJ = focalLength / (focalLength + particles[j].z);
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x * scaleI + canvas.width/2, particles[i].y * scaleI + canvas.height/2);
          ctx.lineTo(particles[j].x * scaleJ + canvas.width/2, particles[j].y * scaleJ + canvas.height/2);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update(speedMultiplier);
      p.draw(canvas.width, canvas.height);
    });

    animationId = requestAnimationFrame(animate);
  }
  animate();

  // Speed up rotation on hover
  const card = canvas.closest('.feature-card');
  if (card) {
    card.addEventListener('mouseenter', () => {
      isHovered = true;
      speedMultiplier = 2.5;
      canvasStatVal += 12;
      const statBox = document.getElementById('canvas-stat-val');
      if (statBox) statBox.textContent = `VECTORS: ${canvasStatVal.toLocaleString()}`;
    });
    card.addEventListener('mouseleave', () => {
      isHovered = false;
      speedMultiplier = 1.0;
    });
  }
}

/* 4. Neural DAG Compiler Parser Simulator (Card 3) */
function initNeuralParserSimulator() {
  const buttons = document.querySelectorAll('.parser-btn');
  const inputLine = document.getElementById('parser-input-line');
  const outputLine = document.getElementById('parser-output-line');
  const loader = document.getElementById('parser-path-loader');

  const parserData = {
    'parse-sync': {
      input: '> Sync database every midnight',
      nodes: ['DB_CONNECT', 'SYNC_JOBS', 'CACHE_WRITE']
    },
    'parse-alert': {
      input: '> Alert operations channel on warning logs',
      nodes: ['LOGS_WARN', 'EMAIL_ALERT', 'SLACK_DISPATCH']
    },
    'parse-clean': {
      input: '> Prune logs exceeding 100MB capacity',
      nodes: ['SIZE_CHECK', 'DELETE_OLD', 'COMPACT_DB']
    }
  };

  function runParseAnimation(type) {
    const data = parserData[type];
    if (!data) return;

    // Set active button
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.parser-btn[data-prompt="${type}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Run inputs
    inputLine.textContent = data.input;
    outputLine.innerHTML = '';
    loader.style.width = '0%';

    // Trigger compilations loading bar
    setTimeout(() => {
      loader.style.width = '100%';
    }, 50);

    // Display compilation outputs
    setTimeout(() => {
      outputLine.innerHTML = data.nodes.map(n => `<span class="parser-output-node">${n}</span>`).join('<span style="color:rgba(217, 232, 226, 0.2)">➔</span>');
    }, 850);
  }

  // Bind clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const promptType = btn.dataset.prompt;
      runParseAnimation(promptType);
    });
  });

  // Initial runs
  runParseAnimation('parse-sync');
}

// Spotlight Mouse Coordinates Tracking
function initSpotlightTracking() {
  const cards = document.querySelectorAll('.feature-card, .pricing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================
   INITIALIZATION & EVENT BINDINGS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize features and pricing values
  initFeatureListeners();
  updateFeatureLayout();
  updatePrices();

  // 2. Initialize interactive dashboard visuals
  initWorkflowEngineSimulator();
  initConsoleLogSimulator();
  initMemoryCanvasSimulator();
  initNeuralParserSimulator();
  initSpotlightTracking();

  // 3. Billing Toggle UI Controls
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
      billingSlider.style.transform = 'translateX(90px)';
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

  // 4. Custom Currency Selector Dropdown Controls
  const dropdownWrapper = document.getElementById('currency-dropdown');
  const dropdownBtn = document.getElementById('currency-select-btn');
  const selectedLabel = document.getElementById('selected-currency');
  const options = document.querySelectorAll('.custom-option');

  if (dropdownBtn && dropdownWrapper) {
    // Open/Close dropdown
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownWrapper.classList.contains('open');
      if (isOpen) {
        dropdownWrapper.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      } else {
        dropdownWrapper.classList.add('open');
        dropdownBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Option clicks
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove select states
        options.forEach(opt => {
          opt.classList.remove('selected');
          opt.setAttribute('aria-selected', 'false');
        });

        // Set select state
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');
        
        currentCurrency = option.dataset.value;
        selectedLabel.textContent = option.textContent.trim();
        
        // Close dropdown
        dropdownWrapper.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');

        // Trigger updates
        updatePrices();
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      dropdownWrapper.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // 5. CTA and Button animations/handlers
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

// 6. LOADER SEQUENCE AND ENTRANCE ORCHESTRATION (<500ms Cap)
window.addEventListener('load', () => {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    // Fade out the loader overlay (duration 300ms)
    setTimeout(() => {
      loader.classList.add('fade-out');
      // Staggered layout element entries begin
      document.body.classList.add('stagger-ready');
    }, 250); // Small initial hold for boot text visibility polish
  }
});
