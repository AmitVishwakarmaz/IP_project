// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import authRoutes from './api/auth.js';
// import transactionRoutes from './api/transactions.js';

// const app = express();
// const PORT = 5000;

// // For __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Serve frontend files
// const frontendPath = path.join(__dirname, '../frontend');
// app.use(express.static(frontendPath));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/transactions', transactionRoutes);

// // Fallback route: serve login.html for unmatched routes
// app.use((req, res) => {
//   res.sendFile(path.join(frontendPath, 'login.html'));
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port http://localhost:${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 5000;

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend files (make sure path is correct)
const frontendPath = path.join(__dirname, '../frontend'); // backend/frontend
app.use(express.static(frontendPath));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
