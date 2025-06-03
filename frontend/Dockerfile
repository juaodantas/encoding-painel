# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package*.json ./

# Install dependencies only
RUN npm ci

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=development

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"] 