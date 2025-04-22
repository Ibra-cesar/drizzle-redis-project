import { pgEnum, pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./userSchema";
import { relations } from "drizzle-orm";

export const todoStatuses = ["done", "notDone"] as const;
export type TodoStatus = (typeof todoStatuses)[number];
export const todosEnums = pgEnum("todo_status", todoStatuses);

export const todoTable = pgTable("todos", {
  id: uuid().primaryKey().defaultRandom(),
  description: text().notNull(),
  statuses: todosEnums().notNull().default("notDone"),
  userId: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const todosRelations = relations(todoTable, ({ one }) => ({
  user: one(userTable, {
    fields: [todoTable.userId],
    references: [userTable.id],
  }),
}));
