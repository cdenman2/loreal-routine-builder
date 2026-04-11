const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const loadBtn = document.getElementById("load-products-btn");
const grid = document.getElementById("product-grid");
const status = document.getElementById("product-status");

const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

loadBtn.onclick = async () => {
  status.textContent = "Loading products...";

  try {
    const res = await fetch(API + "/products");
    const data = await res.json();

    grid.innerHTML = "";

    data.products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <div class="product-image-wrap">
          <img src="${p.image}">
        </div>
        <div>${p.name}</div>
        <div>${p.category}</div>
      `;

      grid.appendChild(card);
    });

    status.textContent = "Loaded " + data.products.length + " products";
  } catch (e) {
    status.textContent = "FAILED TO LOAD PRODUCTS";
  }
};

sendBtn.onclick = async () => {
  const msg = input.value.trim();
  if (!msg) return;

  chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  input.value = "";

  try {
    const res = await fetch(API + "/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    chatBox.innerHTML += `<div><b>AI:</b> ${data.reply}</div>`;
  } catch {
    chatBox.innerHTML += `<div><b>AI:</b> ERROR</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
};
