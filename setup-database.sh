#!/bin/bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database migrations
npx prisma migrate dev --name init

# Seed the database (optional)
npx prisma db seed
