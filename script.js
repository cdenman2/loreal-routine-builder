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

let allProducts = [];
let visibleCount = 6;
let selectedProducts = [];
let history = [];

const lorealFacts = [
  "Healthy skincare routines usually follow this order: cleanser, treatment serum, moisturizer, and sunscreen during the day.",
  "Skincare products help support cleansing, hydration, brightness, and protection.",
  "Haircare routines often work best with a shampoo first, then conditioner, followed by leave-in treatments if needed.",
  "Makeup usually applies more smoothly when skin is hydrated and prepped first.",
  "Conditioner helps smooth the hair cuticle and improve softness after shampooing.",
  "Serums are lightweight formulas designed to target specific concerns such as dullness, dryness, or uneven-looking skin.",
  "Sunscreen helps protect skin from UV damage and is an important daytime step.",
  "Mascara is usually one of the last steps in a basic makeup routine."
];

let factIndex = 0;

function rotateFacts() {
  factText.textContent = lorealFacts[factIndex];
  factIndex = (factIndex + 1) % lorealFacts.length;
}

rotateFacts();
setInterval(rotateFacts, 4000);

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

function renderProducts() {
  const filtered = filterProducts();

  productGrid.innerHTML = "";

  filtered.slice(0, visibleCount).forEach((product) => {
    const isSelected = selectedProducts.includes(product.name);

    const card = document.createElement("div");
    card.className = `product-card${isSelected ? " selected" : ""}`;

    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-actions">
        <button type="button">${isSelected ? "Selected" : "Select"}</button>
      </div>
    `;

    const button = card.querySelector("button");
    button.addEventListener("click", () => {
      if (selectedProducts.includes(product.name)) {
        selectedProducts = selectedProducts.filter((name) => name !== product.name);
      } else {
        selectedProducts.push(product.name);
      }
      updateSelectedProductsUI();
      renderProducts();
    });

    productGrid.appendChild(card);
  });

  if (filtered.length === 0) {
    productStatus.textContent = "No matching products found.";
  } else {
    productStatus.textContent = `Loaded ${Math.min(filtered.length, visibleCount)} of ${filtered.length} products`;
  }
}

function updateSelectedProductsUI() {
  selectedProductsList.innerHTML = "";

  if (selectedProducts.length === 0) {
    selectedProductsEmpty.style.display = "block";
    return;
  }

  selectedProductsEmpty.style.display = "none";

  selectedProducts.forEach((name) => {
    const item = document.createElement("div");
    item.className = "selected-item";
    item.textContent = name;
    selectedProductsList.appendChild(item);
  });
}

async function loadProducts() {
  productStatus.textContent = "Loading products...";

  try {
    const response = await fetch(`${API}/products`);
    const data = await response.json();

    if (!response.ok) {
      productStatus.textContent = "FAILED TO LOAD PRODUCTS";
      return;
    }

    allProducts = Array.isArray(data.products) ? data.products : [];
    visibleCount = 6;
    renderProducts();
  } catch (error) {
    productStatus.textContent = "FAILED TO LOAD PRODUCTS";
  }
}

function addChatMessage(role, text) {
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
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addChatMessage("user", message);
  userInput.value = "";

  try {
    const response = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history,
        selectedProducts
      })
    });

    const data = await response.json();
    const reply = data.reply || "I could not generate a response.";

    addChatMessage("assistant", reply);

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });
  } catch (error) {
    addChatMessage("assistant", "There was an error sending your message.");
  }
}

function generateRoutine() {
  if (selectedProducts.length === 0) {
    addChatMessage("assistant", "Please select at least one product before generating a routine.");
    return;
  }

  const prompt = `Create a simple beauty routine using these selected products: ${selectedProducts.join(", ")}.`;
  userInput.value = prompt;
  sendMessage();
}

loadProductsBtn.addEventListener("click", loadProducts);

showMoreBtn.addEventListener("click", () => {
  visibleCount += 3;
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

clearProductsBtn.addEventListener("click", () => {
  selectedProducts = [];
  updateSelectedProductsUI();
  renderProducts();
});

generateRoutineBtn.addEventListener("click", generateRoutine);

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

updateSelectedProductsUI();
