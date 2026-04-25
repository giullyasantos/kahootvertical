'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Player } from '@/types';

export function useRealtimePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchPlayers() {
      try {
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('score', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        setPlayers(data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch players');
        setLoading(false);
      }
    }

    fetchPlayers();

    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setPlayers((current) => [...current, payload.new as Player]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setPlayers((current) =>
            current
              .map((p) => (p.id === payload.new.id ? (payload.new as Player) : p))
              .sort((a, b) => b.score - a.score)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setPlayers((current) => current.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, loading, error };
}
