# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Salla Express Starter Kit** — an Express.js application template for building apps that integrate with the [Salla e-commerce platform](https://salla.dev/). It handles OAuth 2.0 authentication, webhook processing, and Salla API calls.

## Commands

```bash
# Development (auto-reload via nodemon)
npm run dev

# Run via Salla CLI
npm run serve

# Start manually (optional port argument, defaults to 8082)
node app.js [port]
```

No build or lint steps are configured. There are no tests.

### Salla CLI Commands

```bash
# Install CLI globally
npm install @salla.sa/cli -g

# Create new app
salla app create

# Add a new webhook action handler
salla app create-webhook <event.name>
```

## Architecture

### Entry Point: `app.js`

All routing, middleware, and initialization lives in `app.js`. Key responsibilities:
1. Initializes `SallaAPIFactory` (Passport.js OAuth strategy) with credentials from `.env`
2. Registers `SallaWebhook` listeners for specific events (`app.installed`, `app.store.authorize`, `all`)
3. Wires up Express middleware: sessions, Passport, body-parser, Nunjucks templates
4. Defines all routes

### Authentication Flow

Two modes configured via `SALLA_AUTHORIZATION_MODE` in `.env`:
- **Easy Mode** (default): Salla generates and pushes the access token via the `app.store.authorize` webhook event
- **Custom Mode**: OAuth redirect flow via `/login` → `/oauth/redirect` → `/oauth/callback`

`SallaAPI.onAuth()` callback fires on successful auth and persists user + OAuth tokens to the database.

### Webhook System

`POST /webhook` receives all Salla platform events. `SallaWebhook.checkActions()` validates the signature (using `SALLA_WEBHOOK_SECRET`) and dispatches to registered listeners.

Action handler files live in `Actions/<category>/` (e.g., `Actions/order/created.js`, `Actions/product/updated.js`). There are ~50 pre-built handlers covering orders, products, customers, shipping, stores, brands, categories, coupons, and more.

### Database Abstraction: `database/index.js`

`SallaDatabase` is a factory that wraps three ORM backends, selected by `SALLA_DATABASE_ORM` in `.env`:
- **`Sequelize`** (default) — MySQL
- **`Mongoose`** — MongoDB
- **`TypeORM`** — PostgreSQL/SQL

ORM implementations are in `helpers/ORMs/<ORM>/`. The `SallaDatabase` class exposes `connect()`, `retrieveUser()`, `saveUser()`, and `saveOauth()` — all with ORM-specific branches inside.

Core DB models: `User`, `OauthTokens`, `PasswordResets`. Sequelize migrations and seeders are in `helpers/ORMs/Sequelize/migrations/` and `seeders/`.

### Views

Nunjucks (`.html`) templates in `views/`. The `layout.html` is the master template with Bootstrap.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
SALLA_OAUTH_CLIENT_ID=       # From Salla Partner Portal
SALLA_OAUTH_CLIENT_SECRET=   # From Salla Partner Portal
SALLA_WEBHOOK_SECRET=        # From Salla Partner Portal
SALLA_OAUTH_CLIENT_REDIRECT_URI=http://localhost:8081/oauth/callback
SALLA_AUTHORIZATION_MODE=easy   # or "custom"
SALLA_APP_ID=

DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_SERVER=localhost
DATABASE_NAME=
SALLA_DATABASE_ORM=Sequelize  # or Mongoose, TypeORM
```

## PR / Branch Conventions

The GitHub Actions workflow (`.github/workflows/lint-pr.yaml`) validates PR titles and branch names via Salla CI linter on every pull request.
