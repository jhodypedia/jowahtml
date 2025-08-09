const API_BASE = "http://151.240.0.221:3000/api";
let token = localStorage.getItem("token");

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: 3000
};

document.addEventListener("DOMContentLoaded", () => {
  // Login Page
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.ok) {
        toastr.success("Login berhasil!");
        localStorage.setItem("token", data.token);
        setTimeout(() => window.location = "dashboard.html", 800);
      } else {
        toastr.error(data.message || "Login gagal");
      }
    });
  }

  // Dashboard
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      toastr.info("Anda telah logout");
      setTimeout(() => window.location = "index.html", 800);
    });
  }

  const sendMessageForm = document.getElementById("sendMessageForm");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const to = document.getElementById("to").value;
      const message = document.getElementById("message").value;
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ to, text: message })
      });
      const data = await res.json();
      if (data.ok) {
        toastr.success("Pesan terkirim!");
        sendMessageForm.reset();
      } else {
        toastr.error("Gagal mengirim pesan");
      }
    });
  }
});
