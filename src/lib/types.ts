export interface PushupFormData {
    count: number
}

export interface ActionResponse {
    success: boolean
    message: string
    errors?: {
        count?: string[]
    }
    total?: number
}
