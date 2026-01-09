FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Cloud Run sets PORT env var, default to 8080 for Cloud Run
# Port 3000 is used locally
EXPOSE 3000

# Start server
CMD ["npm", "start"]
