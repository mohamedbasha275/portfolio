/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 */

export const _fileUtils = {
    /**
     * @string
     */
    BASE_URL: import.meta.env.BASE_URL,

    /**
     * @param {String} url
     */
    download: (url) => {
        window.open(_fileUtils.resolvePath(url), "_blank")
    },

    /**
     * @param {String} path
     * @return {Promise<any>}
     */
    loadJSON: async (path) => {
        const resolvedPath = _fileUtils.resolvePath(path)

        try {
            const response = await fetch(resolvedPath)
            const contentType = response.headers.get("content-type") || ""

            if (!response.ok) {
                console.error(`[FileUtils] Failed to load JSON: ${resolvedPath} - Status: ${response.status} ${response.statusText}`)
                return null
            }

            if (!contentType.includes("application/json")) {
                console.error(`[FileUtils] Invalid content type for JSON: ${resolvedPath} - Content-Type: ${contentType}`)
                return null
            }

            return await response.json()
        }
        catch (error) {
            console.error(`[FileUtils] Failed to load JSON from ${resolvedPath}:`, error)
            return null
        }
    },

    /**
     * @param {String} path
     * @return {String}
     */
    resolvePath: (path) => {
        if(!path) return path
        if(path.startsWith("http")) return path

        const baseUrl = _fileUtils.BASE_URL || ""
        // Remove leading slash from path if it exists, then combine with baseUrl
        const cleanPath = path.startsWith("/") ? path.slice(1) : path
        const fullPath = baseUrl + cleanPath
        return fullPath.replace(/(^|[^:])\/\//g, "$1/")
    },
}