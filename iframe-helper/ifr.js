(async () => {
        const src = chrome.runtime.getURL("../modules/face-api.min.js");
        await import(src);

        const MODEL_URL = chrome.runtime.getURL('../models')


        await Promise.all([
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ])

        const style = 'color: blue; font-weight: bold'
        // const src = chrome.runtime.getURL("../modules/face-api.js");
        // await import(src);

        const seenImages = []

        window.onmessage = (e) => {
                if (typeof Array.isArray(e.data) && e.data.length == 2) {
                        document.body.insertAdjacentHTML('beforeend', e.data[0])
                        console.log(`%cNow ifr has ${document?.images.length} images`, style)
                        let image = document.images[document.images.length - 1]
                        console.log(`%creceived: ${e.data[0]}`, style)
                        // console.log('image is ', image)
                        image.crossOrigin = 'anonymous'
                        // // let canvas = document.createElement('canvas')
                        // // document.body.appendChild(canvas)
                        let displaySize = { width: image.width, height: image.height }
                        console.log('display size', displaySize)
                        // faceapi.matchDimensions(canvas, displaySize)
                        try {
                                image.onload = async () => {
                                        console.log('inference on', image)
                                        let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withAgeAndGender()
                                        console.log(`%cimage size after load ${image.width} ${image.height}`, 'color: green; font-weight: bold; font-size:1.5em')
                                        console.log('full face descriptions', fullFaceDescriptions)
                                        let resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize)
                                        if (resizedDetections.length > 0) {
                                                console.log('%cdetected some face!', 'color: green; font-weight: bold; font-size:1.5em')
                                                console.log('resized detections', resizedDetections)
                                        }
                                        parent.postMessage([resizedDetections, e.data[1]], '*')
                                        // faceapi.draw.drawDetections(canvas, resizedDetections)
                                        // let ctx = canvas.getContext('2d')
                                        // ctx.fillStyle = "black";
                                        // image.style.display = ''
                                        // for (let detection of resizedDetections) {
                                        //         let box = detection.detection.box
                                        //         if (detection.gender === 'male') {
                                        //                 console.log('gender is male')
                                        //         }
                                        //         ctx.fillRect(box.x, box.y, box.width, box.height);
                                        //         // ctx.fillRect(0, 0 , canvas.width, canvas.height)
                                        //         console.log(fullFaceDescriptions)
                                        //         console.log('coordinates', box.x, box.y)
                                        //         console.log('canvas width and height', canvas.width, canvas.height)
                                        //         console.log('image width and height', image.width, image.height)
                                        //         // console.log('wrapper width and height', wrapper.width, wrapper.height)
                                        //         console.log('box width and height', box.width, box.height)
                                        // }
                                }
                        } catch (err) {
                                console.log(err)
                        }
                }
        };

})()



