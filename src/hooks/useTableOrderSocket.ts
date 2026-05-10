'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import type { PosOrder } from '@/types/pos-order';

function buildWsUrl(tableId: number): string {
  // API_BASE_URL is like "https://imenu.kg" — replace scheme with ws/wss.
  const httpUrl = API_BASE_URL.replace(/\/$/, '');
  const wsUrl = httpUrl.replace(/^http(s?):\/\//, 'ws$1://');
  return `${wsUrl}/ws/tables/${tableId}/`;
}

interface SnapshotMessage {
  type: 'order.snapshot';
  tableId: number;
  order: PosOrder | null;
}

export interface TableSocketState {
  order: PosOrder | null;
  hasSnapshot: boolean;
  isConnected: boolean;
  reconnectKey: number;
}

function shouldApplySnapshot(
  current: PosOrder | null,
  incoming: PosOrder | null,
): boolean {
  if (!incoming) return true;
  if (!current) return true;
  if (incoming.id !== current.id) return true;
  return incoming.version >= current.version;
}

export function useTableOrderSocket(
  tableId: number | null | undefined,
): TableSocketState {
  const [order, setOrder] = useState<PosOrder | null>(null);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectKey, setReconnectKey] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number | null>(null);
  const closedByEffectRef = useRef(false);

  useEffect(() => {
    setOrder(null);
    setHasSnapshot(false);
    if (!tableId) return;
    closedByEffectRef.current = false;

    let attempt = 0;

    const connect = () => {
      const ws = new WebSocket(buildWsUrl(tableId));
      socketRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setIsConnected(true);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data) as SnapshotMessage;
          if (msg.type === 'order.snapshot') {
            setOrder((prev) =>
              shouldApplySnapshot(prev, msg.order) ? msg.order : prev,
            );
            setHasSnapshot(true);
          }
        } catch {
          // ignore malformed
        }
      };

      ws.onclose = (evt) => {
        setIsConnected(false);
        if (closedByEffectRef.current) return;
        // Auth-failure code per spec: do not retry.
        if (evt.code === 4003) return;

        const delay = Math.min(15000, 1000 * Math.pow(2, attempt));
        attempt += 1;
        retryRef.current = window.setTimeout(() => {
          setReconnectKey((k) => k + 1);
          connect();
        }, delay);
      };

      ws.onerror = () => {
        // Let onclose drive reconnect.
        try {
          ws.close();
        } catch {
          // noop
        }
      };
    };

    connect();

    return () => {
      closedByEffectRef.current = true;
      if (retryRef.current) {
        window.clearTimeout(retryRef.current);
        retryRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [tableId]);

  return { order, hasSnapshot, isConnected, reconnectKey };
}
