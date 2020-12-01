# vue-drawlabel
## 简介

本项目源于[vue2-drawboard](https://github.com/xindoucha/vue2-drawboard)，修改了一些原有的bug，更改了选项配置，以及根据业务需求添加了一些功能。

以下为原NPM包简介：

> 这是一个基于vue2.x的绘制板工具。通过该工具，您可以在图片上标记您想要的信息，并获得相应的数据。此外，您还可以将其作为一个普通的画板来使用，您可以在上面自由地绘制图形。当前支持矩形画图。可以支持放大、缩小、旋转、平移等操作。此外，您可以灵活地配置您的绘图信息。

新增功能有：

1. 传入一个坐标点对象，通过计算，根据输入数据渲染图形
2. 默认在图上画出标注框后，画布状态为修改，并选中第一个标注框
3. 添加一个新增标注标识`isFocus`，当`isFocus`为true时，画布自动切换为新增标注状态，并且在上方显示“标注”图标

## 安装
```sh
npm install vue-drawlabel -S
```

## 使用
```js
import DrawLabel from 'vue-drawlabel'
import 'vue-drawlabel/lib/drawboard.css'
 
Vue.use(DrawLabel);
```

## 例子
```vue
<template>
  <div id="app">
    <drawboard :url="url" @updateData="updateData"></drawboard>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      url:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
    }
  },
  methods:{
    updateData(data){
      console.log(data);
    }
  }
}
</script>
```

## 选项
### url
+ Type: String
+ Required: True
>要编辑的图像的URL
### locationDetile
+ Type: Object
+ Required: False
>根据输入数据渲染图形。数据格式如下：
```json
{
    example1:[
        110,
        220,
        330,
        140,
        150,
        160,
        180,
        300
    ],
    example2:[
        110,
        220,
        330,
        140,
        150,
        160,
        180,
        300
    ]
}
```
### loadingData 
+ Type: Boolean
+ Required: False
+ default: False
> 您可以控制是否显示图像加载动画

### updateData
+ Type: Function
+ Required: True
> 通过这种方法，您可以获得带标签的数据
## Keywords
Drawboard Vue

