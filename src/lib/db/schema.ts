import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});