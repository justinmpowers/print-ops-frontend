/**
 * Production environment configuration.
 * This file is used during production build with `ng build --prod`.
 * The API URL should be set to your production API endpoint.
 */

// Resolve API URL from build-time env if available; in browser runtimes this will fall back to '/api'.
const apiUrl = (globalThis as any)?.process?.env?.API_URL || '/api';

export const environment = {
  production: true,
  apiUrl
};
