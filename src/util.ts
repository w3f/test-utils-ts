export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function notCI(): boolean {
    return !process.env['GITHUB_ACTIONS'] && !process.env['CI'];
}
