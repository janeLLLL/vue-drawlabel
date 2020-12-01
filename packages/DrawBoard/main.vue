<template>
  <div class="container">
    <div class="drawboard" ref="drawboard">
      <div class="center">
        <div class="topBar">
          <topBar
            :currentStatus="currentStatus"
            :isFocus="isFocus"
            :resultData="resultData"
            @topBarEvent="topBarEvent"
            @configChange="configChange"
          ></topBar>
        </div>
        <div class="wrapper">
          <!-- <div class="tools">
            <tool @toolSelected="toolSelected"></tool>
          </div> -->
          <div
            class="view"
            ref="view"
            v-loading="loading"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <canvas id="image" ref="image" class="canvas"> </canvas>
            <canvas
              id="canvas"
              ref="canvas"
              class="canvas"
              @mousedown="canvasMousedown"
              >The browser does not support canvas</canvas
            >
          </div>
        </div>
        <div class="bottomBar">
          <slot name="bottomBar"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  generateImage,
  windowToCanvas,
  canvasToImage,
  imageToCanvas,
  fullScreen,
  exitScreen,
} from "./utils/index";
import { status, generateGrid, drawNavigationLine } from "./draw/index";
import figureFactory from "./draw/figureFactory.js";
import topBar from "./components/topBar";
import tool from "./components/tool";
import imageEvent from "./draw/imageEvent.js";
export default {
  name: "drawboard",
  components: {
    topBar,
    tool,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    point: {
      type: Object,
      required: false,
    },
    locationDetile: {
      type: Object,
      required: true,
    },
    isFocus: {
      type: Boolean,
      required: true,
    },
    labelDataOrigin: {
      type: Array,
      default: () => [],
    },
    loadingData: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imagePosX: 0,
      imagePosY: 0,
      imageXOffset: 0,
      imageYOffset: 0,
      imageWidth: 0,
      imageHeight: 0,
      imageScale: 0,
      scale: 1,
      degree: 3600,
      viewHeight: 0,
      viewWidth: 0,
      canvas: null,
      image: null,
      drawboard: null,
      view: null,
      mouseStartPoint: null,
      mouseEndPoint: null,
      lastMouseEndPoint: null,
      currentPoint: null,
      currentTool: "",
      graphics: [],
      graphicsCopy: [],
      resultData: [],
      activeGraphic: null,
      activeIndex: -1,
      pointIndex: -1,
      options: {},
      currentStatus: status.UPDATING, // DRAWING/MOVING/UPDATING
      observer: null,
      isFullScreen: false,
      loading: true,
      //自己画的框合集
      rectar: [],
      xxx: 0,
      yyy: 0,
      //自定义的拖拽状态
      isMove: false,
      chosePoint: [],
      imgWidth: 0,
      imgHight: 0,
      isMounted: false,
      lastPoint: {},
      imgWidthRe: 0,
      imgHeightRe: 0,
    };
  },
  computed: {
    convertParams() {
      return {
        imagePosX: this.imagePosX,
        imagePosY: this.imagePosY,
        viewWidth: this.viewWidth,
        viewHeight: this.viewHeight,
        imageXOffset: this.imageXOffset,
        imageYOffset: this.imageYOffset,
        imageScale: this.imageScale,
        scale: this.scale,
        degree: this.degree,
      };
    },
  },
  watch: {
    graphics: {
      handler() {
        this.graphics.forEach((figure) => {
          let tmpFigure = {};
          tmpFigure.type = figure.type;
          tmpFigure.points = [];
          for (let i = 0; i < figure.points.length; i++) {
            tmpFigure.points[i] = canvasToImage(
              figure.points[i].x,
              figure.points[i].y,
              this.imagePosX,
              this.imagePosY,
              this.viewWidth,
              this.viewHeight,
              this.imageXOffset,
              this.imageYOffset,
              this.imageScale,
              this.scale,
              this.degree
            );
          }
          this.resultData.push(tmpFigure);
        });
        this.$emit("updateData", this.resultData);
      },
      deep: true,
      immediate: true,
    },
    locationDetile: {
      handler() {
        if (Object.keys(this.locationDetile).length !== 0) {
          var that = this;
          this.clearAll1();
          setTimeout(function () {
            that.drawAll();
            that.drawOnePoint();
          }, 800);
          this.lastPoint = [];
          this.point = [];
        } else {
        }
      },
      deep: true,
      immediate: true,
    },
    url: {
      handler() {
        console.log("loading", this.loading);
        this.loading = true;
        if (this.url) {
          this.loadImage(this.url);
        }
      },
      immediate: true,
    },
    isFocus: {
      handler() {
        if (this.isFocus) {
          console.log("is", this.isFocus);
          this.activeIndex = -1;
          this.readyForNewEvent("draw");
        } else {
        }
      },
      immediate: true,
    },
    point: {
      handler() {
        if (Object.keys(this.point).length !== 0) {
          if (this.point !== this.lastPoint) {
          } else {
          }
          this.lastPoint = this.point;
          this.drawAll();
          this.updatePoint();
          this.drawGraphics();
        } else {
          console.log('nihao')
          this.clearAll1()
          this.drawAll();
          this.drawBG();
          this.currentStatus = status.MOVING;
        }
      },
      deep: true,
      immediate: true,
    },
    labelDataOrigin: {
      handler() {
        this.loadImage(this.url);
      },
      immediate: true,
      deep: true,
    },
    loadingData: {
      handler() {
        this.loading = this.loadingData;
      },
      immediate: true,
    },
  },
  mounted() {
    // this.loading = true;
    this.initSize();
    this.observerView();
    this.canvas.addEventListener(
      "mousemove",
      this.drawNavigationLineEvent,
      false
    );
    var that = this;
    window.onresize = () => {
      return (() => {
        if (this.url) {
          this.clearAll1();
          this.loading = true;
          this.loadImage(this.url);
          that.drawOnePoint();
        }
        this.image.style.transform =
          "scale(1, 1) translate(0px, 0px) rotateZ(3600deg)";
        this.clearAll1();
        setTimeout(function () {
          that.drawAll();
          that.drawOnePoint();
        }, 800);
      })();
    };
    if (!this.isMounted) {
      setTimeout(function () {
        that.drawOnePoint();
      }, 900);
    }
  },
  beforeDestroy() {
    this.canvas.removeEventListener("mousemove", this.canvasMousemove, false);
    this.canvas.removeEventListener("mouseup", this.canvasMouseup, false);
    document.removeEventListener("keydown", this.keydownEvent, false);
    this.observer.disconnect();
  },
  methods: {
    drawOnePoint() {
      for (var i = 0; i < this.graphics.length; i++) {
        if (this.graphics[i].x + "" != "NaN") {
          this.graphics[i].drawPoints(this.canvasCtx);
          this.activeIndex = i;
          this.currentStatus = status.UPDATING;
          this.drawBG();
          this.drawGraphics();
          break;
        }
      }
    },
    //转换点
    transPoint(x, y) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.getElementById("image");
      const ctx1 = img.getContext("2d");
      return {
        x: x * this.imageScale + this.imagePosX,
        y: y * this.imageScale + this.imagePosY,
      };
    },
    //判断点是否在框内
    updatePoint() {
      console.log("this.graphics", this.graphics, this.point);
      for (let i = 0; i < this.graphics.length; i++) {
        if (
          this.graphics[i].isInPath(
            this.canvasCtx,
            this.transPoint(this.point.location[0], this.point.location[1])
          ) > -1
        ) {
          this.canvas.style.cursor = "crosshair";
          this.activeGraphic = this.graphics[i];
          console.log("activeIndex", this.activeIndex);
          this.activeIndex = i;
          this.currentStatus = status.UPDATING;
          this.drawBG();
          // this.drawGraphics();
          break;
        }
      }
    },
    //统一画框
    drawAll() {
      this.image.style.transform =
        "scale(1, 1) translate(0px, 0px) rotateZ(3600deg)";
      this.clearAll1();
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.getElementById("image");
      const ctx1 = img.getContext("2d");
      this.imgWidthRe = this.locationDetile.imgSize.width;
      this.imgHightRe = this.locationDetile.imgSize.height;
      const offetX = this.canvas.width - this.imgWidth; //图片偏移量
      const offetY = img.scrollHeight - canvas.offsetHeight; //图片偏移量
      for (let key in this.locationDetile) {
        if (key !== "imgSize" && this.locationDetile[key] !== "Null") {
          const firstPoint = {
            x: this.locationDetile[key][0] * this.imageScale + this.imagePosX,
            y: this.locationDetile[key][1] * this.imageScale + this.imagePosY,
          };
          const rectSize = {
            w:
              (this.locationDetile[key][2] - this.locationDetile[key][0]) *
              this.imageScale,
            h:
              (this.locationDetile[key][5] - this.locationDetile[key][1]) *
              this.imageScale,
          };
          this.activeGraphic = figureFactory(
            this.currentTool,
            { x: firstPoint.x, y: firstPoint.y },
            this.options
          );
          this.activeGraphic.points = [
            { x: firstPoint.x, y: firstPoint.y },
            { x: firstPoint.x + rectSize.w, y: firstPoint.y },
            { x: firstPoint.x + rectSize.w, y: firstPoint.y + rectSize.h },
            { x: firstPoint.x, y: firstPoint.y + rectSize.h },
          ];
          this.graphics.push(this.activeGraphic);
          this.activeIndex = this.graphics.length - 1;
          this.activeGraphic.drawMyPoint(ctx, firstPoint, rectSize);
        }
      }
      this.drawBG();
      this.drawGraphics();
      this.loading = false;
    },
    //画框
    drawG() {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.getElementById("image");
      const ctx1 = img.getContext("2d");
      var width1 = this.point[this.point.length - 2];
      var height1 = this.point[this.point.length - 1];
      const scale1 = canvas.offsetHeight / height1; //原图和现图的比例
      const scale2 = canvas.offsetWidth / width1;
      const offetX = img.scrollWidth - canvas.offsetWidth; //图片偏移量
      const offetY = img.scrollHeight - canvas.offsetHeight; //图片偏移量
      const firstPoint = {
        x: this.point[0] * this.scale * scale2 - offetX,
        y: this.point[1] * this.scale * scale1 - offetY,
      };
      const rectSize = {
        w: (this.point[2] - this.point[0]) * this.scale * scale2,
        h: (this.point[5] - this.point[1]) * this.scale * scale1,
      };
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(firstPoint.x, firstPoint.y, rectSize.w, rectSize.h);
    },
    initSize() {
      this.canvas = this.$refs.canvas;
      this.image = this.$refs.image;
      this.canvasCtx = this.canvas.getContext("2d");
      this.imageCtx = this.image.getContext("2d");
      this.drawboard = this.$refs.drawboard;
      this.view = this.$refs.view;
      this.viewHeight = this.view.offsetHeight;
      this.viewWidth = this.view.offsetWidth;
      this.image.setAttribute("height", this.viewHeight);
      this.image.setAttribute("width", this.viewWidth);
      this.canvas.setAttribute("height", this.viewHeight);
      this.canvas.setAttribute("width", this.viewWidth);
    },
    observerView() {
      this.observer = new ResizeObserver(this.initSize);
      this.observer.observe(this.view);
    },
    getImageInfo(x, y, width, height, scale) {
      this.imagePosX = Math.round(x);
      this.imagePosY = Math.round(y);
      this.imageWidth = width;
      this.imageHeight = height;
      this.imageScale = scale;
      // this.loading = false;
      if (this.labelDataOrigin) {
        this.initRenderData(this.labelDataOrigin);
      }
      this.readyForNewEvent("update");
    },
    async loadImage(url) {
      this.loading = true;
      if (this.image) {
        await generateImage(this.image, this.getImageInfo, url);
      } else {
        await this.$nextTick(() =>
          generateImage(this.image, this.getImageInfo, url)
        );
      }
      this.loading = true;
    },
    initRenderData(data) {
      this.graphics = [];
      let initGraphics = JSON.parse(JSON.stringify(data));
      initGraphics.forEach((figure, index) => {
        let type = figure.name || figure.type;
        let tmpfigure = figureFactory(type, figure.points[0]);
        tmpfigure.points = [];
        figure.points.forEach((point, index) => {
          tmpfigure.points[index] = imageToCanvas(
            point.x,
            point.y,
            this.imagePosX,
            this.imagePosY,
            this.viewWidth,
            this.viewHeight,
            this.imageXOffset,
            this.imageYOffset,
            this.imageScale,
            this.scale,
            this.degree
          );
        });
        this.graphics.push(tmpfigure);
      });
      this.drawBG();
      this.drawGraphics();
    },
    topBarEvent(eventName) {
      switch (eventName) {
        case "zoomIn":
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "zoomOut":
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "rotateRight":
          this.degree = imageEvent.rotateRight(
            this.graphics,
            this.convertParams
          );
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "rotateLeft":
          this.degree = imageEvent.rotateLeft(
            this.graphics,
            this.convertParams
          );
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "move":
          this.readyForNewEvent("move");
          break;
        case "clearAll":
          this.clearAll();
          break;
        case "fullScreen":
          if (this.isFullScreen) {
            exitScreen(this.drawboard);
            this.isFullScreen = false;
          } else {
            fullScreen(this.drawboard);
            this.isFullScreen = true;
          }
          break;
        case "rectangle":
          this.currentTool = "rectangle";
          this.readyForNewEvent("draw");
          this.canvas.style.cursor = "crosshair";
          break;
        default:
          break;
      }
    },
    toolSelected(toolName) {
      this.currentTool = toolName;
      this.readyForNewEvent("draw");
    },
    configChange(config) {
      this.options = config;
      if (this.canvasCtx) {
        this.drawBG();
        this.drawGraphics();
        // this.readyForNewEvent("move");
      }
    },
    clearAll() {
      const ctx = canvas.getContext("2d");
      console.log("i的值为", this.activeIndex);
      if (this.graphics[this.activeIndex]) {
        var p = this.graphics[this.activeIndex].points;
        console.log(
          "坐标点",
          this.graphics[this.activeIndex].points,
          p[1].x - p[0].x,
          p[2].y - p[0].y
        );
        this.graphics.splice(this.activeIndex, 1);
        ctx.clearRect(
          p[0].x - 5,
          p[0].y - 5,
          p[1].x - p[0].x + 10,
          p[2].y - p[0].y + 10
        );
        this.drawGraphics();
      }
    },
    async clearAll1() {
      this.drawBG();
      this.graphics = [];
      await this.drawBG();
      this.readyForNewEvent("update");
    },
    // Initialize the canvas
    drawBG() {
      const img = document.getElementById("image");
      const ctx1 = img.getContext("2d");
      this.canvasCtx.clearRect(0, 0, this.viewWidth, this.viewHeight);
      ctx1.clearRect(0, 0, ctx1.width, ctx1.height);
      // this.canvasCtx.clearRect(0, 0, this.viewWidth, this.viewHeight);
      // // console.log('drawBG():options',this.options)
      // if (this.options.grid) {
      //   generateGrid(this.canvas, "lightGray", 10, 10);
      // }
    },
    // draing画画
    drawGraphics() {
      // console.log("所有点坐标3",this.graphics)
      this.graphics.forEach((graphic, index) => {
        graphic.draw(this.canvasCtx); //在画布上画画
        if (
          this.activeIndex === index &&
          this.currentStatus === status.UPDATING
        ) {
          // console.log("点坐标",graphic)
          graphic.drawPoints(this.canvasCtx);
        }
        if (this.options.guid) {
          drawNavigationLine(
            this.canvas,
            this.currentPoint.x,
            this.currentPoint.y
          );
        }
      });
    },
    drawNavigationLineEvent(e) {
      this.drawBG();
      this.drawGraphics();
      if (this.options.guid) {
        console.log("111");
        this.currentPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
        drawNavigationLine(
          this.canvas,
          this.currentPoint.x,
          this.currentPoint.y
        );
      }
    },
    canvasMousedown(e) {
      if (this.currentStatus === status.DEFAULT) return;
      this.mouseStartPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
      this.lastMouseEndPoint = this.mouseStartPoint;
      this.canvas.addEventListener("mousemove", this.canvasMousemove, false);
      this.canvas.addEventListener("mouseup", this.canvasMouseup, false);
      const img = document.getElementById("image");
      const ctx1 = img.getContext("2d");
      document.addEventListener("keydown", this.keydownEvent, false);
      console.log("标注了", this.activeGraphic, this.currentStatus);
      if (this.currentStatus === status.DRAWING) {
        if (this.activeGraphic == null) {
          for (let i = 0; i < this.graphics.length; i++) {
            // updating
            //修改自己画的框
            if (
              this.graphics[i].isInPath(this.canvasCtx, this.mouseStartPoint) >
              -1
            ) {
              this.canvas.style.cursor = "crosshair";
              this.activeGraphic = this.graphics[i];
              this.activeIndex = i;
              this.currentStatus = status.UPDATING;
              break;
            }
          }
          if (this.isFocus) {
            if (this.currentStatus === status.DRAWING) {
              this.activeGraphic = figureFactory(
                this.currentTool,
                this.mouseStartPoint,
                this.options
              );
              this.graphics.push(this.activeGraphic);
              this.activeIndex = this.graphics.length - 1;
              this.canvas.style.cursor = "crosshair";
            }
          }
        } else {
          console.log("鼠标", this.mouseStartPoint);
          if (["polygon", "polyline"].includes(this.currentTool)) {
            if (
              this.activeGraphic.triggerEndCondition(
                this.canvasCtx,
                this.mouseStartPoint
              )
            ) {
              this.readyForNewEvent("draw");
              this.drawBG();
              this.drawGraphics();
            } else {
              console.log(
                '["polygon", "polyline"].includes(this.currentTool),this.activeGraphic',
                this.activeGraphic
              );
              this.activeGraphic.points.push(this.mouseStartPoint);
            }
          }
        }
      } else if (this.currentStatus === status.UPDATING) {
        // if (
        //   this.graphics[this.activeIndex].isInPath(
        //     this.canvasCtx,
        //     this.mouseStartPoint
        //   ) === -1
        // ) {
        //   this.readyForNewEvent("move");
        //   // this.activeIndex = ''
        // }
        for (let i = 0; i < this.graphics.length; i++) {
          // 选中控制点后拖拽修改图形
          if (
            this.graphics[i].isInPath(this.canvasCtx, this.mouseStartPoint) > -1
          ) {
            this.canvas.style.cursor = "crosshair";
            this.activeGraphic = this.graphics[i];
            this.activeIndex = i;
            this.currentStatus = status.UPDATING;
            break;
          }
        }
        console.log("?????", this.activeGraphic);
        this.pointIndex = this.activeGraphic.isInPath(
          this.canvasCtx,
          this.mouseStartPoint
        );
      }
    },
    canvasMousemove(e) {
      this.mouseEndPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
      //自定义的框拖拽
      if (this.currentStatus === status.MOVING) {
        let translateX =
          this.imageXOffset + (this.mouseEndPoint.x - this.mouseStartPoint.x);
        let translateY =
          this.imageYOffset + (this.mouseEndPoint.y - this.mouseStartPoint.y);
        let tmpConvertParams = JSON.parse(JSON.stringify(this.convertParams));
        let tmpGraphics = imageEvent.formatPointsInImageWhenMove(
          this.graphics,
          tmpConvertParams
        );
        this.image.style.transform = `scale(${this.scale},${this.scale}) translate(${translateX}px,${translateY}px) rotateZ(${this.degree}deg)`;
        tmpConvertParams.imageXOffset = translateX;
        tmpConvertParams.imageYOffset = translateY;
        imageEvent.formatPointsInCanvasWhenMove(tmpGraphics, tmpConvertParams);
        this.drawBG();
        imageEvent.drawTmpGraphics(tmpGraphics, this.canvasCtx);
      } else if (this.currentStatus === status.UPDATING && this.activeGraphic) {
        this.drawBG();
        this.drawGraphics();
        if (this.pointIndex > -1) {
          if (this.pointIndex === 999) {
            console.log("这个");
            this.activeGraphic.move(this.lastMouseEndPoint, this.mouseEndPoint);
            this.lastMouseEndPoint = this.mouseEndPoint;
          } else {
            this.activeGraphic.update(this.pointIndex, this.mouseEndPoint);
          }
        }
      } else if (this.currentStatus === status.DRAWING && this.activeGraphic) {
        this.drawBG();
        this.drawGraphics();
        if (["polygon", "polyline"].includes(this.currentTool)) {
          let pointIndex = this.activeGraphic.isInPath(
            this.canvasCtx,
            this.mouseEndPoint
          );
          if (pointIndex === 0) {
            this.focusCicle(
              this.canvasCtx,
              this.activeGraphic.points[0],
              this.options.point_lineWidth,
              this.options.point_strokeStyle,
              this.options.point_radis * 2
            );
          }
          this.previewGraphic(
            this.canvasCtx,
            this.activeGraphic,
            this.mouseEndPoint
          );
        } else {
          this.activeGraphic.initFigure(
            this.mouseStartPoint,
            this.mouseEndPoint
          );
        }
      }
    },
    canvasMouseup(e) {
      if (this.currentStatus === status.MOVING) {
        imageEvent.formatPointsInImage(this.graphics, this.convertParams);
        this.imageXOffset += this.mouseEndPoint.x - this.mouseStartPoint.x;
        this.imageYOffset += this.mouseEndPoint.y - this.mouseStartPoint.y;
        imageEvent.formatPointsInCanvas(this.graphics, this.convertParams);
        this.drawBG();
        this.drawGraphics();
        this.updateImage();
        this.readyForNewEvent("move");
      } else if (this.currentStatus === status.UPDATING) {
        if (this.activeGraphic) {
          this.drawBG();
          this.drawGraphics();
        }
        this.readyForNewEvent("update");
      } else if (this.currentStatus === status.DRAWING) {
        //画画
        if (this.activeGraphic) {
          this.drawBG();
          this.drawGraphics();
        }
        if (!["polygon", "polyline"].includes(this.currentTool)) {
          this.readyForNewEvent("draw");
        }
      }
    },
    //画画/移动
    readyForNewEvent(evevt = "move") {
      if (evevt === "draw") {
        this.canvas.style.cursor = "crosshair";
        // this.options.guid = true
        this.activeIndex = -1;
        this.activeGraphic = null;
        this.currentStatus = status.DRAWING;
      } else if (evevt === "move") {
        this.canvas.style.cursor = "move";
        // this.options.guid = false
        this.activeIndex = -1;
        this.activeGraphic = null;
        this.currentStatus = status.MOVING;
      }
      this.canvas.removeEventListener("mousemove", this.canvasMousemove, false);
      this.canvas.removeEventListener("mouseup", this.canvasMouseup, false);
    },
    focusCicle(ctx, point, lineWidth = 2, color = "#999", radis = 10) {
      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radis, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.restore();
    },
    previewGraphic(ctx, graphic, point, fillStyle = "hsla(0,100%,50%,.3)") {
      ctx.save();
      ctx.beginPath();
      graphic.points.forEach((p, i) => {
        ctx[i != 0 ? "lineTo" : "moveTo"](p.x, p.y);
      });
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = graphic.path_strokeStyle;
      ctx.lineWidth = graphic.path_lineWidth;
      ctx.stroke();
      ctx.fillStyle = fillStyle;
      if (graphic.type === "polygon") ctx.fill();
      ctx.restore();
    },
    keydownEvent(e) {
      if (e.keyCode == 13) {
        this.readyForNewEvent("draw");
        this.drawBG();
        this.drawGraphics();
      } else if (e.keyCode == 46) {
        if (this.activeIndex > -1) {
          this.graphics.splice(this.activeIndex, 1);
          this.readyForNewEvent("draw");
          this.drawBG();
          this.drawGraphics();
        }
      }
    },
    deleteFigure(index) {
      if (index > -1) {
        this.graphics.splice(index, 1);
        this.readyForNewEvent("update");
        this.drawBG();
        this.drawGraphics();
      }
    },
    selectedFigure(index) {
      if (index > -1) {
        this.activeIndex = index;
        this.currentStatus = status.UPDATING;
        this.drawBG();
        this.drawGraphics();
      }
    },
    updateImage() {
      this.image.style.transform = `scale(${this.scale},${this.scale}) translate(${this.imageXOffset}px,${this.imageYOffset}px) rotateZ(${this.degree}deg)`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./styles/index.scss";
</style>