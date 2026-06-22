-- MBA Case Study Platform — D1 Database Schema
-- Run via: npx wrangler d1 execute mba-case-study-db --file=src/backend/schema.sql

-- Users: platform accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Sessions: session-based authentication tokens
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Highlights: text selections from case studies
CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  chunk_id TEXT NOT NULL,
  text_content TEXT NOT NULL,
  color TEXT NOT NULL,
  anchor_start TEXT NOT NULL,
  anchor_end TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fetching user highlights per case
CREATE INDEX IF NOT EXISTS idx_highlights_user_case ON highlights(user_id, case_id);

-- Notes: inline, margin, and freeform notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  chunk_id TEXT,
  anchor_start TEXT,
  anchor_end TEXT,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'inline',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fetching user notes per case
CREATE INDEX IF NOT EXISTS idx_notes_user_case ON notes(user_id, case_id);

-- Drafts: user's essay draft per case (one draft per user per case)
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, case_id)
);

-- Index for fetching user draft per case
CREATE INDEX IF NOT EXISTS idx_drafts_user_case ON drafts(user_id, case_id);

-- Chat Sessions: conversation threads with personas
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  persona_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fetching user's chat sessions per case
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_case ON chat_sessions(user_id, case_id);

-- Chat Messages: individual messages within a session
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

-- Index for fetching messages in chronological order
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
