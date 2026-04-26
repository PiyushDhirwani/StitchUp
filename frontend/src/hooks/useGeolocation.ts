import { useState, useCallback } from 'react';
import { getDIGIPINFromLatLon } from 'digipin';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  digipin: string;
}

export type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const digipin = getDIGIPINFromLatLon(latitude, longitude);
        setLocation({ latitude, longitude, digipin });
        setStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMsg('Location permission denied. You can enter your address manually.');
        } else {
          setStatus('error');
          setErrorMsg('Unable to retrieve your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { location, status, errorMsg, requestLocation };
}
