import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { userTable } from "./userSchema";
import { relations } from "drizzle-orm";

export const recipesTable = pgTable("recipes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => userTable.id, {onDelete: "cascade"}),
  title: text().notNull(),
  description: text(),
  ingredients: jsonb().notNull(),
  instruction: jsonb().notNull(),
  createdAt: timestamp({withTimezone: true}).defaultNow().notNull()
})

export const recipesRelation = relations(recipesTable, ({ one }) => ({
  user: one(userTable, {
    fields: [recipesTable.userId],
    references: [userTable.id],
  }),
}));
