# Cashew - Financial Advisory Platform

Cashew is a web-facing financial advisory platform designed to deliver clarity and control to small business owners, CPAs, and franchise owners without the overwhelming financial jargon.

## Transition from Prototype to MVP

This repository has transitioned from a basic prototype to a structured MVP scaffold, featuring:

- **Multi-Tenant Architecture**: Support for SBO, CPA, and Franchise Owner roles.
- **Backend Infrastructure**: A Flask-based API with placeholders for QuickBooks and Wave Accounting integrations.
- **Advanced Data Logic**: Industry-specific benchmarking using NAICS codes to provide actionable recommendations.
- **Interactive Dashboards**: Role-specific views built with React and Next.js.
  - **SBO**: Cash Flow Forecasting and Health Scoring.
  - **CPA**: Identifying advisory opportunities and service gaps.
  - **Franchise**: Multi-location performance mapping and benchmarking.

## Core Goal

Our mission is to empower business owners with the data they need to make informed decisions, transforming complex financial data into simple, visual, and actionable insights.

## Project Structure

- `backend/`: Flask application containing API routes, authentication logic, and service integrations.
- `backend/app/logic/`: Core business logic for benchmarking and recommendations.
- `app/`: Next.js frontend with role-specific dashboard components.

### Sample Data Mode
The platform includes a specialized **Sample Data Mode** to demonstrate the engine's capabilities without requiring live API keys. It features:
- **Dynamic Entity Selection**: Switch between Artisan Bakeries, Tech Solutions, and Main Street Boutiques.
- **Growth Visualization**: Comparative bar charts showing year-over-year performance across 7+ key metrics.
- **Debug Overlay**: Built-in system diagnostic tool to verify backend connectivity and data hydration.

## Getting Started

### Backend
1. Navigate to `backend/`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run the server: `python run.py`.

### Frontend
1. Install dependencies: `npm install`.
2. Run the development server: `npm run dev`.

**Troubleshooting Workspace Root Warning:**
If you see a warning about "inferred workspace root" and multiple lockfiles, it's because Next.js is detecting other `package-lock.json` files in parent directories (e.g., in `OneDrive` or `Documents`). To fix this:
- Ensure you are running `npm` commands from the `draft2026` directory.
- You can safely ignore this warning if the app loads, or follow the link in the warning to set a fixed root in `next.config.mjs`.
