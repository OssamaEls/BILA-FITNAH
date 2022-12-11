(async () => {
    const src = chrome.runtime.getURL("../modules/face-api.js");
    console.log('src is', src)
    await import(src);
    // const faceapi = window.faceapi
    console.log('nets is', faceapi.nets)
    const MODEL_URL = chrome.runtime.getURL('../models')
    // const image = document.getElementById('myImage')
    let images = document.images
    let imgs = Array.from(images)
    console.log('images are', images)

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
    ]).then(start)


    //     async function start() {
    //         console.log('starting')
    //         for (let image of images) {
    //             try {
    //                 console.log('image width and height (0)', image.width, image.height)
    //                 // image.setAttribute('crossOrigin', 'anonymous');
    //                 image.crossOrigin = 'anonymous'
    //                 console.log('image width and height (1)', image.width, image.height)
    //                 let parent = image.parentNode
    //                 let wrapper = document.createElement('div')
    //                 console.log('image width and height (2)', image.width, image.height)
    //                 wrapper.height = image.height
    //                 wrapper.width = image.width
    //                 wrapper.style.margin = 0
    //                 wrapper.style.padding = 0
    //                 parent.replaceChild(wrapper, image)
    //                 console.log('image width and height (3)', image.width, image.height)
    //                 wrapper.append(image)
    //                 let canvas = document.createElement('canvas')
    //                 wrapper.append(canvas)
    //                 wrapper.style.cssText = 'display:inline-block;position:relative;'
    //                 // image.style.cssText = 'position:absolute;z-index:1;'
    //                 canvas.style.cssText = 'position:absolute;top:0;left:0;'
    //                 canvas.width = image.width
    //                 canvas.height = image.height
    //                 let displaySize = { width: image.width, height: image.height }
    //                 faceapi.matchDimensions(canvas, displaySize)
    //                 let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withAgeAndGender()
    //                 // console.log('image width and height (late)', image.width, image.height)
    //                 let resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize)
    //                 console.log('resized detections', resizedDetections)
    //                 faceapi.draw.drawDetections(canvas, resizedDetections)
    //                 let ctx = canvas.getContext('2d')
    //                 ctx.fillStyle = "black";
    //                 console.log('div width and height', wrapper.getBoundingClientRect().width, wrapper.getBoundingClientRect().height)
    //                 for (let detection of resizedDetections) {
    //                     let box = detection.detection.box
    //                     if (detection.gender === 'male') {
    //                         console.log('gender is male')
    //                     }
    //                     ctx.fillRect(box.x, box.y, box.width, box.height);
    //                     // ctx.fillRect(0, 0 , canvas.width, canvas.height)
    //                     console.log(fullFaceDescriptions)
    //                     console.log('coordinates', box.x, box.y)
    //                     console.log('canvas width and height', canvas.width, canvas.height)
    //                     console.log('image width and height (late)', image.width, image.height)
    //                     // console.log('wrapper width and height', wrapper.width, wrapper.height)
    //                     console.log('box width and height', box.width, box.height)
    //                 }
    //             } catch (err) {
    //                 console.log(err)
    //             }
    //         }

    //     }
    // })();

    // iterate through all images on the page
    // and draw a box around each face
    async function start() {
        for (let image of images) {
            try {
                let parent = image.parentNode
                let wrapper = document.createElement('div')
                wrapper.height = image.height
                wrapper.width = image.width
                wrapper.style.margin = image.margin
                wrapper.style.padding = image.padding
                console.log('image width and height (0)', image.width, image.height)
                parent.replaceChild(wrapper, image)
                image.crossOrigin = 'anonymous'
                let imageClone = image.cloneNode()
                imageClone.width = wrapper.width
                imageClone.height = wrapper.height
                console.log('imageclone  width and height (0)', imageClone.width, imageClone.height)
                // wrapper.appendChild(imageClone)
                wrapper.appendChild(image)
                image.width = wrapper.width
                image.height = wrapper.height
                // console.log('imageclone  width and height (1)', imageClone.width, imageClone.height)
                let canvas = document.createElement('canvas')
                wrapper.appendChild(canvas)
                console.log('wrapper width and height', wrapper.width, wrapper.height)
                wrapper.style.cssText = 'display:inline-block;position:relative;'
                imageClone.style.cssText = 'position:absolute;z-index:1;'
                canvas.style.cssText = 'position:relative;z-index:2;'
                // canvas.style.cssText = 'position:absolute;top:0;left:0;'
                canvas.width = wrapper.width
                canvas.height = wrapper.height
                console.log('image width and height (1)', image.width, image.height)
                let displaySize = { width: wrapper.width, height: wrapper.height }
                faceapi.matchDimensions(canvas, displaySize)
                let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withAgeAndGender()
                let resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize)
                console.log('resized detections', resizedDetections)
                faceapi.draw.drawDetections(canvas, resizedDetections)
                console.log('imageclone  width and height (2)', imageClone.width, imageClone.height)
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
            } catch (err) {
                console.log(err)
            }
        }
    }

    // async function start() {
    //     for (let i = 0; i < imgs.length; i++) {
    //         try {
    //             image = imgs[i]
    //             console.log('image is', image)
    //             let parent = image.parentNode
    //             let wrapper = document.createElement('div')
    //             wrapper.height = image.height
    //             wrapper.width = image.width
    //             wrapper.style.margin = 0
    //             let canvas = faceapi.createCanvasFromMedia(image)
    //             // wrapper.style.cssText = 'display:inline-block;position:relative;'
    //             // image.style.cssText = 'position:absolute;z-index:1;'
    //             canvas.width = image.width
    //             canvas.height = image.height
    //             let displaySize = { width: image.width, height: image.height }
    //             faceapi.matchDimensions(canvas, displaySize)
    //             let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withAgeAndGender()
    //             parent.replaceChild(canvas, image)
    //             let resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize)
    //             console.log('resized detections', resizedDetections)
    //             // faceapi.draw.drawDetections(canvas, resizedDetections)
    //             let ctx = canvas.getContext("2d");
    //             ctx.drawImage(image, 0, 0, displaySize.width, displaySize.height);
    //             console.log('image width and height', image.width, image.height)
    //             console.log('canvas width and height', canvas.width, canvas.height)
    //             console.log('length of images', images.length)
    //             console.log('length of imgs', imgs.length)
    //             // let ctx = canvas.getContext('2d')
    //             ctx.fillStyle = "black";
    //             for (let detection of resizedDetections) {
    //                 let box = detection.detection.box
    //                 if (detection.gender === 'male') {
    //                     console.log('gender is male')
    //                 }
    //                 ctx.fillRect(box.x, box.y, box.width, box.height);
    //                 // ctx.fillRect(0, 0 , canvas.width, canvas.height)
    //                 console.log(fullFaceDescriptions)
    //                 console.log('coordinates', box.x, box.y)
    //                 console.log('canvas width and height', canvas.width, canvas.height)
    //                 console.log('image width and height', image.width, image.height)
    //                 // console.log('wrapper width and height', wrapper.width, wrapper.height)
    //                 console.log('box width and height', box.width, box.height)
    //             }
    //         } catch (err) {
    //             console.log(err)
    //         }
    //     }
    // }

    console.log('face recognition app loaded!')
})()

// console.log('a is', a)