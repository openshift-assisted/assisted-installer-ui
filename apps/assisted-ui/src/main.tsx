import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AxiosInstance } from 'axios';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
import { App } from './components/App';

declare global {
  interface Window {
    OCM_REFRESH_TOKEN?: string;
  }
}

// Put your OCM_REFRESH_TOKEN in public/env.js (keep empty in git)
const refreshToken = window.OCM_REFRESH_TOKEN;
let accessToken = '';
let expiresAt = 0;

const getAccessToken = async () => {
  if (accessToken && Date.now() < expiresAt - 5000) {
    return accessToken;
  }
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken || '',
    client_id: 'ocm-cli',
  });
  const res = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  accessToken = data.access_token;
  expiresAt = Date.now() + data.expires_in * 1000;
  return accessToken;
};

if (refreshToken) {
  OCM.Api.setAuthInterceptor((client: AxiosInstance) => {
    client.interceptors.request.use(async (config) => {
      config.headers.set('Authorization', `Bearer ${await getAccessToken()}`);
      return config;
    });
    return client;
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.classList.add('pf-v6-u-h-100vh');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
