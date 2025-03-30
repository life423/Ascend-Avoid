# Docker Setup for Ascend Avoid

This directory contains Docker configurations for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Development Environment

To run the game in development mode with live reloading:

```bash
# From project root
docker-compose -f docker-compose.yml -f docker/docker-compose.dev.yml up --build
```

This will:
- Build the Docker image
- Mount your source code directories as volumes for live reloading
- Run both the game client and server in development mode
- Expose the server on port 3000 and client on port 8080

## Production Environment

To run the game in production mode:

```bash
# From project root
docker-compose -f docker-compose.yml -f docker/docker-compose.prod.yml up --build
```

For a production deployment using the pre-built image from GitHub Container Registry:

```bash
# Set environment variables for your deployment
export DOCKER_USERNAME=your-github-username
export TAG=latest

# Run in production mode
docker-compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## Environment Variables

- `PORT`: The port the server will listen on (default: 3000)
- `NODE_ENV`: The environment to run in (default: production)
- `DOCKER_REGISTRY`: Container registry (default: ghcr.io)
- `DOCKER_USERNAME`: Username for the container registry
- `TAG`: Image tag to use (default: latest)

## CI/CD Pipeline

This project includes a GitHub Actions workflow for continuous integration and deployment:

1. On each pull request to main, tests are run
2. When merged to main, the Docker image is built and pushed to GitHub Container Registry
3. The image is then deployed to the configured cloud provider

See `.github/workflows/ci-cd.yml` for details and customize the deployment step for your specific cloud provider.
