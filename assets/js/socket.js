// Ganti sesuai API backend kamu
const API_BASE = "http://151.240.0.221:3000/api";
let token = localStorage.getItem("token");
let waConnected = false; // status WA

// Toastr config
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: 3000
};

// Socket.IO
if (token) {
  const socket = io("http://151.240.0.221:3000", {
    auth: { token }
  });

  // Status WA
  socket.on("wa_state", (state) => {
    const statusEl = document.getElementById("waStatus");
    if (statusEl) {
      if (state === "connected") {
        waConnected = true;
        statusEl.className = "alert alert-success animate__animated animate__pulse animate__infinite";
        statusEl.textContent = "WA Terhubung";
        document.getElementById("qrContainer").style.display = "none";
        toastr.success("WhatsApp Connected!");
      } else {
        waConnected = false;
        statusEl.className = "alert alert-warning";
        statusEl.textContent = "WA Tidak Terhubung";
        document.getElementById("qrContainer").style.display = "block";
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

  // Pesan masuk
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
}

// Event setelah halaman siap
document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          toastr.success("Login berhasil!");
          localStorage.setItem("token", data.token);
          setTimeout(() => window.location = "dashboard.html", 800);
        } else {
          toastr.error(data.message || "Login gagal");
        }
      } catch (err) {
        toastr.error("Tidak bisa terhubung ke server");
      }
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      toastr.info("Anda telah logout");
      setTimeout(() => window.location = "index.html", 800);
    });
  }

  // KIRIM PESAN
  const sendMessageForm = document.getElementById("sendMessageForm");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!waConnected) {
        toastr.warning("WA belum terhubung. Scan QR Code terlebih dahulu.");
        return;
      }

      const to = document.getElementById("to").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!to || !message) {
        toastr.warning("Nomor dan pesan wajib diisi");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ to, text: message })
        });
        const data = await res.json();
        if (res.ok) {
          toastr.success("Pesan terkirim!");
          sendMessageForm.reset();
        } else {
          toastr.error(data.message || "Gagal mengirim pesan");
        }
      } catch (err) {
        toastr.error("Tidak bisa mengirim pesan ke server");
      }
    });
  }
});
