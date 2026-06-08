-- Add metadata columns to streams table
ALTER TABLE streams ADD COLUMN token_name TEXT;
ALTER TABLE streams ADD COLUMN token_symbol TEXT;
ALTER TABLE streams ADD COLUMN token_decimals INTEGER;
ALTER TABLE streams ADD COLUMN creator_display_name TEXT;
ALTER TABLE streams ADD COLUMN description TEXT;
