const signupForm = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    errorMsg.textContent = "Please fill all fields.";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      window.location.href = "login.html";
    } else {
      errorMsg.textContent = data.error;
    }

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Something went wrong. Try again.";
  }
});
