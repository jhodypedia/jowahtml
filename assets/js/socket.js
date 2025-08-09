const API_BASE = "/api"; // sudah lewat vercel.json rewrite
let token = localStorage.getItem("token");

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: 3000
};

document.addEventListener("DOMContentLoaded", () => {

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
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

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      toastr.info("Anda telah logout");
      setTimeout(() => window.location = "index.html", 800);
    });
  }

  // Kirim Pesan
  const sendMessageForm = document.getElementById("sendMessageForm");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let to = document.getElementById("to").value.trim();
      const message = document.getElementById("message").value;

      // Auto format nomor jadi internasional (contoh: 0812... => 62812...)
      if (to.startsWith("0")) {
        to = "62" + to.slice(1);
      }
      to = to.replace(/\D/g, ""); // hanya angka

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
          console.error("Error detail:", data);
          toastr.error(data.message || "Gagal mengirim pesan");
        }
      } catch (err) {
        console.error("Network error:", err);
        toastr.error("Tidak bisa mengirim pesan ke server");
      }
    });
  }

  // Cek Status WA
  const waStatusEl = document.getElementById("waStatus");
  if (waStatusEl) {
    setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/wa/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          if (data.state === "connected") {
            waStatusEl.className = "alert alert-success";
            waStatusEl.textContent = "WA Terhubung";
          } else {
            waStatusEl.className = "alert alert-warning";
            waStatusEl.textContent = "WA Tidak Terhubung";
          }
        }
      } catch {
        waStatusEl.className = "alert alert-danger";
        waStatusEl.textContent = "Gagal cek status";
      }
    }, 5000);
  }

});
