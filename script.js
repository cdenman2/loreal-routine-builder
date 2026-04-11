const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const factText = document.getElementById("fact-text");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const productGrid = document.getElementById("product-grid");
const selectedProductsList = document.getElementById("selected-products-list");
const selectedProductsEmpty = document.getElementById("selected-products-empty");
const generateRoutineBtn = document.getElementById("generate-routine-btn");
const clearProductsBtn = document.getElementById("clear-products-btn");
const showMoreBtn = document.getElementById("show-more-btn");
const loadProductsBtn = document.getElementById("load-products-btn");
const productStatus = document.getElementById("product-status");

const workerUrl = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

let messages = [];
let selectedProducts = JSON.parse(localStorage.getItem("lorealSelectedProducts")) || [];
let showAllProducts = false;
let products = [];

const lorealFacts = [
  "Healthy skincare routines usually follow this order: cleanser, treatment serum, moisturizer, and sunscreen during the day.",
  "Daily sunscreen is one of the most important steps in protecting skin from premature aging caused by UV exposure.",
  "A moisturizer helps lock in hydration and supports the skin barrier after cleansing and treatment products.",
  "Serums are usually lightweight formulas designed to target specific concerns such as dryness, dullness, or fine lines.",
  "Haircare routines work best when matched to your needs, such as hydration for dry hair, repair for damaged hair, or volume for fine hair.",
  "Conditioner helps smooth the hair cuticle, improve softness, and reduce tangling after shampooing.",
  "Makeup usually applies more smoothly when skin is prepped first with hydration and a primer-friendly skincare routine.",
  "Removing makeup before bed is one of the simplest habits that helps keep skin cleaner and more balanced."
];

let factIndex = 0;

function rotateFacts() {
  if (!factText) return;
  factText.textContent = lorealFacts[factIndex];
  factIndex = (factIndex + 1) % lorealFacts.length;
}

rotateFacts();
setInterval(rotateFacts, 5000);

function saveSelectedProducts() {
  localStorage.setItem("lorealSelectedProducts", JSON.stringify(selectedProducts));
}

function isSelected(productId) {
  return selectedProducts.some((product) => product.id === productId);
}

function updateSelectedProductsUI() {
  selectedProductsList.innerHTML = "";

  if (selectedProducts.length === 0) {
    selectedProductsEmpty.style.display = "block";
    return;
  }

  selectedProductsEmpty.style.display = "none";

  selectedProducts.forEach((product) => {
    const chip = document.createElement("div");
    chip.className = "selected-item";
    chip.textContent = product.name;
    selectedProductsList.appendChild(chip);
  });
}

function toggleProductSelection(product) {
  if (isSelected(product.id)) {
    selectedProducts = selectedProducts.filter((item) => item.id !== product.id);
  } else {
    selectedProducts.push(product);
  }

  saveSelectedProducts();
  renderProducts();
  updateSelectedProductsUI();
}

