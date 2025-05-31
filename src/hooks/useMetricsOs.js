// hooks/useMetrics.js
import { useState, useEffect } from 'react';

export const useMetrics = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch('https://api.stablz.one/metrics/os');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics data');
        }
        const data = await response.json();

        // Process data to handle large integers with BigInt
        const processedData = JSON.parse(JSON.stringify(data), (key, value) => {
          // Convert large numbers to BigInt if they exceed safe integer limits
          if (typeof value === 'number' && Math.abs(value) > Number.MAX_SAFE_INTEGER) {
            return BigInt(value);
          }
          return value;
        });

        setState({ data: processedData, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error.message || 'Unknown error',
        });
      }
    };

    fetchMetrics();
  }, []); // Empty dependency array means this runs once on mount

  return state;
};