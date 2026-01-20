/**
 * Production environment configuration.
 * This file is used during production build with `ng build --configuration production`.
 * 
 * The API URL is set to '/api' to work with the nginx proxy configuration.
 * Nginx proxies /api/ requests to the backend service.
 * 
 * If you need to use a different API URL for a specific deployment,
 * create a custom environment file (e.g., environment.staging.ts) and
 * configure it in angular.json with the appropriate fileReplacements.
 */

export const environment = {
  production: true,
  apiUrl: '/api'
};
