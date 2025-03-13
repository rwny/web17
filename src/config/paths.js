/**
 * Path configuration for assets in different environments
 * 
 * This helps us handle both local development and production deployments
 * - In development: use relative paths (./assets/...)
 * - In production: use absolute paths (/assets/...)
 */

const isProduction = import.meta.env?.PROD || false;
const BASE_PATH = isProduction ? '' : '.';

export const getAssetPath = (path) => {
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};
