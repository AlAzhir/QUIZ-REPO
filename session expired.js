// Check if user is logged in
  let lastActivityTime = Date.now();
  ["mousemove", "keydown", "click"].forEach(evt =>
    document.addEventListener(evt, () => lastActivityTime = Date.now())
  );

  setInterval(() => {
  const now = Date.now();
  if (now - lastActivityTime > 2 * 60 * 1000) { // 30 minutes
    localStorage.removeItem("sessionUser");
    const goLogin = confirm("Session expired. Logout due to this activity.");
    if (goLogin) {
      window.location.href = "../Front/Front.html"; // or your login page
    }
    // If Cancel, stay on the page (do nothing)
  }
}, 10000); // check every 10 secs