function createProductCard(product, hiddenClass = "") {
  const card = document.createElement("div");
  card.className = `product-card ${isSelected(product.id) ? "selected" : ""} ${hiddenClass}`.trim();

  const safeDescription = product.description || "No description available.";
  const safeCategory = product.category || "other";
  const safeImage = product.image || "./images/loreal-logo.jpg";

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${safeImage}" alt="${product.name}">
    </div>
    <div class="product-name">${product.name}</div>
    <div class="product-category">${capitalizeFirst(safeCategory)}</div>
    <div class="product-description">${safeDescription}</div>
    <div class="product-actions">
      <button class="secondary-btn select-btn" type="button">
        ${isSelected(product.id) ? "Unselect Product" : "Select Product"}
      </button>
      <button class="secondary-btn desc-btn" type="button">Show Description</button>
    </div>
  `;

  card.querySelector(".select-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProductSelection(product);
  });

  card.querySelector(".desc-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    card.classList.toggle("show-description");
    event.target.textContent = card.classList.contains("show-description")
      ? "Hide Description"
      : "Show Description";
  });

  card.addEventListener("click", () => {
    toggleProductSelection(product);
  });

  return card;
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchTerm) ||
      (product.description || "").toLowerCase().includes(searchTerm) ||
      (product.category || "").toLowerCase().includes(searchTerm);

    const matchesCategory = category === "all" || (product.category || "other") === category;

    return matchesSearch && matchesCategory;
  });

  productGrid.innerHTML = "";

  filtered.forEach((product, index) => {
    const hiddenClass = !showAllProducts && index >= 8 ? "hidden-card" : "";
    productGrid.appendChild(createProductCard(product, hiddenClass));
  });

  showMoreBtn.style.display = filtered.length > 8 ? "inline-block" : "none";
  showMoreBtn.textContent = showAllProducts ? "Show Fewer Products" : "Show More Products";
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function addMessage(role, labelText, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  const labelDiv = document.createElement("div");
  labelDiv.className = "label";

  if (role === "assistant") {
    labelDiv.classList.add("assistant-label");
  }

  labelDiv.textContent = labelText;

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "bubble";
  bubbleDiv.textContent = text;

  messageDiv.appendChild(labelDiv);
  messageDiv.appendChild(bubbleDiv);

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  return bubbleDiv;
}

async function sendToWorker(customText = null) {
  const text = customText ?? userInput.value.trim();
  if (text === "") return;

  addMessage("user", "You", text);
  messages.push({ role: "user", content: text });

  if (!customText) {
    userInput.value = "";
  }

  const loadingBubble = addMessage("assistant", "L’Oréal Advisor", "Thinking...");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();

    if (!response.ok) {
      loadingBubble.textContent = "Error: " + (data.error || "Request failed.");
      return;
    }

    if (data.reply) {
      loadingBubble.textContent = data.reply;
      messages.push({ role: "assistant", content: data.reply });
    } else if (data.error) {
      loadingBubble.textContent = "Error: " + data.error;
    } else {
      loadingBubble.textContent = "Error: Worker returned an unexpected response.";
    }
  } catch (error) {
    loadingBubble.textContent = "Error: " + error.message;
  }
}

async function generateRoutine() {
  if (selectedProducts.length === 0) {
    addMessage(
      "assistant",
      "L’Oréal Advisor",
      "Please select at least one product before generating a routine."
    );
    return;
  }

  const productSummary = selectedProducts
    .map((product) => `- ${product.name} (${product.category || "other"}): ${product.description || "No description available."}`)
    .join("\n");

  const prompt = `Create a personalized beauty routine using these selected L’Oréal products:

${productSummary}

Please organize the routine clearly, explain the order of use, and mention what each product contributes to the routine.`;

  await sendToWorker(prompt);
}

async function loadLiveProducts() {
  productStatus.textContent = "Loading live L’Oréal products...";
  productGrid.innerHTML = "";

  try {
    const response = await fetch(`${workerUrl}/products`, {
      method: "GET"
    });

    const data = await response.json();

    if (!response.ok) {
      productStatus.textContent = "Error loading products: " + (data.error || "Request failed.");
      return;
    }

    products = Array.isArray(data.products) ? data.products : [];

    if (products.length === 0) {
      productStatus.textContent = "No products were returned by the worker.";
      return;
    }

    productStatus.textContent = `Loaded ${products.length} live L’Oréal products.`;
    renderProducts();
  } catch (error) {
    productStatus.textContent = "Error loading products: " + error.message;
  }
}

sendBtn.addEventListener("click", () => sendToWorker());

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendToWorker();
  }
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

generateRoutineBtn.addEventListener("click", generateRoutine);

clearProductsBtn.addEventListener("click", () => {
  selectedProducts = [];
  saveSelectedProducts();
  renderProducts();
  updateSelectedProductsUI();
});

showMoreBtn.addEventListener("click", () => {
  showAllProducts = !showAllProducts;
  renderProducts();
});

loadProductsBtn.addEventListener("click", loadLiveProducts);

updateSelectedProductsUI();
