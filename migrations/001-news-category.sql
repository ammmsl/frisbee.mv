-- Migration: news_posts.category (T04, Wave 4)
-- Run manually in the Supabase SQL editor. The site code is default-safe and
-- works before AND after this runs (column absent → every post reads as 'news').
-- No restart needed after running — the write path re-checks for the column.

ALTER TABLE news_posts
  ADD COLUMN category text NOT NULL DEFAULT 'news'
  CHECK (category IN ('news', 'research'));
