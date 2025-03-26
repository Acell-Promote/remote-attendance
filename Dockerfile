# syntax=docker.io/docker/dockerfile:1

FROM node:23-alpine

WORKDIR /app

# Copy package files and prisma schema first
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Clear cache and install dependencies with exact versions
RUN corepack enable pnpm && \
  pnpm install --frozen-lockfile

# Copy remaining application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set environment variables for development
ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

# Clean any previous builds
RUN rm -rf .next

# The seed script will be run when the container starts
CMD ["sh", "-c", "npx prisma db push && npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/seed.ts && pnpm dev"]
