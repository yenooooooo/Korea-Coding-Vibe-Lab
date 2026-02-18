-- Focus Cam Signaling
-- Add peer_id column to study_group_members to store PeerJS ID for WebRTC connection
ALTER TABLE study_group_members ADD COLUMN IF NOT EXISTS peer_id TEXT;
