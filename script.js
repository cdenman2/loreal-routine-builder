Skip to content
cdenman2
loreal-routine-builder
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Wiki
Security and quality
Insights
Settings
loreal-routine-builder
/script.js
Go to file
t
cdenman2
cdenman2
Update script.js
a497754
 · 
49 minutes ago

Code

Blame
115 lines (89 loc) · 2.43 KB
const API = "https://YOUR_WORKER_URL";

let allProducts = [];
let selected = [];
let visibleCount = 8;

// LOAD PRODUCTS
async function loadProducts() {
  const category = document.getElementById("category").value;

  const res = await fetch(`${API}/products?category=${category}`);
  const data = await res.json();

  allProducts = data;
  visibleCount = 8;

  render();
}

// SHOW MORE
function showMore() {
  visibleCount += 8;
  render();
}

// RENDER PRODUCTS
function render() {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  const search = document.getElementById("search").value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  filtered.slice(0, visibleCount).forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${p.image}" />
      <h4>${p.name}</h4>
      <p>${p.category}</p>
      <button onclick='selectProduct(${JSON.stringify(p)})'>
        ${selected.find(x => x.id === p.id) ? "Unselect" : "Select"}
      </button>
    `;

    grid.appendChild(div);
  });

  document.getElementById("count").innerText =
    `Loaded ${filtered.length} products`;
}

// SELECT
function selectProduct(p) {
  const exists = selected.find(x => x.id === p.id);

  if (exists) {
    selected = selected.filter(x => x.id !== p.id);
  } else {
    selected.push(p);
  }

  updateSelected();
  render();
}

// UPDATE SELECTED
function updateSelected() {
  const box = document.getElementById("selectedList");

  if (selected.length === 0) {
    box.innerText = "None selected";
    return;
  }

  box.innerText = selected.map(p => p.name).join(", ");
}

// CLEAR
function clearSelected() {
  selected = [];
  updateSelected();
  render();
}

// CHAT
async function sendChat() {
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

  const chat = document.getElementById("chatBox");
  chat.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  chat.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;

  input.value = "";
}

// ROUTINE
function generateRoutine() {
  alert("Routine generated based on selected products!");
}
Symbols
Find definitions and references for functions and other symbols in this file by clicking a symbol below or in the code.

Filter symbols
r
func
loadProducts
func
showMore
func
render
func
selectProduct
func
updateSelected
func
clearSelected
func
sendChat
func
generateRoutine
