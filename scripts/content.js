(async () => {
    const src = chrome.runtime.getURL("../modules/face-api.min.js");
    await import(src);
    console.log('nets is', faceapi.nets)

    const MODEL_URL = chrome.runtime.getURL('../models')

    const helperResource = chrome.runtime.getURL('../iframe-helper/index.html')
    console.log('helper resource is', helperResource)

    await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
    ])

    const ifr = document.createElement('iframe')
    ifr.src = helperResource
    document.body.append(ifr)
    const ifrId = 'bila-fitnah-ifr'
    ifr.setAttribute('id', ifrId)
    ifr.display = 'none'

    console.log('iframe loaded?', document.querySelector(`#${ifrId}`))

    ifr.onload = () => {
        console.log('%ciframe loaded!', 'color: green; font-weight: bold')
        ifr.setAttribute('display', 'none')
        ifr.setAttribute('width', '0')
        ifr.setAttribute('height', '0')
        ifr.setAttribute('tabindex', '-1')
    }


    const seenImages = []
    const numImageMap = new Object()
    var num = 0

    console.log('sending images')
    sendImages(document.images)
    console.log('images sent')

    const mutationObserver = new MutationObserver((mutationRecords) => {
        for (let mutationRecord of mutationRecords) {
            let images = mutationRecord.target.querySelectorAll('img')
            if (images.length > 0) { console.log('new images detected') }
            sendImages(images)
        }
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    window.onmessage = (e) => {
        if (typeof Array.isArray(e.data) && e.data.length === 2 && e.data[1].startsWith('bila-fitnah-')) {
            let [boxes, numKey] = e.data
            console.log('boxes are', boxes)
            let image = numImageMap[numKey]
            // console.log('image is', image)
            let parent = image.parentNode
            let parentStyle = window.getComputedStyle(parent)
            // console.log('parent is', parent)
            let wrapper = document.createElement('div')
            wrapper.height = image.height
            wrapper.width = image.width
            wrapper.style.margin = image.margin
            wrapper.style.padding = image.padding
            console.log('image width and height (0)', image.width, image.height)
            parent.replaceChild(wrapper, image)
            // image.crossOrigin = 'anonymous'
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
            let ctx = canvas.getContext('2d')
            ctx.fillStyle = "black";
            if (image.complete) {
                for (let box of boxes) {
                    console.log('box is', box)
                    // if (detection.gender === 'male') {
                    //     console.log('gender is male')
                    // }
                    ctx.fillRect(box._x, box._y, box._width, box._height);
                    // ctx.fillRect(0, 0 , canvas.width, canvas.height)
                    console.log('coordinates', box.x, box.y)
                    console.log('canvas width and height', canvas.width, canvas.height)
                    console.log('image width and height', image.width, image.height)
                    // console.log('wrapper width and height', wrapper.width, wrapper.height)
                    // console.log('box width and height', box.width, box.height)
                }
            } else {
                image.onload = () => {
                    for (let box of boxes) {
                        console.log('box is', box)
                        // if (detection.gender === 'male') {
                        //     console.log('gender is male')
                        // }
                        ctx.fillRect(box._x, box._y, box._width, box._height);
                        // ctx.fillRect(0, 0 , canvas.width, canvas.height)
                        // console.log(fullFaceDescriptions)
                        console.log('coordinates', box.x, box.y)
                        console.log('canvas width and height', canvas.width, canvas.height)
                        console.log('image width and height', image.width, image.height)
                        // console.log('wrapper width and height', wrapper.width, wrapper.height)
                        // console.log('box width and height', box.width, box.height)
                    }
                }
            }
        }
    }

    // iterate through all images on the page
    // and draw a box around each face
    async function sendImages(images) {
        for (let image of images) {
            if (!seenImages.includes(image)) {
                seenImages.push(image)
                ++num
                try {
                    await waitForElement(`#${ifrId}`)
                    let numKey = 'bila-fitnah-' + num
                    numImageMap[numKey] = image
                    let message = {
                        outerHTML: image.outerHTML,
                        numKey,
                        clientWidth: image.clientWidth,
                        clientHeight: image.clientHeight,
                    }
                    if (image.complete) {
                        ifr.contentWindow.postMessage(message, '*');
                    } else {
                        image.onload = () => {
                            ifr.contentWindow.postMessage(message, '*');
                        }
                    }

                } catch (err) {
                    console.log(err)
                }
            } else {
                console.log('image already seen')
            }
        }
    }

    console.log('face recognition app loaded!')
})()


/**
 * Wait for an element before resolving a promise
 * @param {String} querySelector - Selector of element to wait for
 * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout              
 */
function waitForElement(querySelector, timeout = 0) {
    const startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            if (document.querySelector(querySelector)) {
                clearInterval(timer);
                resolve();
            } else if (timeout && now - startTime >= timeout) {
                clearInterval(timer);
                reject();
            }
        }, 100);
    });
}


// const computedStyle = window.getComputedStyle(existingElement);

// // Create the new element
// const newElement = document.createElement('div');

// // Loop through the computed style properties and apply them to the new element
// for (const prop of computedStyle) {
//   newElement.style[prop] = computedStyle[prop];
// }


// https://stackoverflow.com/questions/63211384/failed-to-execute-teximage2d-on-webgl2renderingcontext-access-to-image-at
// https://stackoverflow.com/questions/50159999/chrome-extension-uncaught-domexception-blocked-a-frame-with-origin-from-acces
// https://stackoverflow.com/questions/53853289/blocked-cross-origin-frame-in-chrome-extension
