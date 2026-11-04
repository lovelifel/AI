import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
export const taskStatusEnum = pgEnum("task_status", ["todo", "done"]);
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});
