'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Team } from '@/types';

export function useRealtimeTeams(roomId: string | null) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchTeams() {
      try {
        const { data, error: fetchError } = await supabase
          .from('teams')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        setTeams(data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teams');
        setLoading(false);
      }
    }

    fetchTeams();

    const channel = supabase
      .channel(`teams:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teams',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTeams((current) => [...current, payload.new as Team]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTeams((current) =>
            current.map((t) => (t.id === payload.new.id ? (payload.new as Team) : t))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'teams',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTeams((current) => current.filter((t) => t.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { teams, loading, error };
}
