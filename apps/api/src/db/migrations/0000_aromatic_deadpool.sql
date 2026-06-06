CREATE TABLE `org_members` (
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `stream_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stream_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor_address` text NOT NULL,
	`amount` text,
	`tx_signature` text NOT NULL,
	`block_time` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`stream_id`) REFERENCES `streams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_stream` ON `stream_events` (`stream_id`);--> statement-breakpoint
CREATE INDEX `idx_events_type` ON `stream_events` (`event_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_events_dedup` ON `stream_events` (`stream_id`,`event_type`,`tx_signature`);--> statement-breakpoint
CREATE TABLE `streams` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`creator_address` text NOT NULL,
	`recipient_address` text NOT NULL,
	`mint_address` text NOT NULL,
	`vault_address` text NOT NULL,
	`amount` text NOT NULL,
	`org_id` text,
	`start_time` integer,
	`end_time` integer,
	`cliff_time` integer,
	`milestone_authority` text,
	`milestone_reached` integer DEFAULT false,
	`status` text DEFAULT 'active' NOT NULL,
	`amount_withdrawn` text DEFAULT '0',
	`creation_tx` text NOT NULL,
	`created_at` integer NOT NULL,
	`closed_at` integer,
	`close_tx` text,
	`last_synced_at` integer,
	`sync_version` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `idx_streams_creator` ON `streams` (`creator_address`);--> statement-breakpoint
CREATE INDEX `idx_streams_recipient` ON `streams` (`recipient_address`);--> statement-breakpoint
CREATE INDEX `idx_streams_org` ON `streams` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_streams_status` ON `streams` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`display_name` text,
	`avatar_url` text,
	`email` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_wallet_address_unique` ON `users` (`wallet_address`);