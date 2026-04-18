const API = "https://loreal-worker.loreal-chatbot-nick.workers.dev";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");

const expandChatBtn = document.getElementById("expand-chat-btn");
const chatContainer = document.getElementById("chat-container");

let history = [];

/* CLICKABLE LINKS FIX */
function formatMessageWithLinks(text) {
  if (!text) return "";

  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" style="color:blue; text-decoration:underline;">${url}</a>`
  );
}

/* ADD MESSAGE */
function addChatMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (role === "assistant") {
    bubble.innerHTML = formatMessageWithLinks(text);
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);

  chatBox.scrollTop = chatBox.scrollHeight;
}

/* SEND MESSAGE */
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addChatMessage("user", message);
  userInput.value = "";

  const response = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      selectedProducts: []
    })
  });

  const data = await response.json();

  addChatMessage("assistant", data.reply || "Error");
}

/* CLEAR CHAT */
function clearChat() {
  chatBox.innerHTML = "";
  history = [];
}

sendBtn.addEventListener("click", sendMessage);
clearChatBtn.addEventListener("click", clearChat);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* EXPAND CHAT */
expandChatBtn.addEventListener("click", () => {
  chatContainer.classList.toggle("expanded");

  if (chatContainer.classList.contains("expanded")) {
    expandChatBtn.textContent = "❌";
  } else {
    expandChatBtn.textContent = "⬜";
  }
});
