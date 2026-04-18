const STORAGE_KEY = 'ccc_claude_api_key';

export function getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY)
        || import.meta.env.VITE_ANTHROPIC_API_KEY
        || null;
}

export function setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
}
