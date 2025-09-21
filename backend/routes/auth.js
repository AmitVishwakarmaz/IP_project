import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// --------------------
// Signup Route
// --------------------
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }  // store username in user_metadata
      }
    });

    if (error) throw error;

    return res.status(200).json({
      message: 'Signup successful! You can now login.',
      user: data.user
    });

  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(400).json({ error: err.message });
  }
});

// --------------------
// Login Route
// --------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Provide email and password' });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes("User not found")) return res.status(404).json({ error: "User not found" });
      if (error.message.includes("Invalid login credentials")) return res.status(401).json({ error: "Incorrect password" });
      throw error;
    }

    return res.status(200).json({
      message: 'Login successful!',
      user: data.user  // contains user_metadata.username if provided
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;
