/**
 * load image
 * @param {Element} canvas 
 * @param {Function} cb 
 */
export function generateImage(canvas, cb, url) {
  let ctx2 = canvas.getContext("2d");
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  // loading image
  ctx2.save();
  let img = new Image();
  img.src = url;
  let imageWidth, imageHeight, scaleValue, posX, posY;
  img.setAttribute('crossOrigin', 'Anonymous');
  img.onload = function () {
    imageWidth = img.width;
    imageHeight = img.height;
    let scaleValueW = Math.floor((canvas.width) / imageWidth * 100) / 100
    let scaleValueH = Math.floor((canvas.height) / imageHeight * 100) / 100
    scaleValue = Math.min(scaleValueW, scaleValueH)
    posX = (canvas.width - imageWidth * scaleValue) / 2;
    posY = (canvas.height - imageHeight * scaleValue) / 2;
    ctx2.drawImage(
      img,
      0, 0,
      imageWidth, imageHeight,
      posX, posY,
      imageWidth * scaleValue, imageHeight * scaleValue 
    );
    ctx2.restore()
    cb(posX, posY, imageWidth, imageHeight, scaleValue)
  }
  img.onerror = function () {
    console.log('image load failed!');
  }
}


/**
 * Convert point coordinates on screen to coordinates on canvas
 * @param {Object} canvas
 * @param {Number} x coordinate value
 * @param {Number} y coordinate value
 * 
 */
export function windowToCanvas(canvas, x, y) {
  if (!canvas) {
    console.log("canvas is not exist!");
    return {
      x: 0,
      y: 0
    };
  }
  var box = canvas.getBoundingClientRect();
  return {
    x: x - box.left,
    y: y - box.top
  }
}



/**
 * Convert  point coordinates from canvas to image.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} posX 
 * @param {Number} posY 
 * @param {Number} canvasWidth 
 * @param {Number} canvasHeight 
 * @param {Number} imageXOffset 
 * @param {Number} imageYOffset 
 * @param {Number} imageScale 
 * @param {Number} scale 
 * @param {Number} degree 
 */
export function canvasToImage(x, y, posX, posY, canvasWidth, canvasHeight, imageXOffset, imageYOffset, imageScale, scale, degree) {
  let xvar, yvar;
  if (degree % 360 == 0) {
    xvar = x - imageXOffset * scale - canvasWidth * (1 - scale) / 2,
      yvar = y - imageYOffset * scale - canvasHeight * (1 - scale) / 2
  } else if (degree % 360 == 90) {
    xvar = ((y - imageYOffset * scale + (canvasWidth - canvasHeight) / 2) - canvasWidth * (1 - scale) / 2),
      yvar = (((canvasWidth + canvasHeight) / 2 - x + imageXOffset * scale) - canvasHeight * (1 - scale) / 2)
  } else if (degree % 360 == 180) {
    xvar = (canvasWidth - x + imageXOffset * scale) - canvasWidth * (1 - scale) / 2,
      yvar = (canvasHeight - y + imageYOffset * scale) - canvasHeight * (1 - scale) / 2
  } else if (degree % 360 == 270) {
    xvar = ((canvasWidth + canvasHeight) / 2 - y + imageYOffset * scale) - canvasWidth * (1 - scale) / 2,
      yvar = (x - (canvasWidth - canvasHeight) / 2 - imageXOffset * scale) - canvasHeight * (1 - scale) / 2
  }
  return {
    x: Math.round((xvar - posX * scale) / (imageScale * scale)),
    y: Math.round((yvar - posY * scale) / (imageScale * scale))
  }
}



/**
 * Convert  point coordinates from image to canvas.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} posX 
 * @param {Number} posY 
 * @param {Number} canvasWidth 
 * @param {Number} canvasHeight 
 * @param {Number} imageXOffset 
 * @param {Number} imageYOffset 
 * @param {Number} imageScale 
 * @param {Number} scale 
 * @param {Number} degree 
 */
export function imageToCanvas(x, y, posX, posY, canvasWidth, canvasHeight, imageXOffset, imageYOffset, imageScale, scale, degree) {
  let xvar, yvar;
  xvar = x * (imageScale * scale) + posX * scale + canvasWidth * (1 - scale) / 2
  yvar = y * (imageScale * scale) + posY * scale + canvasHeight * (1 - scale) / 2

  if (degree % 360 == 0) {
    x = Math.round(xvar + imageXOffset * scale)
    y = Math.round(yvar + imageYOffset * scale)
  } else if (degree % 360 == 90) {
    x = Math.round((canvasWidth + canvasHeight) / 2 - yvar + imageXOffset * scale)
    y = Math.round(xvar - (canvasWidth - canvasHeight) / 2 + imageYOffset * scale)
  } else if (degree % 360 == 180) {
    x = Math.round(canvasWidth - xvar + imageXOffset * scale)
    y = Math.round(canvasHeight - yvar + imageXOffset * scale)
  } else if (degree % 360 == 270) {
    x = Math.round((canvasWidth - canvasHeight) / 2 + imageXOffset * scale + yvar)
    y = Math.round((canvasWidth + canvasHeight) / 2 + imageYOffset * scale - xvar)
  }
  return {
    x,
    y
  }
}

/**
 * Make the element full screen.
 * @param {Object} obj 
 */
export function fullScreen(obj) {
  if (obj.requestFullscreen) {
    obj.requestFullscreen();
  } else if (obj.webkitRequestFullscreen) {
    obj.webkitRequestFullscreen();
  } else if (obj.mozRequestFullscreen) {
    obj.mozRequestFullscreen();
  }
}

/**
 * Make the element exit full screen.
 * @param {Object} obj 
 */
export function exitScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
}
