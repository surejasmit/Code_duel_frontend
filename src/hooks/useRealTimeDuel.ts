import { useEffect, useState, useRef } from 'react';
import { realTimeService, ConnectionStatus, RealTimeEvent } from '../lib/realtime';

export function useRealTimeDuel(challengeId: string | undefined, onDataRefresh: () => void) {
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const onDataRefreshRef = useRef(onDataRefresh);
  
  useEffect(() => {
    onDataRefreshRef.current = onDataRefresh;
  }, [onDataRefresh]);

  useEffect(() => {
    if (!challengeId) return;

    realTimeService.subscribe(`challenge:${challengeId}`);

    const unsubscribeStatus = realTimeService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribeEvent = realTimeService.onEvent((event: RealTimeEvent) => {
      // Trigger a re-fetch to keep it simple and robust
      if (onDataRefreshRef.current) {
         onDataRefreshRef.current();
      }
    });

    return () => {
      realTimeService.unsubscribe(); // will disconnect WS if leader
      unsubscribeStatus();
      unsubscribeEvent();
    };
  }, [challengeId]);

  // Fallback Polling Logic
  useEffect(() => {
    if (status === 'POLLING' && challengeId) {
      const interval = setInterval(() => {
        if (onDataRefreshRef.current) {
           onDataRefreshRef.current();
        }
      }, 5000); // 5 sec fallback polling
      return () => clearInterval(interval);
    }
  }, [status, challengeId]);

  return { status };
}
