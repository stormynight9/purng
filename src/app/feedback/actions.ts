'use server'

/**
 * Optional env for email delivery: RESEND_API_KEY, FEEDBACK_TO_EMAIL,
 * RESEND_FROM (defaults to Resend onboarding address).
 */
import { auth } from '@/auth'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'
import { Resend } from 'resend'

export type FeedbackType = 'feedback' | 'bug'

export type SubmitFeedbackState =
    | { success: true }
    | { success: false; error: string }

export async function submitFeedback(
    _prev: SubmitFeedbackState | null,
    formData: FormData
): Promise<SubmitFeedbackState> {
    const type = formData.get('type') as FeedbackType | null
    const message = formData.get('message')?.toString()?.trim()

    if (!type || (type !== 'feedback' && type !== 'bug')) {
        return {
            success: false,
            error: 'Please choose Feedback or Bug report.',
        }
    }
    if (!message || message.length < 1) {
        return { success: false, error: 'Please enter a message.' }
    }

    const session = await auth()
    const email = session?.user?.email ?? undefined
    const name = session?.user?.name ?? undefined

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
        return { success: false, error: 'Server configuration error.' }
    }

    try {
        const client = new ConvexHttpClient(convexUrl)
        await client.mutation(api.feedback.insertFeedback, {
            type,
            message,
            email,
            name,
        })
    } catch (e) {
        console.error('Convex insertFeedback failed:', e)
        return { success: false, error: 'Failed to save. Please try again.' }
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.FEEDBACK_TO_EMAIL
    const fromEmail =
        process.env.RESEND_FROM ?? 'Purng Feedback <onboarding@resend.dev>'

    if (resendApiKey && toEmail) {
        try {
            const resend = new Resend(resendApiKey)
            const subject =
                type === 'bug'
                    ? `[Purng] Bug report${name || email ? ` from ${name ?? email}` : ''}`
                    : `[Purng] Feedback${name || email ? ` from ${name ?? email}` : ''}`
            const text = [
                message,
                '',
                '---',
                email ? `Email: ${email}` : 'Email: (not provided)',
                name ? `Name: ${name}` : 'Name: (not provided)',
            ].join('\n')
            await resend.emails.send({
                from: fromEmail,
                to: toEmail,
                subject,
                text,
            })
        } catch (e) {
            console.error('Resend send failed:', e)
            // Submission is already stored in Convex; don't fail the form
        }
    }

    return { success: true }
}
