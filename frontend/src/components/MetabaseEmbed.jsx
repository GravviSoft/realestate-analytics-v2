import React, { useEffect, useState } from 'react';
import dataService from '../services/dataService';

const METABASE_SCRIPT_ID = 'metabase-embed-js';

const loadMetabaseScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.getElementById(METABASE_SCRIPT_ID);
    if (existing) {
      if (existing.src === src) {
        resolve();
        return;
      }
      existing.remove();
    }
    const script = document.createElement('script');
    script.id = METABASE_SCRIPT_ID;
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const MetabaseEmbed = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { token, instanceUrl } = await dataService.getMetabaseToken();
        const baseUrl = (instanceUrl || 'https://dash.gravvisoft.com').replace(/\/$/, '');
        const embedSrc = `${baseUrl}/app/embed.js`;
        await loadMetabaseScript(embedSrc);
        if (!mounted) return;
        window.metabaseConfig = {
          theme: { preset: 'light' },
          isGuest: true,
          instanceUrl: instanceUrl || 'http://dash.gravvisoft.com',
        };
        setToken(token);
      } catch (err) {
        console.error('Error loading Metabase dashboard:', err);
        if (mounted) setError('Unable to load dashboard');
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return <div className="metabase-embed error">{error}</div>;
  }

  if (!token) {
    return <div className="metabase-embed loading">Loading dashboard...</div>;
  }

  return (
    <div className="metabase-embed">
      <metabase-dashboard
        token={token}
        with-title="true"
        with-downloads="true"
        style={{ display: 'block', width: '100%', height: '1100px', border: 'none' }}
      ></metabase-dashboard>
    </div>
  );
};

export default MetabaseEmbed;
