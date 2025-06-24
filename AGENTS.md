# Agent Guidelines for `job-portal` Backend

This document provides guidelines for AI agents working on the `job-portal` backend codebase.

## TypeORM Configuration (`src/config.service.ts`)

### 1. Database Connection Pool Size
- The `poolSize` in the `extra` configuration for TypeORM has been a source of high resource utilization.
- It was previously set to `10000`, which is excessively high for most MySQL setups and can lead to server crashes.
- It has been adjusted to `25`.
- **Guideline:** When modifying database configurations, ensure the `poolSize` is appropriate for the expected load and database server capacity. Avoid extremely large values. Consult with a human developer if unsure, or start with conservative values (e.g., 10-50) and monitor performance.

### 2. Entity Loading
- The TypeORM configuration previously used `autoLoadEntities: true` and a glob pattern `entities: [__dirname + '/**/*.entity{.ts,.js}']` for loading entities.
- This has been changed to `autoLoadEntities: false` and an explicit list of entity paths.
- **Guideline:** For production builds and optimal performance, always prefer explicitly listing entities over `autoLoadEntities: true` or glob patterns. This avoids unnecessary filesystem scanning during application startup.
- When adding a new entity:
    1. Ensure the entity file is correctly placed (e.g., `src/module-name/entities/new-entity.entity.ts`).
    2. Manually add the path to this new entity in the `entities` array within `src/config.service.ts`. The path should be relative to `src/config.service.ts`, e.g., `__dirname + '/../module-name/entities/new-entity.entity{.ts,.js}'`.

## External Service Integrations (e.g., LinkedIn Scheduler)

### 1. Access Tokens and Credentials
- The LinkedIn scheduler (`src/linkedIn/linkedin.service.ts`) previously contained a hardcoded placeholder for an access token (`'YOUR_ACCESS_TOKEN'`).
- **Guideline:** Never commit hardcoded secrets, API keys, or access tokens directly into the codebase.
    - Use environment variables (e.g., via `.env` files and `@nestjs/config`) to manage such sensitive information.
    - The LinkedIn job posting feature has been temporarily disabled by commenting out the API call due to the missing valid token. If re-enabling, ensure the token is sourced from a secure configuration.

### 2. Scheduled Tasks
- Be mindful of the frequency and resource intensity of scheduled tasks (cron jobs).
- The LinkedIn scheduler runs hourly. If it were making failing API calls, this would generate consistent errors and logs.
- **Guideline:** Ensure scheduled tasks have proper error handling and do not run excessively if they are known to be failing or are not fully configured. Consider disabling such tasks until they are production-ready.

## Logging (`src/middleware/logger.middleware.ts`)

### 1. Logging Sensitive or Large Data
- The error logging in `LoggerMiddleware` previously logged the entire response body for all errors.
- This has been modified to avoid logging the full response body in production environments to prevent potential performance issues with large response bodies.
- **Guideline:** Be cautious when logging potentially large or sensitive data, especially in production.
    - For request/response bodies, consider logging only essential headers, truncating large bodies, or omitting them entirely in production unless specifically required for debugging critical issues.
    - Ensure that logs do not inadvertently expose sensitive user data.

## General
- Always test changes related to database connections, entity loading, and external API calls thoroughly, especially under load, if possible.
- Monitor application resource utilization (CPU, memory) after deployments that include changes to these areas.output_content_without_code_block
File `AGENTS.md` created successfully.
