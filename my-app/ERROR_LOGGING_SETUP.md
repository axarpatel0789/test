# Error Logging System Setup

## Overview
This Angular application has a complete error logging system that captures both API and frontend errors and persists them to a JSON file.

## Files
- `src/assets/errors.json` - Error storage file
- `src/app/core/services/logging.service.ts` - Error capturing service
- `src/app/core/services/error-storage.service.ts` - Error persistence service
- `server.js` - Node.js backend API server
- `src/app/features/user-list/user-list.ts` - Component with error testing

## Installation

```bash
cd my-app
npm install
```

## Running the Application

### Option 1: Development Mode (with Backend)
Run both Angular dev server and Node.js backend:

```bash
npm run dev
```

This will:
- Start Angular dev server at `http://localhost:4200`
- Start Node.js backend at `http://localhost:3000`
- Errors will persist to `src/assets/errors.json`

### Option 2: Angular Only (Frontend Dev)
```bash
npm start
```

### Option 3: Production Build + Backend
```bash
npm run build
npm run server
```
Then visit `http://localhost:3000`

## How Error Logging Works

### 1. Error Detection
Errors are captured from:
- **API Calls** - Via HTTP interceptor
- **Frontend Code** - Via Global Error Handler
- **Unhandled Promises** - Via promise rejection listener

### 2. Error Processing
Each error:
- Gets deduplicated (same error won't log twice)
- Is rate-limited (max 1 per second)
- Gets serialized with context (timestamp, source, message, stack)
- Is stored in **memory**
- Is persisted to **localStorage**
- Is sent to backend for **JSON file storage**

### 3. Error Display
View errors in the app at the "Error Logs" section showing:
- Error count
- Last updated timestamp
- Detailed error information
- Stack traces when available

### 4. Error Export
- **Download as JSON** - Export all errors to a downloadable file
- **View in File** - Check `src/assets/errors.json` directly
- **API Access** - GET `/api/errors` to fetch all stored errors

## Testing Errors

Click the buttons in the User List component:

**API Errors:**
- "Trigger API Error" - Simulates failed HTTP request

**Frontend Errors:**
- "Trigger Null Reference Error" - TypeError: accessing property of null
- "Trigger Array Error" - TypeError: undefined array operation
- "Trigger Logic Error" - Manually thrown application error

**Utilities:**
- "Refresh Error Logs" - Reload errors from storage
- "Download Errors as JSON" - Export errors as file
- "Clear Error Logs" - Delete all stored errors

## API Endpoints

### GET /api/errors
Get all stored errors
```bash
curl http://localhost:3000/api/errors
```

### POST /api/errors
Save a single error
```bash
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{"level":"error","source":"http","message":"Test error"}'
```

### DELETE /api/errors
Clear all errors
```bash
curl -X DELETE http://localhost:3000/api/errors
```

## Error JSON Format

```json
{
  "errors": [
    {
      "level": "error",
      "source": "http",
      "message": "API Error: Failed to load users",
      "error": {
        "name": "Error",
        "message": "...",
        "stack": "..."
      },
      "request": {
        "url": "/assets/users.json",
        "method": "GET"
      },
      "time": "2026-01-31T12:00:00.000Z"
    }
  ],
  "lastUpdated": "2026-01-31T12:00:00.000Z",
  "totalErrors": 1
}
```

## Features

✅ Real-time error capture
✅ Automatic deduplication
✅ Rate limiting (prevents spam)
✅ Persistent storage (JSON file)
✅ localStorage backup
✅ Error statistics
✅ Download/export functionality
✅ Error dashboard UI
✅ API endpoints for integration
✅ Performance optimized (removed console wrapping)

## Troubleshooting

**Errors not appearing in JSON file:**
1. Ensure backend is running: `npm run server`
2. Check that POST requests to `/api/errors` succeed
3. Verify `src/assets/errors.json` exists and is writable
4. Check browser console for any error messages

**Backend not starting:**
1. Run `npm install` to ensure `express` and `cors` are installed
2. Check if port 3000 is available
3. Run `npm run server` in the `my-app` directory

**Errors not showing in UI:**
1. Check browser console for errors
2. Verify ErrorStorageService is injected in components
3. Ensure localStorage is enabled in browser
4. Try clicking "Refresh Error Logs" button
