// --------------------
// User Authentication Check
// --------------------
document.addEventListener("DOMContentLoaded", async () => {
  const userEmail = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!userEmail || !username || !userId) {
    // redirect to login only if all required info is missing
    window.location.href = "login.html";
    return;
  }

  // Add header info
  const header = document.querySelector("header");
  const userInfo = document.createElement("p");
  userInfo.textContent = `Welcome, ${username} (${userEmail})`;
  userInfo.style.marginTop = "5px";
  userInfo.style.fontSize = "0.9rem";
  userInfo.style.color = "#555";
  header.appendChild(userInfo);

  // Add logout button after DOM is ready
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    });
  }

  // Fetch transactions
  await fetchTransactions(userId);
});


// --------------------
// Select Elements
// --------------------
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionList = document.getElementById("transactionList");

const incomeForm = document.getElementById("incomeForm");
const incomeDescInput = document.getElementById("incomeDesc");
const incomeAmountInput = document.getElementById("incomeAmount");

const expenseForm = document.getElementById("expenseForm");
const expenseDescInput = document.getElementById("expenseDesc");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseDateInput = document.getElementById("expenseDate");
const expenseCategoryInput = document.getElementById("expenseCategory");

// --------------------
// Store data
// --------------------
let incomes = [];
let expenses = [];

// --------------------
// Chart
// --------------------
let expenseChart;
function renderChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");

  const categories = {};
  expenses.forEach(exp => {
    categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#ff6384","#36a2eb","#ffcd56","#4bc0c0","#9966ff","#ff9f40"
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
        }
      }
    }
  });
}

// --------------------
// Fetch Transactions
// --------------------
async function fetchTransactions(userId) {
  try {
    const res = await fetch(`http://localhost:5000/api/transactions/${userId}`);
    const data = await res.json();
    if (res.ok) {
      incomes = data.incomes;
      expenses = data.expenses;
      updateUI();
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Error fetching transactions:", err);
  }
}

// --------------------
// Add Income
// --------------------
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = incomeDescInput.value.trim();
  const amount = Number(incomeAmountInput.value.trim());
  const userId = localStorage.getItem("userId");

  if (!description || isNaN(amount) || amount <= 0) {
    alert("Enter valid income details");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/transactions/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, description, amount })
    });

    const data = await res.json();
    if (res.ok) {
      incomes.unshift(data.income); // add to local array
      updateUI();
      incomeDescInput.value = "";
      incomeAmountInput.value = "";
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error adding income.");
  }
});

// --------------------
// Add Expense
// --------------------
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = expenseDescInput.value.trim();
  const amount = Number(expenseAmountInput.value.trim());
  const date = expenseDateInput.value;
  const category = expenseCategoryInput.value;
  const userId = localStorage.getItem("userId");

  if (!description || isNaN(amount) || amount <= 0 || !date || !category) {
    alert("Enter valid expense details");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/transactions/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, description, amount, category, date })
    });

    const data = await res.json();
    if (res.ok) {
      expenses.unshift(data.expense); // add to local array
      updateUI();
      expenseDescInput.value = "";
      expenseAmountInput.value = "";
      expenseDateInput.value = "";
      expenseCategoryInput.value = "";
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error adding expense.");
  }
});

// --------------------
// Delete Transaction
// --------------------
async function deleteTransaction(id, type) {
  try {
    const res = await fetch(`http://localhost:5000/api/transactions/${type}/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (res.ok) {
      console.log(data.message);
      // Remove from local array and update UI
      if (type === 'income') incomes = incomes.filter(i => i.id !== id);
      else expenses = expenses.filter(e => e.id !== id);
      updateUI();
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Error deleting transaction:", err);
  }
}

window.deleteTransaction = deleteTransaction;

// --------------------
// Update UI
// --------------------
function updateUI() {
  transactionList.innerHTML = "";

  let totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  let totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  let balance = totalIncome - totalExpense;

  balanceEl.textContent = `₹${balance}`;
  incomeEl.textContent = `₹${totalIncome}`;
  expenseEl.textContent = `₹${totalExpense}`;

  // Income List
  incomes.forEach((inc) => {
    const li = document.createElement("li");
    li.classList.add("income");
    li.innerHTML = `
      ${inc.description} <span>+₹${inc.amount}</span>
      <button class="delete-btn" data-id="${inc.id}" data-type="income">X</button>
    `;
    transactionList.appendChild(li);
  });

  // Expense List
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.classList.add("expense");
    li.innerHTML = `
      ${exp.description} (${exp.category}) <span>-₹${exp.amount}</span>
      <button class="delete-btn" data-id="${exp.id}" data-type="expense">X</button>
    `;
    transactionList.appendChild(li);
  });

  renderChart();
}

// --------------------
// Event delegation for delete buttons
// --------------------
transactionList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = Number(e.target.dataset.id);
    const type = e.target.dataset.type;
    deleteTransaction(id, type);
  }
});
