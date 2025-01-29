# Build stage
FROM node:12.13.0-buster as builder

# Set working directory
WORKDIR /app

# Increase Node memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy node_modules and package files
COPY node_modules.7z package*.json ./
RUN apt-get update && apt-get install -y p7zip-full \
    && 7z x node_modules.7z \
    && rm node_modules.7z

# Copy source
COPY . .

# Start server
CMD ["npm", "run", "dev"]