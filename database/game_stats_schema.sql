-- Updated game_stats table schema
-- Changed puzzle_size to puzzle_type and removed win_status since it's always true for solved games

CREATE TABLE public.game_stats (
  stat_id serial NOT NULL,
  user_id uuid NULL,
  puzzle_type character varying(20) NOT NULL,
  time_taken_seconds integer NOT NULL,
  moves_count integer NOT NULL,
  background_image_id integer NULL,
  game_date timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT game_stats_pkey PRIMARY KEY (stat_id),
  CONSTRAINT game_stats_background_image_id_fkey FOREIGN KEY (background_image_id) REFERENCES background_images (image_id),
  CONSTRAINT game_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON public.game_stats USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_game_stats_date ON public.game_stats USING btree (game_date) TABLESPACE pg_default;

-- Create index for puzzle_type for filtering
CREATE INDEX IF NOT EXISTS idx_game_stats_puzzle_type ON public.game_stats USING btree (puzzle_type) TABLESPACE pg_default; 