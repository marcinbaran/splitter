export function getBackUrl(back: string, previous: string): URL {
    const backURL = new URL(back)
    const previousURL = new URL(previous)

    if(previousURL.pathname === backURL.pathname) {
        return previousURL
    }
    return backURL
}
