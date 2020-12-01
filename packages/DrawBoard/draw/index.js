export let status = {
  DRAWING:'DRAWING',
  MOVING:'MOVING',
  UPDATING:'UPDATING',
  DEFAULT:'DEFAULT'
}

export let supportedGraphics = {
  RECTANGLE:'rectangle',
  POLYLINE:'polyline',
  POLYGON:'polygon'
}

/**
 * drawing grid.
 */
export function generateGrid(canvas, color, stepx, stepy) {
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log('canvas is not exist');
    return;
  }
  ctx.save();
  //Canvas 2D API 通过将当前状态放入栈中，保存 canvas 全部状态的方法。
  //稍后你就可以使用默认的设置绘制一个矩形。
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = color;

  for (var i = stepx + 0.5; i < canvas.width; i += stepx) {
    ctx.beginPath();
    //通过清空子路径列表开始一个新路径的方法。 当你想创建一个新的路径时，调用此方法。
    ctx.moveTo(i, 0);
    //将一个新的子路径的起始点移动到(x，y)坐标的方法。
    ctx.lineTo(i, canvas.height);
    //使用直线连接子路径的终点到x，y坐标的方法（并不会真正地绘制）。
    ctx.stroke();
    //使用 beginPath() 绘制路径的起始点， 使用 moveTo()移动画笔， 使用 stroke() 方法真正地画线。
  }

  for (var i = stepy + 0.5; i < canvas.height; i += stepy) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  ctx.restore();
}


/**
 * draw the Navigation Line.
 * @param {*} canvas 
 * @param {*} x 
 * @param {*} y 
 */
export function drawNavigationLine(canvas, x, y) {
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log('canvas is not exist');
    return;
  }
  ctx.save();
  ctx.strokeStyle = "#2af598";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(canvas.width, y + 0.5);
  ctx.stroke();
  ctx.restore();
}