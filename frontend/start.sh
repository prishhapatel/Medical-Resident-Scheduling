#!/bin/bash
set -e

echo "Building Next.js application..."
npm run build

echo "Starting Next.js standalone server..."
cd .next/standalone
node server.js
