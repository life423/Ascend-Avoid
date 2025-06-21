# Single Port Architecture Implementation

## Overview

This project now implements a **single port architecture** following production best practices. In production, everything runs on port 3000:
- ✅ Frontend (static files served by Express)
- ✅ Backend API (`/api/*` routes)
- ✅ WebSocket connections (Colyseus game server)

## Architecture Diagram

```
Production (Port 3000)
├── Express Server
│   ├── /api/* → Backend API routes
│   ├── /health → Health check endpoint
│   ├── /ws → WebSocket (Colyseus game server)
│   └── /* → Static frontend files (SPA routing)
│
Development (Two Ports)
├── Port 3000: Express + WebSocket server
└── Port 5173: Vite dev server (frontend)
```

## Key Features Implemented

### 1. **Smart WebSocket URL Detection**
The `MultiplayerManager` automatically detects the environment:

```typescript
// src/managers/MultiplayerManager.ts
private getWebSocketUrl(): string {
    const isProd = process.env.NODE_ENV === 'production' || 
                  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD);
    
    if (isProd) {
        // In production, use same origin as the page
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}`;
    } else {
        // In development, use localhost:3000
        return 'ws://localhost:3000';
    }
}
```

### 2. **SPA Routing Support**
The server handles client-side routing by serving `index.html` for all non-API routes:

```typescript
// server/index.ts
app.get('*', (req, res, next) => {
    // Skip API and WebSocket routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/ws') || 
        req.path.startsWith('/health')) {
        return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(staticPath, 'index.html'));
});
```

### 3. **Environment-Specific Behavior**

#### Production Mode
- Serves static files from `dist/` directory
- Single port (3000) for everything
- WebSocket connects to same origin
- No Colyseus monitor dashboard

#### Development Mode
- Two ports: 3000 (backend) + 5173 (frontend via Vite)
- WebSocket connects to localhost:3000
- Colyseus monitor available at `/colyseus`

## Usage Instructions

### Development Mode

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   This runs on http://localhost:3000

2. **Start the frontend (in another terminal):**
   ```bash
   npm run dev
   ```
   This runs on http://localhost:5173

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/status
   - Monitor: http://localhost:3000/colyseus

### Production Mode

1. **Build everything:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   # or
   NODE_ENV=production node server/dist/index.js
   ```

3. **Access everything on port 3000:**
   - Application: http://localhost:3000
   - API: http://localhost:3000/api/status
   - Health check: http://localhost:3000/health

## Benefits

✅ **Single Port Management** - Only one port to expose in production
✅ **No CORS Issues** - Frontend and backend share the same origin
✅ **Simple Deployment** - Standard Docker deployment with one exposed port
✅ **Better Performance** - No Vite dev server overhead in production
✅ **Standard Practice** - Follows industry best practices for production deployments

## Docker Deployment

The `Dockerfile` implements multi-stage builds:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
# ... build frontend and backend ...

# Production stage
FROM node:18-alpine
# ... copy built files ...
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/dist/index.js"]
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/status` | Server status |
| `WS /` | WebSocket connection for game |
| `GET /*` | Frontend SPA (production only) |

## File Structure

```
project/
├── dist/                    # Built frontend (production)
├── server/
│   ├── dist/               # Built backend (production)
│   └── index.ts            # Server with single port architecture
├── src/
│   ├── managers/
│   │   └── MultiplayerManager.ts  # Smart WebSocket connection
│   └── constants/
│       └── client-constants.ts    # Client configuration
└── package.json            # Build scripts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |

## Troubleshooting

### Common Issues

1. **WebSocket connection fails:**
   - Check that the server is running on port 3000
   - Verify `NODE_ENV` is set correctly for production

2. **Frontend not loading in production:**
   - Ensure `npm run build` was successful
   - Check that `dist/` folder exists with built files

3. **API routes not working:**
   - Verify routes are prefixed with `/api/`
   - Check server logs for errors

### Debug Commands

```bash
# Check if static files exist
ls -la dist/

# Check server build
ls -la server/dist/

# Test WebSocket connection
npm run test:websocket

# Check production server
NODE_ENV=production npm start
```

## Next Steps

The single port architecture is now complete and ready for production deployment. The system automatically handles:

- Environment detection
- WebSocket URL resolution
- Static file serving
- SPA routing
- API request routing

This provides a robust foundation for scaling the multiplayer game in production environments.
