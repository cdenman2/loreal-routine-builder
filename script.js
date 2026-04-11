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

const workerUrl = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

let messages = [];
let selectedProducts = JSON.parse(localStorage.getItem("lorealSelectedProducts")) || [];
let showAllProducts = false;

const lorealFacts = [
  "Healthy skincare routines usually follow this order: cleanser, treatment or serum, moisturizer, and sunscreen during the day.",
  "Daily sunscreen is one of the most important steps in protecting skin from premature aging caused by UV exposure.",
  "A moisturizer helps lock in hydration and supports the skin barrier after cleansing and treatment products.",
  "Serums are usually lightweight formulas designed to target specific concerns such as dryness, dullness, or fine lines.",
  "Haircare routines work best when matched to your needs, such as hydration for dry hair, repair for damaged hair, or volume for fine hair.",
  "Conditioner helps smooth the hair cuticle, improve softness, and reduce tangling after shampooing.",
  "Makeup usually applies more smoothly when skin is prepped first with hydration and a primer-friendly skincare routine.",
  "Removing makeup before bed is one of the simplest habits that helps keep skin cleaner and more balanced.",
  "A simple routine done consistently often works better than an overly complicated routine that is hard to maintain.",
  "Heat styling can stress hair over time, so heat protectant products are often an important step before styling."
];

const products = [
  {
    id: "revitalift-cleanser",
    name: "Revitalift Bright Reveal Cleanser",
    category: "skincare",
    description: "A daily cleanser that helps remove dirt, oil, and dull surface buildup for a fresher-looking complexion.",
    image: "./images/product-cleanser.jpg"
  },
  {
    id: "revitalift-serum",
    name: "Revitalift Hyaluronic Acid Serum",
    category: "skincare",
    description: "A hydrating serum designed to help skin feel plumper and smoother with lightweight moisture support.",
    image: "./images/product-serum.jpg"
  },
  {
    id: "revitalift-moisturizer",
    name: "Revitalift Triple Power Moisturizer",
    category: "skincare",
    description: "A moisturizer that helps support hydration while improving the feel of skin softness and comfort.",
    image: "./images/product-moisturizer.jpg"
  },
  {
    id: "bright-reveal-spf",
    name: "Bright Reveal SPF Moisturizer",
    category: "skincare",
    description: "A daytime moisturizer with SPF support to help protect skin while keeping it hydrated.",
    image: "./images/product-spf.jpg"
  },
  {
    id: "elvive-shampoo",
    name: "Elvive Hyaluron Plump Shampoo",
    category: "haircare",
    description: "A hydrating shampoo designed for dehydrated hair that needs softness and bounce.",
    image: "./images/product-shampoo.jpg"
  },
  {
    id: "elvive-conditioner",
    name: "Elvive Hyaluron Plump Conditioner",
    category: "haircare",
    description: "A conditioner that helps smooth and moisturize hair after cleansing.",
    image: "./images/product-conditioner.jpg"
  },
  {
    id: "elvive-serum",
    name: "Elvive Wonder Water Serum",
    category: "haircare",
    description: "A lightweight hair treatment that helps improve softness, shine, and manageability.",
    image: "./images/product-hair-serum.jpg"
  },
  {
    id: "infallible-foundation",
    name: "Infallible Fresh Wear Foundation",
    category: "makeup",
    description: "A long-wear foundation designed for breathable coverage and a smoother complexion look.",
    image: "./images/product-foundation.jpg"
  },
  {
    id: "telescopic-mascara",
    name: "Telescopic Mascara",
    category: "makeup",
    description: "A mascara designed to help lashes look longer and more defined.",
    image: "./images/product-mascara.jpg"
  },
  {
    id: "lip-oil",
    name: "Glow Paradise Lip Oil",
    category: "makeup",
    description: "A glossy lip product that helps lips look smoother and more hydrated.",
    image: "./images/product-lip.jpg"
  }
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

  const imageSrc = product.image || "./images/loreal-logo.jpg";

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${imageSrc}" alt="${product.name}">
    </div>
    <div class="product-name">${product.name}</div>
    <div class="product-category">${capitalizeFirst(product.category)}</div>
    <div class="product-description">${product.description}</div>
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
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    const matchesCategory = category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  productGrid.innerHTML = "";

  filtered.forEach((product, index) => {
    const hiddenClass = !showAllProducts && index >= 6 ? "hidden-card" : "";
    productGrid.appendChild(createProductCard(product, hiddenClass));
  });

  showMoreBtn.style.display = filtered.length > 6 ? "inline-block" : "none";
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
    .map((product) => `- ${product.name} (${product.category}): ${product.description}`)
    .join("\n");

  const prompt = `Create a personalized beauty routine using these selected L’Oréal products:

${productSummary}

Please organize the routine clearly, explain the order of use, and mention what each product contributes to the routine.`;

  await sendToWorker(prompt);
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

renderProducts();
updateSelectedProductsUI();
