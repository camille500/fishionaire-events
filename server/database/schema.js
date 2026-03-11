import { pgTable, text, timestamp, pgEnum, serial, integer } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('user_role', ['user', 'admin'])

export const users = pgTable('users', {
  clerkId: text('clerk_id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: roleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  ownerClerkId: text('owner_clerk_id').notNull().references(() => users.clerkId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined'])

export const eventInvitations = pgTable('event_invitations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  inviteeEmail: text('invitee_email').notNull(),
  inviterClerkId: text('inviter_clerk_id').notNull().references(() => users.clerkId),
  status: invitationStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
