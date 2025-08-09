// Gunakan relative path supaya Vercel rewrite bisa jalan
const API_BASE = "/api";
let token = localStorage.getItem("token");

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: 3000
};

document.addEventListener("DOMContentLoaded", () => {
  // ==== LOGIN ====
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        toastr.error("Username dan password wajib diisi");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          toastr.success("Login berhasil!");
          setTimeout(() => (window.location.href = "dashboard.html"), 800);
        } else {
          toastr.error(data.message || "Login gagal");
        }
      } catch (err) {
        toastr.error("Tidak bisa terhubung ke server");
      }
    });
  }

  // ==== LOGOUT ====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      toastr.info("Anda telah logout");
      setTimeout(() => (window.location.href = "index.html"), 800);
    });
  }

  // ==== KIRIM PESAN ====
  const sendMessageForm = document.getElementById("sendMessageForm");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const to = document.getElementById("to").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!to || !message) {
        toastr.error("Nomor dan pesan tidak boleh kosong");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
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

  // ==== CEK STATUS WA ====
  const statusEl = document.getElementById("waStatus");
  if (statusEl) {
    checkWAStatus();
    setInterval(checkWAStatus, 5000);
  }
});

async function checkWAStatus() {
  try {
    const res = await fetch(`${API_BASE}/wa/status`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();

    const statusEl = document.getElementById("waStatus");
    const qrContainer = document.getElementById("qrContainer");
    const qrImg = document.getElementById("qrImage");

    if (data.state === "connected") {
      statusEl.className = "alert alert-success animate__animated animate__pulse animate__infinite";
      statusEl.textContent = "WA Terhubung";
      if (qrContainer) qrContainer.style.display = "none";
    } else {
      statusEl.className = "alert alert-warning";
      statusEl.textContent = "WA Tidak Terhubung";
      if (data.qr && qrImg) {
        qrContainer.style.display = "block";
        qrImg.src = data.qr;
        toastr.info("Scan QR Code untuk login WA");
      }
    }
  } catch (err) {
    toastr.error("Gagal memeriksa status WA");
  }
}
