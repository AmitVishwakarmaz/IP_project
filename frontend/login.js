const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Please enter both email and password.";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("username", data.user.user_metadata?.username || "User");
      localStorage.setItem("userId", data.user.id);
      window.location.href = "index.html";
    } else {
      if (data.error === "User not found") {
        alert("No account found. Please create an account first.");
        window.location.href = "signup.html";
      } else if (data.error === "Incorrect password") {
        errorMsg.textContent = "Incorrect password. Try again.";
      } else {
        errorMsg.textContent = data.error;
      }
    }

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Something went wrong. Please try again.";
  }
});
