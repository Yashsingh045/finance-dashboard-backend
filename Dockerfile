# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy deps and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps for compilation)
RUN npm ci

# Copy source and config
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
