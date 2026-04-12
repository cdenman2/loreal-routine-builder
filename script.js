const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const productGrid = document.getElementById("product-grid");
const productStatus = document.getElementById("product-status");
const loadProductsBtn = document.getElementById("load-products-btn");
const showMoreBtn = document.getElementById("show-more-btn");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

const selectedProductsEmpty = document.getElementById("selected-products-empty");
const selectedProductsList = document.getElementById("selected-products-list");
const generateRoutineBtn = document.getElementById("generate-routine-btn");
const clearProductsBtn = document.getElementById("clear-products-btn");

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const factText = document.getElementById("fact-text");

const STORAGE_KEYS = {
  selectedIds: "loreal_selected_ids",
  chatHistory: "loreal_chat_history",
  productCache: "loreal_product_cache"
};

let allProducts = [];
let visibleCount = 4;
let selectedProductIds = [];
let history = [];

const lorealFacts = [
  "Healthy skincare routines usually follow this order: cleanser, treatment serum, moisturizer, and sunscreen during the day.",
  "Skincare products help support cleansing, hydration, brightness, and protection.",
  "Haircare routines often work best with a shampoo first, then conditioner, followed by leave-in treatments if needed.",
  "Makeup usually applies more smoothly when skin is hydrated and prepped first.",
  "Conditioner helps smooth the hair cuticle and improve softness after shampooing.",
  "Serums are lightweight formulas designed to target specific concerns such as dullness, dryness, or uneven-looking skin.",
  "Sunscreen helps protect skin from UV damage and is an important daytime step.",
  "Mascara is usually one of the last steps in a basic makeup routine.",
  "Self-tanning products are usually applied to clean, dry skin for more even-looking color.",
  "Micellar water is often used as a quick cleansing step before a full face wash."
];

let factIndex = 0;
let factIntervalId = null;

function saveSelectedProducts() {
  localStorage.setItem(STORAGE_KEYS.selectedIds, JSON.stringify(selectedProductIds));
}

function loadSelectedProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.selectedIds) || "[]");
    if (Array.isArray(saved)) {
      selectedProductIds = saved;
    }
  } catch {
    selectedProductIds = [];
  }
}

function saveChatHistory() {
  localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
}

function loadChatHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.chatHistory) || "[]");
    if (Array.isArray(saved)) {
      history = saved;
    }
  } catch {
    history = [];
  }
}

function saveProductCache() {
  localStorage.setItem(STORAGE_KEYS.productCache, JSON.stringify(allProducts));
}

function loadProductCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.productCache) || "[]");
    if (Array.isArray(saved)) {
      allProducts = saved;
    }
  } catch {
    allProducts = [];
  }
}

function getSelectedProductNames() {
  return allProducts
    .filter((product) => selectedProductIds.includes(product.id))
    .map((product) => product.name);
}

function rotateFacts() {
  if (!factText) return;
  factText.textContent = lorealFacts[factIndex];
  factIndex = (factIndex + 1) % lorealFacts.length;
}

function startFactRotation() {
  rotateFacts();
  if (factIntervalId) clearInterval(factIntervalId);
  factIntervalId = setInterval(rotateFacts, 4000);
}

function filterProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  return allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

function updateShowMoreVisibility(totalFiltered) {
  showMoreBtn.style.display = visibleCount < totalFiltered ? "inline-block" : "none";
}

function updateSelectedProductsUI() {
  selectedProductsList.innerHTML = "";
  const selectedNames = getSelectedProductNames();

  if (selectedNames.length === 0) {
    selectedProductsEmpty.style.display = "block";
    return;
  }

  selectedProductsEmpty.style.display = "none";

  selectedNames.forEach((name) => {
    const item = document.createElement("div");
    item.className = "selected-item";
    item.textContent = name;
    selectedProductsList.appendChild(item);
  });
}

function toggleDescription(card) {
  card.classList.toggle("show-description");
}

