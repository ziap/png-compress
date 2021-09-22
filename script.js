;(() => {
    document.getElementById('file-input').addEventListener('change', loadImage)

    const canvas = document.getElementsByTagName('canvas')[0]
    const ctx = canvas.getContext('2d')
    const progress = document.getElementsByClassName('progress')[0]

    let image_size, image_type

    canvas.width = 800
    canvas.height = 450

    // Draw the upload image text
    ctx.font = 'lighter 40px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ccc'
    ctx.fillText('Upload image', canvas.width / 2, 150)

    // Set up web worker
    const worker = new Worker('worker.js')
    worker.onmessage = e => {
        if (typeof e.data == 'number') progress.innerHTML = `Progress: ${0 | e.data}%`
        else {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            imgData.data.set(new Uint8ClampedArray(e.data))
            ctx.putImageData(imgData, 0, 0)
            canvas.toBlob(blob => {
                progress.innerHTML = `Done! Reduced ${
                    0 | (100 * (1 - blob.size / image_size))
                }% <button id="download">download</button>`
                document.getElementById('download').addEventListener('click', () => {
                    const saver = document.createElement('a')
                    const blobURL = (saver.href = URL.createObjectURL(blob))
                    saver.download = 'download'
                    saver.click()
                    URL.revokeObjectURL(blobURL)
                })
            }, image_type)
        }
    }
    worker.onerror = console.error

    /**
     * Display the image to the canvas
     */
    function displayImage() {
        // Resize the canvas
        const scale = (image.width / image.height) * 9 > 16 ? 800 / image.width : 450 / image.height
        console.log(scale)
        canvas.style.width = image.width * scale + 'px'
        canvas.style.height = image.height * scale + 'px'

        // Change the canvas display size
        canvas.width = image.width
        canvas.height = image.height

        // Draw the image to the canvas
        ctx.drawImage(image, 0, 0)

        // Get array of pixels from the canvas
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        progress.innerHTML = 'Progress: 0%'

        // Process the image
        worker.postMessage(data.buffer)
    }

    /**
     * Load an image from the file input
     * @param {Event} e - The file upload event
     */
    function loadImage(e) {
        const reader = new FileReader()
        image_size = e.target.files[0].size
        image_type = e.target.files[0].type
        reader.onload = event => {
            const img = new Image()
            img.onload = () => {
                image = img
                displayImage()
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])
    }
})()
