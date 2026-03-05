# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ vars are baked at build time — must be provided as build args
ARG NEXT_PUBLIC_SHEETS_API_KEY
ARG NEXT_PUBLIC_SHEET_ID
ARG NEXT_PUBLIC_ADMIN_PASSWORD
ENV NEXT_PUBLIC_SHEETS_API_KEY=$NEXT_PUBLIC_SHEETS_API_KEY
ENV NEXT_PUBLIC_SHEET_ID=$NEXT_PUBLIC_SHEET_ID
ENV NEXT_PUBLIC_ADMIN_PASSWORD=$NEXT_PUBLIC_ADMIN_PASSWORD

RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
