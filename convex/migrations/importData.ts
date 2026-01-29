import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { Id } from '../_generated/dataModel'

export const importUsers = mutation({
    args: { users: v.array(v.any()) },
    handler: async (ctx, args) => {
        const idMap = new Map<string, string>() // old ID -> new Convex ID

        for (const user of args.users) {
            const newId = await ctx.db.insert('users', {
                name: user.name ?? undefined,
                email: user.email ?? undefined,
                emailVerified: user.emailVerified
                    ? new Date(user.emailVerified).getTime()
                    : undefined,
                image: user.image ?? undefined,
            })
            idMap.set(user.id, newId)
        }

        return Object.fromEntries(idMap)
    },
})

export const importPushupEntries = mutation({
    args: {
        entries: v.array(v.any()),
        userIdMap: v.any(),
    },
    handler: async (ctx, args) => {
        let imported = 0
        for (const entry of args.entries) {
            const newUserId = args.userIdMap[entry.userId]
            if (!newUserId) {
                console.warn(
                    `Skipping entry ${entry.id}: user ${entry.userId} not found`
                )
                continue
            }

            await ctx.db.insert('pushupEntries', {
                userId: newUserId as Id<'users'>,
                count: entry.count,
                date: entry.date,
                createdAt: new Date(entry.created_at).getTime(),
                recovery: entry.recovery ?? false,
            })
            imported++
        }
        return { imported }
    },
})

export const importAccounts = mutation({
    args: {
        accounts: v.array(v.any()),
        userIdMap: v.any(),
    },
    handler: async (ctx, args) => {
        let imported = 0
        for (const account of args.accounts) {
            const newUserId = args.userIdMap[account.userId]
            if (!newUserId) {
                console.warn(
                    `Skipping account: user ${account.userId} not found`
                )
                continue
            }

            await ctx.db.insert('accounts', {
                userId: newUserId as Id<'users'>,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token ?? undefined,
                access_token: account.access_token ?? undefined,
                expires_at: account.expires_at ?? undefined,
                token_type: account.token_type ?? undefined,
                scope: account.scope ?? undefined,
                id_token: account.id_token ?? undefined,
                session_state: account.session_state ?? undefined,
            })
            imported++
        }
        return { imported }
    },
})

export const importSessions = mutation({
    args: {
        sessions: v.array(v.any()),
        userIdMap: v.any(),
    },
    handler: async (ctx, args) => {
        let imported = 0
        for (const session of args.sessions) {
            const newUserId = args.userIdMap[session.userId]
            if (!newUserId) {
                console.warn(
                    `Skipping session: user ${session.userId} not found`
                )
                continue
            }

            await ctx.db.insert('sessions', {
                userId: newUserId as Id<'users'>,
                sessionToken: session.sessionToken,
                expires: new Date(session.expires).getTime(),
            })
            imported++
        }
        return { imported }
    },
})
