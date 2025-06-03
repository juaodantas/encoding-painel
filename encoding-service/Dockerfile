# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install dependencies only
RUN npm ci

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3002

# Expose the port
EXPOSE 3002

# Start the application
CMD ["node", "dist/main.js"] 