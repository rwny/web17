import { useState, useEffect } from 'react';

export function useModelData(dataPath) {
  const [modelData, setModelData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("🔄 Fetching data from:", dataPath);
      
      try {
        // Use import.meta.url as a base for resolving relative paths in Vite
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load model data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Model data loaded successfully:", data);
        
        // Check and log available keys for debugging
        const keys = Object.keys(data);
        console.log("📊 Data structure - Available keys:", keys);
        
        // Convert string keys to numbers if they're numeric
        // This ensures "12" will match when we look for 12
        const processedData = {};
        for (const key in data) {
          processedData[key] = data[key];
          // This is optional but helps if you have number comparison issues
          if (!isNaN(key)) {
            processedData[Number(key)] = data[key];
          }
        }
        
        console.log("📝 Sample entry:", Object.entries(processedData)[0] || "No entries found");
        
        setModelData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Error loading model data:", err);
        console.error("📁 Check that the file exists at:", dataPath);
        setError(err.message);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dataPath]);

  return { modelData, isLoading, error };
}
