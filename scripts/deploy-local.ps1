# Local deployment testing script

Write-Output "Building application..."
npm run build

Write-Output "Building Docker image..."
docker build -t ascend-avoid:latest .

Write-Output "Running Docker container locally for testing..."
docker run -d -p 3000:3000 --name ascend-avoid-test ascend-avoid:latest

Write-Output "Testing local container..."
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Output "Container is running successfully! Status code: $($response.StatusCode)"
} catch {
    Write-Error "Failed to connect to the container: $_"
    exit 1
}

Write-Output "Local deployment test complete. To clean up, run:"
Write-Output "docker stop ascend-avoid-test"
Write-Output "docker rm ascend-avoid-test"
