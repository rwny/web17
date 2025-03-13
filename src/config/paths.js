/**
 * Path configuration for assets in different environments
 */

// Simple path helper to handle asset paths
export const getAssetPath = (path, isAbsolute = false) => {
  // For relative paths in development and absolute in production
  const basePath = isAbsolute ? '' : '.';
  
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

// Helper specifically for model paths
export const getModelPath = (modelName) => {
  return getAssetPath(`assets/models/${modelName}.glb`);
};