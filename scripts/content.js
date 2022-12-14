(async () => {
    const src = chrome.runtime.getURL("../modules/face-api.js");
    console.log('src is', src)
    await import(src);
    console.log('nets is', faceapi.nets)
    const MODEL_URL = chrome.runtime.getURL('../models')

    await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
    ])

    const seenImages = []

    detectFaces(document.images)


    const mutationObserver = new MutationObserver((mutationRecords) => {
        for (let mutationRecord of mutationRecords) {
            if (mutationRecord.type === 'childList') {
                let images = mutationRecord.target.querySelectorAll('img')
                if (images.length > 0) { console.log('new images detected') }
                detectFaces(images)
            }
        }
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    // iterate through all images on the page
    // and draw a box around each face
    async function detectFaces(images) {
        for (let image of images) {
            if (!seenImages.includes(image)) {
                seenImages.push(image)
                try {
                    let parent = image.parentNode
                    let parentStyle = window.getComputedStyle(parent)
                    console.log('parent is', parent)
                    let wrapper = document.createElement('div')
                    wrapper.height = image.height
                    wrapper.width = image.width
                    wrapper.style.margin = image.margin
                    wrapper.style.padding = image.padding
                    console.log('image width and height (0)', image.width, image.height)
                    parent.replaceChild(wrapper, image)
                    image.crossOrigin = 'anonymous'
                    // wrapper.appendChild(imageClone)
                    wrapper.appendChild(image)
                    image.width = wrapper.width
                    image.height = wrapper.height
                    let canvas = document.createElement('canvas')
                    wrapper.appendChild(canvas)
                    parent.style = parentStyle
                    console.log('wrapper width and height', wrapper.width, wrapper.height)
                    wrapper.style.cssText = 'display:inline-block;position:relative;'
                    image.style.cssText = 'position:absolute;z-index:1;'
                    canvas.style.cssText = 'position:relative;z-index:2;'
                    // canvas.style.cssText = 'position:absolute;top:0;left:0;'
                    canvas.width = wrapper.width
                    canvas.height = wrapper.height
                    console.log('image width and height (1)', image.width, image.height)
                    let displaySize = { width: wrapper.width, height: wrapper.height }
                    faceapi.matchDimensions(canvas, displaySize)
                    image.onload = async () => {
                        let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withAgeAndGender()
                        let resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize)
                        console.log('resized detections', resizedDetections)
                        faceapi.draw.drawDetections(canvas, resizedDetections)
                        let ctx = canvas.getContext('2d')
                        ctx.fillStyle = "black";
                        console.log('div width and height', wrapper.getBoundingClientRect().width, wrapper.getBoundingClientRect().height)
                        image.style.display = ''
                        for (let detection of resizedDetections) {
                            let box = detection.detection.box
                            if (detection.gender === 'male') {
                                console.log('gender is male')
                            }
                            ctx.fillRect(box.x, box.y, box.width, box.height);
                            // ctx.fillRect(0, 0 , canvas.width, canvas.height)
                            console.log(fullFaceDescriptions)
                            console.log('coordinates', box.x, box.y)
                            console.log('canvas width and height', canvas.width, canvas.height)
                            console.log('image width and height', image.width, image.height)
                            // console.log('wrapper width and height', wrapper.width, wrapper.height)
                            console.log('box width and height', box.width, box.height)
                        }
                    }

                } catch (err) {
                    console.log(err)
                }
            } else {
                console.log('already seen image')
            }
        }
    }


    console.log('face recognition app loaded!')
})()

