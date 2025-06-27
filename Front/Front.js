  const adminUsername = "admin";
  const adminPassword = "admin123";

  // Simple (insecure) "encryption" using Base64
  function encrypt(data) {
    return btoa(JSON.stringify(data));
  }

  function decrypt(data) {
    return JSON.parse(atob(data));
  }

  function showRegister() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("registerContainer").style.display = "block";
  }

  function register() {
    const user = document.getElementById("newUsername").value.trim();
    const pass = document.getElementById("newPassword").value.trim();
    if (user && pass) {
      if (user === adminUsername) {
        alert("Cannot register as admin.");
        return;
      }
      // Check if user already exists
      if (localStorage.getItem("user_" + user)) {
        alert("User already exists!");
        return;
      }
      localStorage.setItem("user_" + user, encrypt({ username: user, password: pass }));
      alert("Registered! Please login.");
      location.reload();
    } else {
      alert("Please enter both username and password.");
    }
  }

  function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (user === adminUsername && pass === adminPassword) {
      localStorage.setItem("sessionUser", user);
      window.location.href = "../Admin/admin.html";
      return;
    }

    const stored = localStorage.getItem("user_" + user);
    if (stored) {
      const decrypted = decrypt(stored);
      if (decrypted.password === pass) {
        localStorage.setItem("sessionUser", user);
        window.location.href = "../User/user.html";
      } else {
        alert("Invalid password!");
      }
    } else {
      alert("User not found!");
    }
  }
  
  // Prevent back navigation to protected pages after logout or redirect
  history.pushState(null, null, location.href);
    window.onpopstate = function () {
      history.go(1);
    };