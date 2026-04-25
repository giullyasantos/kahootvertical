'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Answer } from '@/types';

export function useRealtimeAnswers(roomId: string | null, questionIndex: number) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchAnswers() {
      try {
        const { data, error: fetchError } = await supabase
          .from('answers')
          .select('*')
          .eq('room_id', roomId)
          .eq('question_index', questionIndex);

        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        setAnswers(data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch answers');
        setLoading(false);
      }
    }

    fetchAnswers();

    const channel = supabase
      .channel(`answers:${roomId}:${questionIndex}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newAnswer = payload.new as Answer;
          if (newAnswer.question_index === questionIndex) {
            setAnswers((current) => [...current, newAnswer]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, questionIndex]);

  return { answers, answerCount: answers.length, loading, error };
}
