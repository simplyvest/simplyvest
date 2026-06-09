CREATE TABLE `token_creations` (
	`mint_address` text PRIMARY KEY NOT NULL,
	`creator_address` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`decimals` integer NOT NULL,
	`supply` text NOT NULL,
	`metadata_uri` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_token_creations_creator` ON `token_creations` (`creator_address`);--> statement-breakpoint
CREATE TABLE `token_preferences` (
	`mint_address` text NOT NULL,
	`creator_address` text NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`hidden_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_token_prefs_unique` ON `token_preferences` (`mint_address`,`creator_address`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`token_visibility_mode` text DEFAULT 'hide_list' NOT NULL
);