import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// --------------------
// Middleware to check user ID (for POST requests)
// --------------------
async function authenticate(req, res, next) {
  const { userId } = req.body;
  if (!userId) {
    console.warn("User not authenticated: missing userId in request body");
    return res.status(401).json({ error: "User not authenticated" });
  }
  req.userId = userId;
  next();
}

// --------------------
// Add Income
// --------------------
router.post('/income', authenticate, async (req, res) => {
  const { description, amount } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ error: "Invalid input: description and amount are required" });
  }

  try {
    const { data, error } = await supabase
      .from('incomes')
      .insert([{ user_id: req.userId, description, amount }])
      .select();

    if (error) throw error;

    res.status(200).json({ message: "Income added", income: data[0] });

  } catch (err) {
    console.error("Error adding income:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Add Expense
// --------------------
router.post('/expense', authenticate, async (req, res) => {
  const { description, amount, category, date } = req.body;
  if (!description || !amount || !category || !date) {
    return res.status(400).json({ error: "Invalid input: description, amount, category, and date are required" });
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ user_id: req.userId, description, amount, category, date }])
      .select();

    if (error) throw error;

    res.status(200).json({ message: "Expense added", expense: data[0] });

  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Get All Transactions for a User
// --------------------
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const { data: incomes, error: incErr } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (incErr || expErr) throw incErr || expErr;

    res.status(200).json({ incomes, expenses });

  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Delete Transaction (income or expense)
// --------------------
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
  }

  if (!id) {
    return res.status(400).json({ error: "Missing transaction ID" });
  }

  try {
    const table = type === 'income' ? 'incomes' : 'expenses';
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data.length) return res.status(404).json({ error: "Transaction not found" });

    res.status(200).json({ message: `${type} deleted`, transaction: data[0] });

  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Default 404 handler for unmatched routes
// --------------------
router.use((req, res) => {
  console.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found under /api/transactions" });
});

export default router;
