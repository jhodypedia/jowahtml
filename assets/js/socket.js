const socket = io({ auth: { token: localStorage.getItem("token") } });

// Status WA
socket.on("wa_state", (state) => {
  const statusEl = document.getElementById("waStatus");
  if (statusEl) {
    if (state === "connected") {
      statusEl.className = "alert alert-success animate__animated animate__pulse animate__infinite";
      statusEl.textContent = "WA Terhubung";
      document.getElementById("qrContainer").style.display = "none";
      toastr.success("WhatsApp Connected!");
    } else {
      statusEl.className = "alert alert-warning";
      statusEl.textContent = "WA Tidak Terhubung";
      toastr.warning("WhatsApp Disconnected!");
    }
  }
});

// QR Code
socket.on("qr", (qr) => {
  const qrImg = document.getElementById("qrImage");
  if (qrImg && qr) {
    document.getElementById("qrContainer").style.display = "block";
    qrImg.src = qr;
    toastr.info("Scan QR Code untuk login WA");
  }
});

// Pesan Masuk
socket.on("incoming-message", (msg) => {
  const list = document.getElementById("messagesList");
  if (list) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `<strong>${msg.from}:</strong> ${msg.text}`;
    list.prepend(li);
    toastr.success(`Pesan baru dari ${msg.from}`);
  }
});
