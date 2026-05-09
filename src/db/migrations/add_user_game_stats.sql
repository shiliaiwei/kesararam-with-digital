-- Add game statistics columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS highest_score INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0 NOT NULL;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS users_highest_score_idx ON users(highest_score DESC);
CREATE INDEX IF NOT EXISTS users_lifetime_points_idx ON users(lifetime_points DESC);

-- Add retention policy comment (implement cleanup job separately)
COMMENT ON TABLE game_scores IS 'Game scores are retained for 1 year. Cleanup job should delete records older than 1 year.';
