# syntax=docker.io/docker/dockerfile:1

FROM node:23-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i

# COPY src ./src
COPY public ./public
COPY next.config.ts .
COPY tsconfig.json .


# Set environment variables for development
ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000
