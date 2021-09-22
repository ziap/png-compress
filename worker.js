;(() => {
    let done = 0

    onmessage = e => {
        const pixels = []
        const data = new Uint8ClampedArray(e.data)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            pixels.push({ index: i, r, g, b })
        }
        done = 0
        MedianCutSplit(data, pixels, 8)
        postMessage(data.buffer)
    }

    function MedianCutSplit(data, pixels, depth) {
        if (pixels.length == 0) return
        if (depth == 0) {
            const r_average = pixels.reduce((x, i) => x + i.r, 0) / pixels.length
            const g_average = pixels.reduce((x, i) => x + i.g, 0) / pixels.length
            const b_average = pixels.reduce((x, i) => x + i.b, 0) / pixels.length
            for (const pixel of pixels) {
                data[pixel.index] = r_average
                data[pixel.index + 1] = g_average
                data[pixel.index + 2] = b_average
            }
            done += pixels.length
            postMessage((done * 400) / data.length)
        } else {
            const r_range =
                pixels.reduce((x, i) => Math.max(x, i.r), 0) - pixels.reduce((x, i) => Math.min(x, i.r), Infinity)
            const g_range =
                pixels.reduce((x, i) => Math.max(x, i.g), 0) - pixels.reduce((x, i) => Math.min(x, i.g), Infinity)
            const b_range =
                pixels.reduce((x, i) => Math.max(x, i.b), 0) - pixels.reduce((x, i) => Math.min(x, i.b), Infinity)

            if (g_range > r_range && g_range > b_range) pixels = pixels.sort((a, b) => a.g - b.g)
            else if (b_range > r_range && b_range > g_range) pixels = pixels.sort((a, b) => a.b - b.b)
            else pixels = pixels.sort((a, b) => a.r - b.r)
            const half = (pixels.length + 1) >> 1
            MedianCutSplit(data, pixels.slice(0, half), depth - 1)
            MedianCutSplit(data, pixels.slice(-half), depth - 1)
        }
    }
})()
