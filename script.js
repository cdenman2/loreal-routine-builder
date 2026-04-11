const API = "https://YOUR-WORKER-URL.workers.dev";

let products = [];
let selected = [];
let visible = 8;

// LOAD PRODUCTS
async function loadProducts() {
  const category = document.getElementById("categoryDropdown").value;

  const res = await fetch(`${API}/products?category=${category}`);
  const data = await res.json();

  products = data;
  visible = 8;

  renderProducts();
}

// RENDER
function renderProducts() {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  filtered.slice(0, visible).forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";

    div.innerHTML = `
      <img src="${p.image}">
      <h4>${p.name}</h4>
      <p>${p.category}</p>

      <button onclick='toggleProduct(${JSON.stringify(p)})'>
        ${selected.find(x => x.id === p.id) ? "Unselect Product" : "Select Product"}
      </button>

      <button onclick='alert("${p.description}")'>
        Show Description
      </button>
    `;

    container.appendChild(div);
  });

  document.getElementById("productCount").innerText =
    `Loaded ${filtered.length} products`;
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

// UPDATE SELECTED
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

  chat.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  chat.innerHTML += `<p><b>L'Oréal Advisor:</b> ${data.reply}</p>`;

  input.value = "";
}

// ROUTINE
function generateRoutine() {
  alert("Routine generated!");
}
