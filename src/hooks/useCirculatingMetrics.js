// hooks/useCirculatingMetrics.js
import { useState, useEffect } from 'react';

export const useCirculatingMetrics = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCirculatingMetrics = async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch('https://api.stablz.one/metrics/stablz/circulating');
      if (!response.ok) {
        throw new Error('Failed to fetch circulating metrics data');
      }
      const data = await response.json();

      // Process data to handle large integers with BigInt
      const processedData = JSON.parse(JSON.stringify(data), (key, value) => {
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

  useEffect(() => {
    fetchCirculatingMetrics();
  }, []); // Empty dependency array means this runs once on mount

  return { ...state, refetch: fetchCirculatingMetrics };
};