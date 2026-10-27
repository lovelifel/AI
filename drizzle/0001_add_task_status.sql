CREATE TYPE "public"."task_status" AS ENUM('todo', 'done');--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "status" "task_status" DEFAULT 'todo' NOT NULL;