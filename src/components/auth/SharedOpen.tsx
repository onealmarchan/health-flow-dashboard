import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clearAuthToken } from '@/services/apiClient';

export default function SharedOpen() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const bc = new BroadcastChannel('shared-session');
      bc.postMessage({ type: 'open', id });
      bc.close();
    } catch (e) {
      console.warn('BroadcastChannel not supported');
      // fallback: write a localStorage flag
      try { localStorage.setItem('shared_open', String(id)); } catch (err) {}
    }

    // show a message then redirect to login
    setTimeout(() => {
      // this page should not keep user signed in
      clearAuthToken();
      navigate('/login');
    }, 400);
  }, [id, navigate]);

  return (
    <div style={{padding:20}}>
      Abriendo enlace compartido...
    </div>
  );
}
