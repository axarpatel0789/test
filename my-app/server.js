const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const ERROR_FILE = path.join(__dirname, '..', 'src', 'assets', 'errors.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper to read errors from JSON file
function readErrors() {
  try {
    const data = fs.readFileSync(ERROR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { errors: [], lastUpdated: null, totalErrors: 0 };
  }
}

// Helper to write errors to JSON file
function writeErrors(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    data.totalErrors = data.errors.length;
    fs.writeFileSync(ERROR_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing to errors.json:', e);
    return false;
  }
}

// GET /api/errors - Get all errors
app.get('/api/errors', (req, res) => {
  try {
    const data = readErrors();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read errors' });
  }
});

// POST /api/errors - Save a single error
app.post('/api/errors', (req, res) => {
  try {
    const error = req.body;
    if (!error) {
      return res.status(400).json({ error: 'No error data provided' });
    }

    const data = readErrors();
    data.errors.push(error);
    
    // Keep only last 100 errors to prevent file from growing too large
    if (data.errors.length > 100) {
      data.errors = data.errors.slice(-100);
    }

    writeErrors(data);
    res.json({ success: true, message: 'Error saved' });
  } catch (e) {
    console.error('Error saving error:', e);
    res.status(500).json({ error: 'Failed to save error' });
  }
});

// POST /api/errors/batch - Save multiple errors
app.post('/api/errors/batch', (req, res) => {
  try {
    const { errors } = req.body;
    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ error: 'Invalid errors data' });
    }

    const data = readErrors();
    data.errors.push(...errors);
    
    // Keep only last 100 errors
    if (data.errors.length > 100) {
      data.errors = data.errors.slice(-100);
    }

    writeErrors(data);
    res.json({ success: true, message: `${errors.length} errors saved` });
  } catch (e) {
    console.error('Error saving errors:', e);
    res.status(500).json({ error: 'Failed to save errors' });
  }
});

// DELETE /api/errors - Clear all errors
app.delete('/api/errors', (req, res) => {
  try {
    writeErrors({ errors: [], lastUpdated: null, totalErrors: 0 });
    res.json({ success: true, message: 'All errors cleared' });
  } catch (e) {
    console.error('Error clearing errors:', e);
    res.status(500).json({ error: 'Failed to clear errors' });
  }
});


// Fallback to Angular
// Serve static files from Angular dist (support multiple build output layouts)
const possibleIndexPaths = [
  path.join(__dirname, '..', 'dist', 'my-app', 'browser', 'index.html'),
  path.join(__dirname, '..', 'dist', 'my-app', 'index.html'),
];

const foundIndex = possibleIndexPaths.find((p) => fs.existsSync(p));

if (foundIndex) {
  const staticRoot = path.dirname(foundIndex);
  app.use(express.static(staticRoot));
  // Fallback to Angular index
  app.get('*', (req, res) => {
    res.sendFile(foundIndex);
  });
} else {
  // If no built app is present, return a helpful message
  app.get('*', (req, res) => {
    res.status(404).send('Angular build not found. Run `npm run build` in the project root to generate the production files.');
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Error logging server running on http://localhost:${PORT}`);
  console.log(`Errors file: ${ERROR_FILE}`);
});
