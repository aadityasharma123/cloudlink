import cloudinaryConfig from "./config.js"

// DOM elements
const fileInput = document.getElementById("file-input")
const uploadButton = document.getElementById("upload-button")
const shareLink = document.getElementById("share-link")
const fileShareLinkInput = document.getElementById("file-share-link-input")
const copyFileButton = document.getElementById("copy-file-button")
const qrFileButton = document.getElementById("qr-file-button")

// Event listeners
uploadButton.addEventListener("click", uploadFile)
copyFileButton.addEventListener("click", copyFileLink)
qrFileButton.addEventListener("click", showFileQRCode)

// Upload file
async function uploadFile() {
  const file = fileInput.files[0]

  if (!file) {
    alert("Please select a file to upload.")
    return
  }

  try {
    // Show loading state
    uploadButton.disabled = true
    uploadButton.textContent = "Uploading..."

    // Upload file to Cloudinary
    const url = await uploadToCloudinary(file)

    // Update UI
    fileShareLinkInput.value = url
    shareLink.style.display = "flex"

    // Reset button
    uploadButton.disabled = false
    uploadButton.textContent = "Upload and Share"
  } catch (error) {
    console.error("Error uploading file:", error)
    alert("Failed to upload file: " + error.message)

    // Reset button
    uploadButton.disabled = false
    uploadButton.textContent = "Upload and Share"
  }
}

// Upload file to Cloudinary
function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryConfig.uploadPreset)

    formData.append("context", "type=file_share")

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.dverldjqw}/auto/upload`, true)

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve(response.secure_url)
      } else {
        reject(new Error("Upload failed"))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error"))
    }

    xhr.send(formData)
  })
}

// Copy file link to clipboard
function copyFileLink() {
  fileShareLinkInput.select()
  document.execCommand("copy")

  copyFileButton.textContent = "Copied!"
  setTimeout(() => {
    copyFileButton.textContent = "Copy"
  }, 2000)
}

// Show file QR code
function showFileQRCode() {
  const url = fileShareLinkInput.value

  if (!url) return

  const modal = document.createElement("div")
  modal.className = "qr-modal"

  const modalContent = document.createElement("div")
  modalContent.className = "qr-modal-content"

  const closeButton = document.createElement("span")
  closeButton.className = "close-button"
  closeButton.textContent = "×"
  closeButton.onclick = () => {
    document.body.removeChild(modal)
  }

  const title = document.createElement("h3")
  title.textContent = "QR Code for Shared File"

  const qrImage = document.createElement("img")
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  qrImage.alt = "QR Code"

  modalContent.appendChild(closeButton)
  modalContent.appendChild(title)
  modalContent.appendChild(qrImage)
  modal.appendChild(modalContent)

  document.body.appendChild(modal)

  window.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal)
    }
  }
}
