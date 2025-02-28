import React, { useRef, useState, useEffect, useCallback } from 'react';

const PSYCHIC_URL = 'https://link.psychic.dev';
// const PSYCHIC_API_URL = 'http://localhost:8080'
const PSYCHIC_API_URL = 'https://sidekick-ezml2kwdva-uc.a.run.app';

export function usePsychicLink(public_key: string, onSuccessCallback: Function) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  let windowObjectReference: Window | null = null;

  async function getCustomAuthUrl(public_key: string) {
    try {
      // Use the public key as the bearer
      const response = await fetch(`${PSYCHIC_API_URL}/get-link-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${public_key}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data && data.settings && data.settings.custom_auth_url) {
        return data.settings.custom_auth_url;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }


  async function open(accountId: string) {
    setIsLoading(true)

    // Call the get-link-settings endpoint to get any custom settings
    const customUrl = await getCustomAuthUrl(public_key);
    var url = ""
    if (customUrl) {
      url = `${customUrl}?public_key=${public_key}&account_id=${accountId}`
    } else {
      url = `${PSYCHIC_URL}?public_key=${public_key}&account_id=${accountId}`
    }

    if (windowObjectReference === null || windowObjectReference.closed) {
      const width = 600;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      windowObjectReference = window.open(url, '_blank', `addressbar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`)
    } else {
      windowObjectReference.focus();
    }
  }

  const handleMessage = useCallback((event: MessageEvent) => {
    // check if oigin is not http://localhost:3000 or link.psychic.dev
    if (event.origin !== "http://localhost:3000" && event.origin !== "https://link.psychic.dev") {
      return;
    }
    const data = event.data;
    if (data && data.account_id) {
      setIsLoading(false)
      onSuccessCallback({accountId: data.account_id, connectorId: data.connector_id})
    } else {
      setError("Connection failed. Please try again later.")
    }
  }, [])

  useEffect(() => {
    // Add event listeners to get auth codes
    window.addEventListener('message', handleMessage, false);
    setIsReady(true)

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return { open, isReady, isLoading, error};
}