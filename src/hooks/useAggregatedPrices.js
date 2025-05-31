// hooks/useAggregatedPrices.js
import { useState, useEffect } from 'react';

export const useAggregatedPrices = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch('https://api.stablz.one/prices/aggregated');
        if (!response.ok) {
          throw new Error('Failed to fetch aggregated prices data');
        }
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error.message || 'Unknown error',
        });
      }
    };

    fetchPrices();
  }, []); // Empty dependency array means this runs once on mount

  return state;
};