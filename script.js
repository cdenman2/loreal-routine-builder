const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const grid = document.getElementById("product-grid");
const statusText = document.getElementById("product-status");

document.getElementById("load-products-btn").onclick = async () => {
  statusText.innerText = "Loading...";

  try {
    const res = await fetch(API + "/products");
    const data = await res.json();

    grid.innerHTML = "";

    data.products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image}" style="width:100%;height:100px;object-fit:contain;">
        <div>${p.name}</div>
        <button>Select</button>
      `;

      grid.appendChild(card);
    });

    statusText.innerText = "Loaded products";
  } catch {
    statusText.innerText = "FAILED TO LOAD PRODUCTS";
  }
};

/* CHAT */
document.getElementById("send-btn").onclick = async () => {
  const input = document.getElementById("user-input");
  const msg = input.value;

  if(!msg) return;

  const chat = document.getElementById("chat-box");

  chat.innerHTML += `<div class="message"><div class="bubble">You: ${msg}</div></div>`;

  const res = await fetch(API + "/chat", {
    method:"POST",
    body: JSON.stringify({message: msg})
  });

  const data = await res.json();

  chat.innerHTML += `<div class="message"><div class="bubble">${data.reply}</div></div>`;

  input.value = "";
};
