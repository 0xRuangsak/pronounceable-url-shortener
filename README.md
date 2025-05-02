# Pronounceable URL Shortener

A modern URL shortening service that creates memorable, pronounceable short links that expire after 24 hours.

## Project Overview

This application allows users to create short, memorable URLs that are easy to share and pronounce. Unlike traditional URL shorteners that generate random alphanumeric strings, this service creates short links using pronounceable words, making them easier to remember and communicate verbally.

## Features

- **Pronounceable URLs**: Short codes are generated using real words that are easy to remember and pronounce
- **Automatic Expiration**: All links automatically expire after 24 hours for privacy and security
- **No Registration Required**: Create shortened URLs instantly with no account needed
- **Modern Tech Stack**: Built with TypeScript, React, Next.js, and Express
- **Monorepo Architecture**: Uses Turborepo for a clean, maintainable codebase

## Tech Stack

### Frontend
- Next.js 15.3.1
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- Redis (for storage with TTL)

### Project Structure
- Monorepo using Turborepo
- Packages for reusable components

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pronounceable-url-shortener.git
   cd pronounceable-url-shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project

You can run the project using our development script which starts all services:

```bash
./start-dev.sh
```

This will start:
- Redis using Docker
- Backend API on port 3001
- Frontend on port 3000

Alternatively, you can run each service individually:

1. Start Redis:
   ```bash
   # Using Homebrew
   brew services start redis
   
   # Or using Docker
   docker run --name url-shortener-redis -p 6379:6379 -d redis:7.2-alpine
   ```

2. Start the API server:
   ```bash
   cd apps/api
   npm run dev
   ```

3. Start the web server:
   ```bash
   cd apps/web
   npm run dev
   ```

## How It Works

1. The user enters a URL to shorten
2. The backend generates a pronounceable shortcode using the BIP39 wordlist
3. The original URL and shortcode are stored in Redis with a 24-hour TTL
4. When a user visits the short URL, they are redirected to the original URL

## Project Structure

```
/
├── apps/
│   ├── api/            # Express.js backend
│   └── web/            # Next.js frontend
├── packages/
│   ├── shortener/      # URL shortening algorithm
│   └── storage/        # Storage abstraction (Redis implementation)
├── docker/             # Docker configuration
└── start-dev.sh        # Development startup script
```

## Development

### Git Workflow

We follow a branch-based development workflow:
1. Create a feature branch from `develop`
2. Make changes and commit with descriptive messages
3. Create a PR to merge back into `develop`
4. Merge to `main` for releases

### Commit Style

We use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance tasks
- `docs:` for documentation changes

## License

[MIT](LICENSE)