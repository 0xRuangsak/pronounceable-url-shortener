# Pronounceable URL Shortener

A modern URL shortening service that creates pronounceable short links for easier sharing and memorability. The service stores links for 24 hours before automatic expiration.

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: Redis (with TTL functionality for 24-hour expiration)
- **Project Structure**: Turborepo monorepo architecture

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development servers: `npm run dev`

## Structure

- `apps/web`: Next.js frontend
- `apps/api`: Express.js backend API
- `packages/common`: Shared utilities and types
- `packages/shortener`: URL shortening algorithm

## Features

- Generation of pronounceable, user-friendly short URLs
- Redirection from short URLs to original destinations
- Automatic link expiration after 24 hours
- Simple, intuitive user interface