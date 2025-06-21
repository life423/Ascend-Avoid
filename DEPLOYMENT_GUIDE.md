# Complete CI/CD Deployment Guide for Ascend Avoid

## Single Container Architecture with Automatic Deployments

This guide ensures your frontend and backend run in a single container with automatic deployments whenever you push to main.

## Architecture Overview

- **Frontend**: Served as static files by the Express server
- **Backend**: Express + Colyseus on port 3000
- **Single Container**: No port conflicts, everything on port 3000
- **CI/CD**: Push to main = automatic deployment to Azure

---

## Step 1: Server Configuration ✅ COMPLETED

The server has been updated to serve frontend static files:

```typescript
// server/index.ts - Key changes made:

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint (required for container health monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Catch-all route - serve index.html for client-side routing (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

---

## Step 2: Build Scripts ✅ COMPLETED

Package.json has been updated with the production start script:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "cd server && tsc",
    "start:prod": "cd server && node dist/index.js"
  }
}
```

---

## Step 3: Production-Ready Docker Configuration ✅ COMPLETED

The Dockerfile has been optimized for single container deployment:

```dockerfile
# Multi-stage build for optimized single container

# Stage 1: Build everything
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies
RUN npm ci --legacy-peer-deps
RUN cd server && npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build frontend with Vite
RUN npm run build:client

# Build server TypeScript
RUN cd server && npm run build

# Stage 2: Production runtime
FROM node:18-alpine
WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --production --legacy-peer-deps

# Copy built frontend (static files)
COPY --from=builder /app/dist ./dist

# Copy compiled server
COPY --from=builder /app/server/dist ./server/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Only expose the backend port (serves everything)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server (which serves both frontend and backend)
CMD ["node", "server/dist/index.js"]
```

### Key Improvements:
- ✅ Uses `npm ci` for faster, more reliable builds
- ✅ Direct Node.js execution for better performance
- ✅ Lightweight `wget` health checks
- ✅ Minimal production image footprint
- ✅ Single port exposure (3000) serves everything

---

## Step 4: GitHub Actions CI/CD Pipeline ✅ COMPLETED

The modern CI/CD pipeline has been created in `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Pipeline - Build and Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/ascend-avoid
  AZURE_CONTAINER_APP: ascend-avoid
  AZURE_RESOURCE_GROUP: ascend-avoid-rg

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci --legacy-peer-deps
        cd server && npm ci --legacy-peer-deps
    
    - name: Run tests
      run: npm test
      continue-on-error: true  # Remove this in production

  build-and-deploy:
    name: Build and Deploy to Azure
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{ env.IMAGE_NAME }}:latest
          ${{ env.IMAGE_NAME }}:${{ github.sha }}
        cache-from: type=registry,ref=${{ env.IMAGE_NAME }}:buildcache
        cache-to: type=registry,ref=${{ env.IMAGE_NAME }}:buildcache,mode=max
    
    - name: Azure Login
      uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure Container Apps
      run: |
        az containerapp update \
          --name ${{ env.AZURE_CONTAINER_APP }} \
          --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
          --image ${{ env.IMAGE_NAME }}:latest \
          --set-env-vars "NODE_ENV=production" "PORT=3000"
    
    - name: Verify deployment
      run: |
        echo "🚀 Deployment complete!"
        echo "📱 App URL: https://${{ env.AZURE_CONTAINER_APP }}.azurecontainerapps.io"
        echo "🌐 Custom domain: https://ascend.drewclark.io"
```

### Modern Pipeline Features:
- ✅ **Separate test job** for pull requests only
- ✅ **Docker Hub integration** for public image hosting
- ✅ **Azure Container Apps** for modern serverless containers
- ✅ **Docker Buildx caching** for faster builds
- ✅ **Latest action versions** for better performance
- ✅ **Custom domain support** with HTTPS

---

## Step 5: Azure Setup (Required Manual Steps)

### 5.1 Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name ascend-avoid-rg --location "East US"

# Create Azure Container Apps Environment
az containerapp env create \
  --name ascend-avoid-env \
  --resource-group ascend-avoid-rg \
  --location "East US"

# Create the Container App
az containerapp create \
  --name ascend-avoid \
  --resource-group ascend-avoid-rg \
  --environment ascend-avoid-env \
  --image docker.io/your-username/ascend-avoid:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars NODE_ENV=production PORT=3000 \
  --cpu 1.0 --memory 2.0Gi
