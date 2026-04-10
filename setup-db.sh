#!/bin/bash
# InvoiceFlow — Database Setup Script
# Run this AFTER starting Docker Desktop

set -e

DOCKER_BIN="/Applications/Docker.app/Contents/Resources/bin/docker"
NODE_BIN="/usr/local/bin"

echo "🐳 Starting PostgreSQL via Docker..."
export PATH="$NODE_BIN:$DOCKER_BIN/..:$PATH"
"$DOCKER_BIN" compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "📦 Running Prisma migrations..."
export PATH="$NODE_BIN:$PATH"
npx prisma migrate dev --name init

echo "✅ Database ready! Run: npm run dev"
