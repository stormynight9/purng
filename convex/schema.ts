import { defineSchema, defineTable } from 'convex/server'
import { Validator, v } from 'convex/values'

// Auth.js schema definitions
export const userSchema = {
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
}

export const sessionSchema = {
    userId: v.id('users'),
    expires: v.number(),
    sessionToken: v.string(),
}

export const accountSchema = {
    userId: v.id('users'),
    type: v.union(
        v.literal('email'),
        v.literal('oidc'),
        v.literal('oauth'),
        v.literal('webauthn')
    ),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string() as Validator<Lowercase<string>>),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
}

export const verificationTokenSchema = {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
}

export const authenticatorSchema = {
    credentialID: v.string(),
    userId: v.id('users'),
    providerAccountId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    credentialDeviceType: v.string(),
    credentialBackedUp: v.boolean(),
    transports: v.optional(v.string()),
}

const authTables = {
    users: defineTable(userSchema).index('email', ['email']),
    sessions: defineTable(sessionSchema)
        .index('sessionToken', ['sessionToken'])
        .index('userId', ['userId']),
    accounts: defineTable(accountSchema)
        .index('providerAndAccountId', ['provider', 'providerAccountId'])
        .index('userId', ['userId']),
    verificationTokens: defineTable(verificationTokenSchema).index(
        'identifierToken',
        ['identifier', 'token']
    ),
    authenticators: defineTable(authenticatorSchema)
        .index('userId', ['userId'])
        .index('credentialID', ['credentialID']),
}

export default defineSchema({
    ...authTables,
    // App-specific tables
    pushupEntries: defineTable({
        userId: v.id('users'),
        count: v.number(),
        date: v.string(), // YYYY-MM-DD format
        createdAt: v.number(),
        recovery: v.boolean(),
    })
        .index('by_user', ['userId'])
        .index('by_user_and_date', ['userId', 'date'])
        .index('by_date', ['date'])
        .index('by_created_at', ['createdAt']),
    // Pre-computed stats for getStatsData (avoids full table scans)
    yearlyCommunityStats: defineTable({
        year: v.number(),
        communityTotal: v.number(),
    }).index('by_year', ['year']),
    userYearlyStats: defineTable({
        userId: v.id('users'),
        year: v.number(),
        myTotal: v.number(),
        onTimePushups: v.optional(v.number()),
        recoveredPushups: v.optional(v.number()),
    })
        .index('by_user_and_year', ['userId', 'year'])
        .index('by_year', ['year']),
    feedback: defineTable({
        type: v.union(v.literal('feedback'), v.literal('bug')),
        message: v.string(),
        createdAt: v.number(),
        userId: v.optional(v.id('users')),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    }).index('by_created_at', ['createdAt']),
})
