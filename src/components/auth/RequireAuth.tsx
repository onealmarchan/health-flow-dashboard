import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      if (token) localStorage.removeItem('token');
      setValid(false);
    } else {
      setValid(true);
    }
  }, []);

  if (valid === null) return null;
  if (!valid) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default RequireAuth;
