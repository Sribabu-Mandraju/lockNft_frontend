
import { useState, useEffect } from 'react';

export const usePools = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchPools = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch('https://api.stablz.one/pools');
        if (!response.ok) {
          throw new Error('Failed to fetch pools data');
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

    fetchPools();
  }, []); 

  return state;
};