/**
 * Production environment configuration.
 * This file is used during production build with `ng build --prod`.
 * The API URL should be set to your production API endpoint.
 */

export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || '/api'  // Uses API_URL env var, defaults to /api
};
