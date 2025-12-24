# Multi-stage build for Angular frontend
# Version: 2.0.0
FROM node:22-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with clean install (faster and reproducible)
RUN npm ci --legacy-peer-deps

# Copy application source
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Production stage - use nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/j3d-frontend/browser /usr/share/nginx/html

# Create necessary directories and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4200/health || exit 1

# Expose port
EXPOSE 4200

# Start nginx (runs as nginx user by default with our config)
CMD ["nginx", "-g", "daemon off;"]