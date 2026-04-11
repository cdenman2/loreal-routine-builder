const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const productGrid = document.getElementById("productGrid");
const loadBtn = document.getElementById("loadProductsBtn");
const moreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const statusText = document.getElementById("statusText");

let products = [];
let displayed = 0;
const PAGE_SIZE = 8;

loadBtn.onclick = async () => {
  statusText.textContent = "Loading products...";
  try {
    const res = await fetch(API + "/products");
    const data = await res.json();
    products = data.products;
    displayed = 0;
    productGrid.innerHTML = "";
    renderMore();
    statusText.textContent = `Loaded ${products.length} products`;
  } catch (err) {
    statusText.textContent = "Error loading products";
  }
};

moreBtn.onclick = renderMore;

function renderMore() {
  const filtered = filterProducts();

  const slice = filtered.slice(displayed, displayed + PAGE_SIZE);
  slice.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <h3>${p.name}</h3>
      <p>${p.category}</p>
      <button>Select Product</button>
    `;

    productGrid.appendChild(card);
  });

  displayed += PAGE_SIZE;
}

function filterProducts() {
  const search = searchInput.value.toLowerCase();
  const category = categorySelect.value;

  return products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search);
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });
}

searchInput.oninput = () => {
  productGrid.innerHTML = "";
  displayed = 0;
  renderMore();
};

categorySelect.onchange = () => {
  productGrid.innerHTML = "";
  displayed = 0;
  renderMore();
};
