import { useState, useEffect } from 'react';

export function useGeminiApiKey() {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setChecking(false);
      }
    };
    checkKey();
  }, []);

  const selectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success
    } catch (e) {
      console.error("Error opening key selector:", e);
    }
  };

  return { hasKey, checking, selectKey };
}
