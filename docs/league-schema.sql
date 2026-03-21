-- League schema migration
-- Run this in the Supabase SQL Editor before using any /league routes.

CREATE TABLE seasons (
  season_id    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name  varchar      NOT NULL,
  start_date   date         NOT NULL,
  end_date     date         NOT NULL,
  break_start  date,
  break_end    date,
  status       varchar      NOT NULL DEFAULT 'setup'
               CHECK (status IN ('setup','active','break','resuming','complete')),
  created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  team_id     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id   uuid         NOT NULL REFERENCES seasons(season_id),
  team_name   varchar      NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE players (
  player_id     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id     uuid         NOT NULL REFERENCES seasons(season_id),
  team_id       uuid         NOT NULL REFERENCES teams(team_id),
  display_name  varchar      NOT NULL,
  is_active     boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE fixtures (
  match_id       uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id      uuid         NOT NULL REFERENCES seasons(season_id),
  home_team_id   uuid         NOT NULL REFERENCES teams(team_id),
  away_team_id   uuid         NOT NULL REFERENCES teams(team_id),
  kickoff_time   timestamptz  NOT NULL,
  venue          varchar      NOT NULL DEFAULT 'Villingili Football Turf',
  status         varchar      NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled','live','complete','postponed','cancelled')),
  matchweek      integer      NOT NULL,
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now(),
  CHECK (home_team_id != away_team_id)
);

CREATE TABLE match_results (
  match_result_id  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id         uuid         NOT NULL UNIQUE REFERENCES fixtures(match_id),
  score_home       integer      NOT NULL CHECK (score_home >= 0 AND score_home <= 11),
  score_away       integer      NOT NULL CHECK (score_away >= 0 AND score_away <= 11),
  mvp_player_id    uuid         NOT NULL REFERENCES players(player_id),
  resolved_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE player_match_stats (
  stat_id    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   uuid         NOT NULL REFERENCES fixtures(match_id),
  player_id  uuid         NOT NULL REFERENCES players(player_id),
  team_id    uuid         NOT NULL REFERENCES teams(team_id),
  goals      integer      NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists    integer      NOT NULL DEFAULT 0 CHECK (assists >= 0),
  blocks     integer      NOT NULL DEFAULT 0 CHECK (blocks >= 0),
  UNIQUE (player_id, match_id)
);

CREATE TABLE match_absences (
  absence_id  uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid  NOT NULL REFERENCES fixtures(match_id),
  player_id   uuid  NOT NULL REFERENCES players(player_id),
  team_id     uuid  NOT NULL REFERENCES teams(team_id),
  UNIQUE (player_id, match_id)
);

CREATE TABLE spirit_nominations (
  nomination_id        uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id             uuid  NOT NULL REFERENCES fixtures(match_id),
  nominating_team_id   uuid  NOT NULL REFERENCES teams(team_id),
  nominated_player_id  uuid  NOT NULL REFERENCES players(player_id),
  UNIQUE (match_id, nominating_team_id)
);

CREATE TABLE season_holidays (
  holiday_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    uuid NOT NULL REFERENCES seasons(season_id) ON DELETE CASCADE,
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  name         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_range CHECK (end_date >= start_date)
);

CREATE INDEX ON season_holidays (season_id);
