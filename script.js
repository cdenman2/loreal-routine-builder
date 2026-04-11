const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const grid = document.getElementById("product-grid");
const statusText = document.getElementById("product-status");
const selectedList = document.getElementById("selected-products-list");
const selectedEmpty = document.getElementById("selected-products-empty");

let selectedProducts = [];

/* LOAD PRODUCTS */
document.getElementById("load-products-btn").onclick = async () => {
  statusText.innerText = "Loading...";

  try {
    const res = await fetch(API + "/products");
    const data = await res.json();

    grid.innerHTML = "";

    data.products.forEach((p, index) => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image}" style="width:100%;height:120px;object-fit:contain;">
        <div>${p.name}</div>
        <button>Select</button>
      `;

      const btn = card.querySelector("button");

      btn.onclick = () => {
        if (!selectedProducts.includes(p.name)) {
          selectedProducts.push(p.name);
          card.classList.add("selected");
          btn.innerText = "Selected";
        } else {
          selectedProducts = selectedProducts.filter(x => x !== p.name);
          card.classList.remove("selected");
          btn.innerText = "Select";
        }

        updateSelectedUI();
      };

      grid.appendChild(card);
    });

    statusText.innerText = "Loaded 6 products";
  } catch {
    statusText.innerText = "FAILED TO LOAD PRODUCTS";
  }
};

/* UPDATE SELECTED UI */
function updateSelectedUI() {
  selectedList.innerHTML = "";

  if (selectedProducts.length === 0) {
    selectedEmpty.style.display = "block";
    return;
  }

  selectedEmpty.style.display = "none";

  selectedProducts.forEach(p => {
    const item = document.createElement("div");
    item.className = "selected-item";
    item.innerText = p;
    selectedList.appendChild(item);
  });
}

/* CLEAR BUTTON */
document.getElementById("clear-products-btn").onclick = () => {
  selectedProducts = [];
  updateSelectedUI();

  document.querySelectorAll(".product-card").forEach(card => {
    card.classList.remove("selected");
    card.querySelector("button").innerText = "Select";
  });
};

/* CHAT */
document.getElementById("send-btn").onclick = async () => {
  const input = document.getElementById("user-input");
  const msg = input.value;
  if (!msg) return;

  const chat = document.getElementById("chat-box");

  chat.innerHTML += `<div class="message"><div class="bubble">You: ${msg}</div></div>`;

  const res = await fetch(API + "/chat", {
    method: "POST",
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();

  chat.innerHTML += `<div class="message"><div class="bubble">${data.reply}</div></div>`;

  input.value = "";
};

/* FACT ROTATION */
const facts = [
  "Skincare: Cleanser removes dirt and oil buildup.",
  "Haircare: Conditioner restores moisture and reduces breakage.",
  "Makeup: Primer improves makeup longevity.",
  "SPF protects skin from UV damage.",
  "Serums deliver concentrated active ingredients.",
  "Healthy routines improve long-term skin health."
];

let factIndex = 0;

setInterval(() => {
  const factBox = document.querySelector(".fact-box");
  factIndex = (factIndex + 1) % facts.length;
  factBox.innerText = facts[factIndex];
}, 4000);