function createProductCard(product) {
  const isSelected = selectedProductIds.includes(product.id);
  const card = document.createElement("div");
  card.className = `product-card${isSelected ? " selected" : ""}`;

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="product-name">${product.name}</div>
    <div class="product-category">${product.category}</div>
    <div class="product-description">${product.description}</div>
    <div class="product-actions">
      <button type="button" class="select-btn">${isSelected ? "Selected" : "Select"}</button>
      <button type="button" class="desc-btn">Description</button>
    </div>
  `;

  const selectBtn = card.querySelector(".select-btn");
  const descBtn = card.querySelector(".desc-btn");

  selectBtn.addEventListener("click", () => {
    if (selectedProductIds.includes(product.id)) {
      selectedProductIds = selectedProductIds.filter((id) => id !== product.id);
    } else {
      selectedProductIds.push(product.id);
    }

    saveSelectedProducts();
    updateSelectedProductsUI();
    renderProducts();
  });

  descBtn.addEventListener("click", () => {
    toggleDescription(card);
  });

  return card;
}

function renderProducts() {
  const filtered = filterProducts();
  const visibleProducts = filtered.slice(0, visibleCount);

  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });

  if (filtered.length === 0) {
    productStatus.textContent = "No matching products found.";
  } else {
    productStatus.textContent = `Loaded ${visibleProducts.length} of ${filtered.length} products`;
  }

  updateShowMoreVisibility(filtered.length);
}

async function loadProducts() {
  productStatus.textContent = "Loading products...";

  try {
    const response = await fetch(`${API}/products`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      productStatus.textContent = data.reply || data.error || "FAILED TO LOAD PRODUCTS";
      return;
    }

    allProducts = Array.isArray(data.products) ? data.products : [];
    saveProductCache();
    visibleCount = 4;
    updateSelectedProductsUI();
    renderProducts();
  } catch {
    productStatus.textContent = "FAILED TO LOAD PRODUCTS";
  }
}

function addChatMessage(role, text, save = true) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const label = document.createElement("div");
  label.className = `label ${role === "user" ? "user-label" : "assistant-label"}`;
  label.textContent = role === "user" ? "You" : "L’Oréal Advisor";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrapper.appendChild(label);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    history.push({
      role,
      content: text
    });
    saveChatHistory();
  }
}

function rebuildChatFromHistory() {
  chatBox.innerHTML = "";

  if (history.length === 0) {
    addChatMessage(
      "assistant",
      "Hello! Load products, select products, generate a routine, and ask follow-up questions about your routine, skincare, haircare, makeup, or beauty products.",
      true
    );
    return;
  }

  history.forEach((item) => {
    addChatMessage(item.role === "assistant" ? "assistant" : "user", item.content, false);
  });
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addChatMessage("user", message, true);
  userInput.value = "";

  const selectedNames = getSelectedProductNames();

  try {
    const response = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        message,
        history: history.map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: item.content
        })),
        selectedProducts: selectedNames
      })
    });

    const data = await response.json();
    const reply = data.reply || "I could not generate a response.";

    addChatMessage("assistant", reply, true);
  } catch {
    addChatMessage("assistant", "There was an error sending your message.", true);
  }
}

function generateRoutine() {
  const selectedNames = getSelectedProductNames();

  if (selectedNames.length === 0) {
    addChatMessage("assistant", "Please select at least one product before generating a routine.", true);
    return;
  }

  const prompt = `Create a simple beauty routine using these selected products: ${selectedNames.join(", ")}.`;
  userInput.value = prompt;
  sendMessage();
}

function clearSelectedProducts() {
  selectedProductIds = [];
  saveSelectedProducts();
  updateSelectedProductsUI();
  renderProducts();
}

function initializeApp() {
  loadSelectedProducts();
  loadChatHistory();
  loadProductCache();
  startFactRotation();
  rebuildChatFromHistory();
  updateSelectedProductsUI();

  if (allProducts.length > 0) {
    renderProducts();
  } else {
    showMoreBtn.style.display = "none";
  }
}

loadProductsBtn.addEventListener("click", loadProducts);

showMoreBtn.addEventListener("click", () => {
  visibleCount += 4;
  renderProducts();
});

searchInput.addEventListener("input", () => {
  visibleCount = 4;
  renderProducts();
});

categoryFilter.addEventListener("change", () => {
  visibleCount = 4;
  renderProducts();
});

clearProductsBtn.addEventListener("click", clearSelectedProducts);
generateRoutineBtn.addEventListener("click", generateRoutine);
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

initializeApp();