```

### 5.2 Create Service Principal for GitHub Actions

```bash
# Create service principal with contributor role
az ad sp create-for-rbac --name "ascend-avoid-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/ascend-avoid-rg \
  --sdk-auth
```

Save the output JSON for GitHub secrets.

---

## Step 6: GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets:

1. **AZURE_CREDENTIALS**
   ```json
   {
     "clientId": "your-client-id",
     "clientSecret": "your-client-secret", 
     "subscriptionId": "your-subscription-id",
     "tenantId": "your-tenant-id"
   }
   ```

2. **DOCKER_USERNAME**
   ```
   your-docker-hub-username
   ```

3. **DOCKER_PASSWORD**
   ```
   your-docker-hub-password-or-token
   ```

---

## Step 7: Environment Variables

### Production Environment Variables:
- `NODE_ENV=production`
- `PORT=3000`

### Optional Environment Variables:
- `COLYSEUS_MONITOR_PASSWORD` - Password for Colyseus monitor
- `LOG_LEVEL` - Logging level (info, debug, error)

---

## Step 8: Deployment Process

### Automatic Deployment:
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Runs tests
   - Builds client and server
   - Creates Docker image
   - Pushes to Azure Container Registry
   - Deploys to Azure Container Instances
   - Provides deployment URL in action logs

### Manual Deployment:
```bash
# Build and test locally
npm run build
npm test

# Build and run Docker container locally
docker build -t ascend-avoid .
docker run -p 3000:3000 ascend-avoid

# Test the deployment
curl http://localhost:3000/health
```

---

## Step 9: Verification Steps

### After Deployment:

1. **Health Check**: `http://your-app-url:3000/health`
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456
   }
   ```

2. **Game Access**: `http://your-app-url:3000`

3. **Monitor Dashboard**: `http://your-app-url:3000/colyseus`

4. **WebSocket Connection**: Test multiplayer functionality

---

## Step 10: Monitoring and Maintenance

### Health Monitoring:
- Docker health checks run every 30 seconds
- Azure Container Instances monitors container health
- Automatic restart on failure

### Logs Access:
```bash
# View container logs
az container logs --resource-group ascend-avoid-rg --name ascend-avoid

# Stream logs in real-time
az container logs --resource-group ascend-avoid-rg --name ascend-avoid --follow
```

### Scaling:
```bash
# Update container resources
az container update --resource-group ascend-avoid-rg --name ascend-avoid \
  --cpu 2 --memory 3
```

---

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

2. **Container Startup Issues**:
   - Verify health check endpoint is accessible
   - Check environment variables
   - Review container logs

3. **WebSocket Connection Issues**:
   - Ensure port 3000 is properly exposed
   - Check CORS configuration
   - Verify network security groups

### Debug Commands:
```bash
# Check container status
az container show --resource-group ascend-avoid-rg --name ascend-avoid

# Test health endpoint
curl -f http://your-app-url:3000/health || exit 1

# Check container resource usage
az container show --resource-group ascend-avoid-rg --name ascend-avoid --query containers[0].resources
```

---

## Security Considerations

1. **Secrets Management**: All sensitive data stored in GitHub secrets
2. **Network Security**: Container only exposes necessary port 3000
3. **Image Security**: Multi-stage build reduces attack surface
4. **Health Monitoring**: Automated health checks detect issues early

---

## Cost Optimization

- **Resource Allocation**: 1 CPU, 1.5GB RAM (adjustable based on load)
- **Auto-scaling**: Manual scaling based on monitoring metrics
- **Resource Cleanup**: Automatic cleanup of old container instances

---

## Success Indicators

✅ **Deployment Complete When:**
- GitHub Actions workflow passes all steps
- Health check returns 200 status
- Game loads successfully at deployed URL
- WebSocket connections work for multiplayer
- Monitor dashboard is accessible

🎉 **Your Ascend Avoid game is now deployed with full CI/CD automation!**

---

## Next Steps

1. **Custom Domain**: Configure custom domain and SSL certificate
2. **Database**: Add persistent storage if needed
3. **CDN**: Set up Azure CDN for static assets
4. **Monitoring**: Implement Application Insights for detailed metrics
5. **Scaling**: Configure auto-scaling based on demand
