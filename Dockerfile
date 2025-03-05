# syntax=docker.io/docker/dockerfile:1

FROM node:23-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./

# Clear cache and install dependencies with exact versions
RUN corepack enable pnpm && \
  pnpm store prune && \
  pnpm install --frozen-lockfile

# COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .


# Set environment variables for development
ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["pnpm", "dev"]
