import cloudinaryConfig from "./config.js";

// DOM elements
const textArea = document.getElementById("text-content");
const shareButton = document.getElementById("share-button");
const shareLink = document.getElementById("share-link");
const shareLinkInput = document.getElementById("share-link-input");
const copyButton = document.getElementById("copy-button");
const qrButton = document.getElementById("qr-button");
const textHistory = document.getElementById("text-history");

// Event listeners
shareButton.addEventListener("click", shareText);
copyButton.addEventListener("click", copyLink);
qrButton.addEventListener("click", showQRCode);

// Share text function
async function shareText() {
  const text = textArea.value.trim();

  if (!text) {
    alert("Please enter some text to share.");
    return;
  }

  try {
    shareButton.disabled = true;
    shareButton.textContent = "Sharing...";

    // Upload text to Cloudinary
    const url = await uploadTextToCloudinary(text);

    // Update UI
    shareLinkInput.value = url;
    shareLink.style.display = "flex";

    // Save to history
    saveToHistory(text, url);

    shareButton.disabled = false;
    shareButton.textContent = "Share Text";
  } catch (error) {
    console.error("Error sharing text:", error);
    alert("Failed to share text: " + error.message);

    shareButton.disabled = false;
    shareButton.textContent = "Share Text";
  }
}

// Upload text to Cloudinary
function uploadTextToCloudinary(text) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([text], { type: "text/plain" });
    const file = new File([blob], `text-${Date.now()}.txt`, { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`, true);

    xhr.onload = () => {
      console.log(xhr.responseText); // Debugging: Show full response

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(formData);
  });
}

// Copy link function
function copyLink() {
  shareLinkInput.select();
  document.execCommand("copy");

  copyButton.textContent = "Copied!";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 2000);
}

// Show QR Code function
function showQRCode() {
  const url = shareLinkInput.value;

  if (!url) return;

  const modal = document.createElement("div");
  modal.className = "qr-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "qr-modal-content";

  const closeButton = document.createElement("span");
  closeButton.className = "close-button";
  closeButton.textContent = "×";
  closeButton.onclick = () => {
    document.body.removeChild(modal);
  };

  const title = document.createElement("h3");
  title.textContent = "QR Code for Shared Text";

  const qrImage = document.createElement("img");
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  qrImage.alt = "QR Code";

  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(qrImage);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  window.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  };
}

// Save shared text to history
function saveToHistory(text, url) {
  let history = JSON.parse(localStorage.getItem("textHistory") || "[]");

  history.unshift({
    text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    url: url,
    timestamp: new Date().toISOString(),
  });

  history = history.slice(0, 20);
  localStorage.setItem("textHistory", JSON.stringify(history));

  loadTextHistory();
}

// Load text history
function loadTextHistory() {
  const history = JSON.parse(localStorage.getItem("textHistory") || "[]");

  if (history.length > 0) {
    textHistory.innerHTML = "<h3>Recent Shared Texts</h3>";

    history.forEach((item) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      const textPreview = document.createElement("div");
      textPreview.className = "text-preview";
      textPreview.textContent = item.text;

      const timestamp = document.createElement("span");
      timestamp.className = "timestamp";
      timestamp.textContent = new Date(item.timestamp).toLocaleString();

      const actions = document.createElement("div");
      actions.className = "history-actions";

      const openButton = document.createElement("button");
      openButton.textContent = "Open";
      openButton.onclick = () => {
        window.open(item.url, "_blank");
      };

      const copyLinkButton = document.createElement("button");
      copyLinkButton.textContent = "Copy Link";
      copyLinkButton.onclick = () => {
        navigator.clipboard.writeText(item.url);
        copyLinkButton.textContent = "Copied!";
        setTimeout(() => {
          copyLinkButton.textContent = "Copy Link";
        }, 2000);
      };

      actions.appendChild(openButton);
      actions.appendChild(copyLinkButton);

      historyItem.appendChild(textPreview);
      historyItem.appendChild(timestamp);
      historyItem.appendChild(actions);
      textHistory.appendChild(historyItem);
    });

    textHistory.style.display = "block";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", loadTextHistory);
