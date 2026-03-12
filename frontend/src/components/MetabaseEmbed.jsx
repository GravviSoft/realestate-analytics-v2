import React, { useEffect, useRef, useState } from 'react';
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
  const [instanceUrl, setInstanceUrl] = useState('https://dash.gravvisoft.com');
  const [embedHeight, setEmbedHeight] = useState(2000);
  const dashboardRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { token, instanceUrl } = await dataService.getMetabaseToken();
        const baseUrl = (instanceUrl || 'https://dash.gravvisoft.com').replace(/\/$/, '');
        const embedSrc = `${baseUrl}/app/embed.js`;
        await loadMetabaseScript(embedSrc);
        if (!mounted) return;
        setInstanceUrl(baseUrl);
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
    return () => { mounted = false; };
  }, []);

  // Adjust the embed height when Metabase posts size updates (e.g., when switching tabs inside the dashboard)
  useEffect(() => {
    if (!token || !instanceUrl) return undefined;

    const normalizeHeight = (value) => {
      const num = Number(value);
      return Number.isFinite(num) && num > 0 ? num : null;
    };

    const extractHeight = (payload) => {
      if (!payload) return null;
      if (typeof payload === 'string') {
        const match = payload.match(/metabase:frame:height:(\\d+)/);
        if (match) return normalizeHeight(match[1]);
      }

      const candidates = [
        payload.height,
        payload?.data?.height,
        payload?.payload?.height,
        payload?.payload?.iframeHeight,
        payload?.payload?.iframe?.height,
        payload?.payload?.iframe?.style?.height,
        payload?.iframeHeight,
        payload?.iframe?.height,
        payload?.iframe?.style?.height,
        payload?.value,
      ];

      return candidates.map(normalizeHeight).find((h) => h !== null);
    };

    const handleMessage = (event) => {
      const payload = event.data || {};
      const nextHeight = extractHeight(payload);

      if (!nextHeight) return;

      setEmbedHeight((prev) => {
        const bufferedHeight = Math.max(nextHeight + 96, 1200);
        // Avoid tiny oscillations that cause reflows
        return Math.abs(prev - bufferedHeight) > 6 ? bufferedHeight : prev;
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [token, instanceUrl]);

  // Fallback: if Metabase adjusts the host element height directly, keep React state in sync
  useEffect(() => {
    const host = dashboardRef.current;
    if (!host) return undefined;

    const normalizeHeight = (value) => {
      const num = Number(String(value).replace('px', ''));
      return Number.isFinite(num) && num > 0 ? num : null;
    };

    const observer = new MutationObserver(() => {
      const nextHeight = normalizeHeight(host.style.height);
      if (!nextHeight) return;
      setEmbedHeight((prev) => (Math.abs(prev - nextHeight) > 6 ? nextHeight : prev));
    });

    observer.observe(host, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [token]);

  // Poll for iframe height in case postMessage events are blocked
  useEffect(() => {
    const host = dashboardRef.current;
    if (!host) return undefined;

    const normalizeHeight = (value) => {
      const num = Number(String(value).replace('px', ''));
      return Number.isFinite(num) && num > 0 ? num : null;
    };

    let timer;
    const tick = () => {
      const iframe = host.querySelector('iframe');
      const nextHeight = normalizeHeight(iframe?.style?.height || iframe?.getAttribute?.('height'));
      if (nextHeight) {
        setEmbedHeight((prev) => (Math.abs(prev - nextHeight) > 6 ? Math.max(nextHeight + 96, 1200) : prev));
      }
      timer = setTimeout(tick, 1200);
    };

    tick();
    return () => clearTimeout(timer);
  }, [token]);

  if (error) {
    return <div className="metabase-embed error">{error}</div>;
  }

  if (!token) {
    return <div className="metabase-embed loading">Loading dashboard...</div>;
  }

  return (
    <div className="metabase-embed">
      <metabase-dashboard
        ref={dashboardRef}
        key={token}
        token={token}
        with-title="false"
        with-downloads="true"
        auto-height="true"
        style={{
          display: 'block',
          width: '100%',
          border: 'none',
          height: `${embedHeight}px`,
          minHeight: '3200px',
          transition: 'height 0.2s ease',
        }}
      ></metabase-dashboard>
    </div>
  );
};

export default MetabaseEmbed;
