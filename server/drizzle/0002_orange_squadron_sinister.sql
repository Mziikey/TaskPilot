ALTER TABLE `tasks` ADD `status` text DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `priority` text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `startAt` integer DEFAULT (unixepoch() * 1000) NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `dueAt` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `created_at` integer DEFAULT (unixepoch() * 1000);--> statement-breakpoint
ALTER TABLE `tasks` ADD `userId` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `nickname` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT (unixepoch() * 1000);