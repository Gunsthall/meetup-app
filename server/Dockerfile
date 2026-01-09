FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev deps for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Cloud Run sets PORT env var, default to 8080 for Cloud Run
# Port 3000 is used locally
EXPOSE 3000

# Start server
CMD ["npm", "start"]
