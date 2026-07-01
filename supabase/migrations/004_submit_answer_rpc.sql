-- Trusted answer submission and atomic score updates.
--
-- This centralizes duplicate checks and score increments. Full server-side
-- correctness validation should move here once questions are database-backed.

CREATE OR REPLACE FUNCTION public.submit_answer(
  p_room_id UUID,
  p_player_id UUID,
  p_question_index INTEGER,
  p_answer_index INTEGER,
  p_is_correct BOOLEAN,
  p_points_earned INTEGER
)
RETURNS answers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player players%ROWTYPE;
  v_room rooms%ROWTYPE;
  v_answer answers%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_answer_index < 0 OR p_answer_index > 3 THEN
    RAISE EXCEPTION 'invalid_answer_index' USING ERRCODE = '22023';
  END IF;

  IF p_points_earned < 0 OR p_points_earned > 1500 THEN
    RAISE EXCEPTION 'invalid_points' USING ERRCODE = '22023';
  END IF;

  IF p_is_correct = false AND p_points_earned <> 0 THEN
    RAISE EXCEPTION 'incorrect_answers_must_score_zero' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_player
  FROM players
  WHERE id = p_player_id
    AND room_id = p_room_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'player_not_found_for_user' USING ERRCODE = '28000';
  END IF;

  SELECT *
  INTO v_room
  FROM rooms
  WHERE id = p_room_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'room_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_room.status <> 'active' THEN
    RAISE EXCEPTION 'room_not_active' USING ERRCODE = '25000';
  END IF;

  IF v_room.current_question_index <> p_question_index THEN
    RAISE EXCEPTION 'question_not_active' USING ERRCODE = '25000';
  END IF;

  INSERT INTO answers (
    room_id,
    player_id,
    question_index,
    answer_index,
    is_correct,
    points_earned
  )
  VALUES (
    p_room_id,
    p_player_id,
    p_question_index,
    p_answer_index,
    p_is_correct,
    p_points_earned
  )
  RETURNING * INTO v_answer;

  IF p_is_correct THEN
    UPDATE players
    SET score = score + p_points_earned
    WHERE id = p_player_id;

    IF v_player.team_id IS NOT NULL THEN
      UPDATE teams
      SET score = score + p_points_earned
      WHERE id = v_player.team_id;
    END IF;
  END IF;

  RETURN v_answer;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'answer_already_submitted' USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.submit_answer(UUID, UUID, INTEGER, INTEGER, BOOLEAN, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_answer(UUID, UUID, INTEGER, INTEGER, BOOLEAN, INTEGER) TO authenticated;
