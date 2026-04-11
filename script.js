const API = "https://YOUR-WORKER-URL.workers.dev";

let products = [];
let selected = [];
let visible = 8;

// LOAD PRODUCTS
async function loadProducts() {
  try {
    const category = document.getElementById("categoryDropdown").value;

    const res = await fetch(`${API}/products?category=${category}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      alert("Error loading products");
      return;
    }

    products = data;
    visible = 8;

    renderProducts();
  } catch (e) {
    console.error(e);
    alert("Failed to load products");
  }
}

// RENDER PRODUCTS
function renderProducts() {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  filtered.slice(0, visible).forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" onerror="this.src='fallback.png'"/>
      <h3>${p.name}</h3>
      <p>${p.category}</p>

      <button onclick='toggleProduct(${JSON.stringify(p)})'>
        ${selected.find(x => x.id === p.id) ? "Unselect Product" : "Select Product"}
      </button>

      <button onclick='showDescription("${p.description}")'>
        Show Description
      </button>
    `;

    container.appendChild(card);
  });

  document.getElementById("productCount").innerText =
    `Loaded ${filtered.length} live L'Oréal products.`;
}

// SELECT
function toggleProduct(p) {
  const exists = selected.find(x => x.id === p.id);

  if (exists) {
    selected = selected.filter(x => x.id !== p.id);
  } else {
    selected.push(p);
  }

  updateSelected();
  renderProducts();
}

// SELECTED DISPLAY
function updateSelected() {
  const box = document.getElementById("selectedProducts");

  if (selected.length === 0) {
    box.innerText = "No products selected yet.";
    return;
  }

  box.innerText = selected.map(p => p.name).join(", ");
}

// CLEAR
function clearSelected() {
  selected = [];
  updateSelected();
  renderProducts();
}

// SHOW MORE
function showMoreProducts() {
  visible += 8;
  renderProducts();
}

// DESCRIPTION
function showDescription(desc) {
  alert(desc);
}

// CHAT
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value;

  const res = await fetch(`${API}/chat`, {
    method: "POST",
    body: JSON.stringify({
      message: msg,
      history: []
    })
  });

  const data = await res.json();

  const chat = document.getElementById("chatMessages");

  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  chat.innerHTML += `<div class="bot-msg">${data.reply}</div>`;

  input.value = "";
}
