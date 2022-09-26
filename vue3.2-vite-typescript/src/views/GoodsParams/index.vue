<template>
  <div>
    <el-alert
      title="ailabel图形标注的使用"
      type="warning"
      show-icon
      :closable="false"
    >
    </el-alert>
    <div class="home">
      <div id="map" class="img"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import AILabel from "ailabel";
import { ElMessageBox, ElMessage, ElSelect } from "element-plus";
import {
  defineComponent,
  ref,
  computed,
  reactive,
  toRefs,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";
let data = reactive({
  mode: "", //操作
  imgUrl: "", //图片地址
  drawingStyle: {}, //图形样式
  editId: "", //待填充图形id
  deleteIconId: "delete01",
  gMap: null, //AILabel实例
  gFirstFeatureLayer: null, //矢量图层实例(矩形，多边形等矢量)
  gFirstTextLayer: null, //文字图层实列
  allFeatures: null, //所有features
  index: -1, //id编号
  dbData: {}, //当前双击选择的泳道，条带或者矩形
  zoom: 100, //默认缩放比例
  Showbottom: false, //显示底部
});
//获取图片并渲染
const getMyimg = (img: any, arr: any) => {
  if (!img) {
    return;
  }
  data.gMap && (data.gMap as any).destroy(); //先销毁
  let newImage = new Image();
  newImage.src = img;
  let width;
  let height;
  // newImage.onload = () => {
  // 输出图片信息 获取图片宽高
  width = newImage.width;
  height = newImage.height;
  // }
  data.imgUrl = img;
  const gMap = new AILabel.Map("map", {
    center: { x: 450, y: 20 }, // 为了让图片居中
    zoom: 1000,
    mode: "PAN", // 绘制线段
    refreshDelayWhenZooming: true, // 缩放时是否允许刷新延时，性能更优
    zoomWhenDrawing: true,
    panWhenDrawing: true,
    zoomWheelRatio: 5, // 控制滑轮缩放缩率[0, 10), 值越小，则缩放越快，反之越慢
    withHotKeys: true, // 关闭快捷键
  });
  data.gMap = gMap;
  // 图片层添加
  const gFirstImageLayer = new AILabel.Layer.Image(
    "first-layer-image", // id
    {
      src: data.imgUrl,
      width: width,
      height: height,
      crossOrigin: false, // 如果跨域图片，需要设置为true
      position: {
        // 左上角相对中心点偏移量
        x: 0,
        y: 0,
      },
      // 网格
      // grid: {
      //   // 3 * 3
      //   columns: [{ color: "#9370DB" }, { color: "#FF6347" }],
      //   rows: [{ color: "#9370DB" }, { color: "#FF6347" }],
      // },
    }, // imageInfo
    { name: "第一个图片图层" }, // props
    { zIndex: 5 } // style
  );
  // 添加到gMap对象
  gMap.addLayer(gFirstImageLayer);
  // 添加矢量图层
  const gFirstFeatureLayer = new AILabel.Layer.Feature(
    "first-layer-feature", // id
    { name: "第一个矢量图层" }, // props
    { zIndex: 10 } // style
  );
  //添加文字图层
  const gFirstTextLayer = new AILabel.Layer.Text(
    "first-layer-text", // id
    { name: "第一个文本图层" }, // props
    { zIndex: 12, opacity: 1 } // style
  );
  gMap.addLayer(gFirstTextLayer); //文字图层
  gMap.addLayer(gFirstFeatureLayer); //图形图层
  data.gFirstTextLayer = gFirstTextLayer;
  data.gFirstFeatureLayer = gFirstFeatureLayer;
  window.onresize = function () {
    data.gMap && (data.gMap as any).resize();
  };
  addEvent(gFirstFeatureLayer, gFirstTextLayer); //监听
  if (arr && arr.length > 0) {
    //如果父页面需要回显
    (arr as any).forEach((element: any) => {
      element.shape.gFirstFeatureLayer = data.gFirstFeatureLayer;
      element.shape.gMap = data.gMap;
      element.shape.gFirstTextLayer = data.gFirstTextLayer;
      setDrawingStyle(element.type);
      addFeature(element.shape, element.type, element.id, data.gMap);
    });
  }
};
//获取比例
const getmyScale = () => {
  return (data.gMap as any).getScale();
};
//清除所有
const removeAll = () => {
  data.index = -1;
  data.dbData = {};
  (data.gFirstTextLayer as any).removeAllTexts();
  (data.gFirstFeatureLayer as any).removeAllFeatures();
  (data.gMap as any).markerLayer.removeAllMarkers();
};
//自动或者手动添加泳道
const getdata = (arr: any, item: any, type: any) => {
  if (arr.length > 0) {
    arr.forEach((element: any) => {
      setDrawingStyle(type); //定义样式
      let list = {
        gFirstFeatureLayer: data.gFirstFeatureLayer,
        gFirstTextLayer: data.gFirstTextLayer,
        gMap: data.gMap,
      };
      list = { ...list, ...element };
      let id = getid(); //id
      addFeature(list, type, id, data.gMap); //添加
    });
  }
};
// 初始样式
const setDrawingStyle = (mode: any) => {
  let drawingStyle = {};
  switch (mode) {
    //平移
    case "PAN": {
      break;
    }
    //矩形
    case "RECT": {
      drawingStyle = { strokeStyle: "#ff0000", lineWidth: 1 };
      (data.gMap as any).setDrawingStyle(drawingStyle);
      break;
    }
    //线段
    case "LINE": {
      drawingStyle = {
        strokeStyle: "#ff0000",
        lineJoin: "arround",
        lineCap: "arround",
        lineWidth: 2,
        arrow: false,
      };
      (data.gMap as any).setDrawingStyle(drawingStyle);
      break;
    }
    default:
      break;
  }
  return drawingStyle;
};
//点击新建图形  mode为类型
const propEvent = (mode: any) => {
  data.mode = mode;
  data.drawingStyle = setDrawingStyle(mode);
  (data.gMap as any).setMode(mode);
};
function addFeature(data: any, type: any, id, gMap: any) {
  // 添加图形
  let drawingStyle = gMap.drawingStyle;
  data.gMap = gMap;
  //矩形
  if (type === "RECT") {
    const rectFeature = new AILabel.Feature.Rect(
      "rectangle" + id, // id
      data, // shape
      { name: id }, // props
      drawingStyle // style
    );
    data.gFirstFeatureLayer.addFeature(rectFeature);
  } //线
  else if (type === "LINE") {
    const scale = (data.gMap as any).getScale();
    const width = drawingStyle.lineWidth / scale;
    const lineFeature = new AILabel.Feature.Line(
      "LINE" + id, // id
      { ...data, width }, // shape
      { name: id }, // props
      drawingStyle // style
    );
    data.gFirstFeatureLayer.addFeature(lineFeature);
  }
  getFeatures();
}
// 获取所有features
const getFeatures = () => {
  data.allFeatures = (data.gFirstFeatureLayer as any).getAllFeatures();
  // emit("getFeatures", data.allFeatures); //结果返回到父页面  作为图标限制
};
//删除对应的feature
const delonefeature = (feature: any) => {
  data.index -= 1(
    // 删除对应text
    data.gFirstTextLayer as any
  ).removeTextById(feature.id);
  // 删除对应feature
  (data.gFirstFeatureLayer as any).removeFeatureById(feature.id);
  (data.gMap as any).markerLayer.removeAllMarkers();
  // emit("delcomplete"); //删除完毕
};
// 增加删除图标
const addDeleteIcon = (feature: any, shape: any) => {
  let gMap: any = data.gMap;
  // 添加delete-icon
  // let points = that.getPoints(feature);
  const gFirstMarker = new AILabel.Marker(
    data.deleteIconId, // id
    {
      src: "https://s1.aigei.com/src/img/png/45/45aabfc232a34e5b9bfaf75412973c08.png?|watermark/3/image/aHR0cHM6Ly9zMS5haWdlaS5jb20vd2F0ZXJtYXJrLzUwMC0xLnBuZz9lPTE3MzU0ODgwMDAmdG9rZW49UDdTMlhwemZ6MTF2QWtBU0xUa2ZITjdGdy1vT1pCZWNxZUpheHlwTDpjYWQ1NHVoRlhGUUViSGR3Vm02aXctVTJoWVE9/dissolve/40/gravity/NorthWest/dx/18/dy/21/ws/0.0/wst/0&e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:C11LKqsRLbAqQo2uVPETYDya0QU=",
      position: { x: shape.x + shape.width, y: shape.y - 15 }, // 矩形右上角 根据图形动态调整
      offset: {
        x: -20,
        y: -4,
      },
    }, // markerInfo
    { name: "delete" } // props
  );
  gFirstMarker.events.on("click", (marker: any) => {
    data.index -= 1;
    // 首先删除当前marker
    gMap.markerLayer.removeMarkerById(marker.id);
    // 删除对应text
    (data.gFirstTextLayer as any).removeTextById(feature.id);
    // 删除对应feature
    (data.gFirstFeatureLayer as any).removeFeatureById(feature.id);
  });
  gMap.markerLayer.addMarker(gFirstMarker);
};
// 删除 删除按钮
const deIcon = () => {
  (data.gMap as any).markerLayer.removeAllMarkers();
};
//给矩形框赋id  为唯一识别号
const getid = () => {
  data.Index = Math.random();
  return data.Index;
};
//因为官方暂不支持小范围选中，所以这里需要重新计算框位置是否在双击范围内，主要是通过判断当前坐标是否在某个图形上或最靠近，来选中当前坐标最近的图形
const isRangeIn = (obj: any, list: any) => {
  let arr: any = [];
  for (let index = 0; index < list.length; index++) {
    const item = list[index];
    let num: number = 0;
    const x = Math.round(obj.global.x);
    const y = Math.round(obj.global.y);
    const shapeX = item.shape.x; //矩形x坐标
    const shapeY = item.shape.y + item.shape.height; //矩形y坐标+高度
    const width = item.shape.width;
    const height = item.shape.height;
    if (item.type === "LINE") {
      const startX =
        item.shape.start.x < item.shape.end.x
          ? item.shape.start.x
          : item.shape.end.x;
      const startY =
        item.shape.start.y < item.shape.end.y
          ? item.shape.start.y
          : item.shape.end.y;
      const endX =
        item.shape.end.x > item.shape.start.x
          ? item.shape.end.x
          : item.shape.start.x;
      const endY =
        item.shape.end.y > item.shape.start.y
          ? item.shape.end.y
          : item.shape.start.y;
      let f = x >= startX && x <= endX && y >= startY && y <= endY;
      console.log(x, startX, endX, y, startY, endY, item.id, f);
      if (f) {
        num = 1;
      }
    } else {
      let f =
        x >= shapeX &&
        x <= shapeX + width &&
        y < shapeY &&
        y >= shapeY - height;
      if (f) {
        num = shapeX + width - x;
      }
      // console.log(
      //   x >= shapeX,
      //   x <= shapeX + width,
      //   (y<shapeY, y> = shapeY - height)
      // );
    }
    if (num > 0) {
      (arr as any).push({
        num: num,
        item: item,
      });
    }
  }
  return arr;
};
const cuerrt = (arr: any) => {
  if (arr.length === 1) {
    return arr[0].num;
  }
  if (arr.length) {
    return arr.reduce((init: any, item: any) => {
      console.log(init, item);
      return init.num || init >= item.num ? item.num : init.num || init;
    });
  }
};
//新增图形
const addEvent = (gFirstFeatureLayer: any, gFirstTextLayer: any) => {
  let gMap: any = data.gMap;
  gMap.events.on("drawDone", (type: any, data: any) => {
    data.gFirstFeatureLayer = gFirstFeatureLayer;
    data.gFirstTextLayer = gFirstTextLayer;
    if (type === "RECT" || type === "LINE") {
      let id = getid(); //id
      addFeature(data, type, id, gMap);
    }
  });
  gMap.events.on("boundsChanged", (data: any) => {
    console.log("--map boundsChanged--", data);
    return "";
  });
  gMap.events.on("dblClick", (obj: any) => {
    let list = (data.gFirstFeatureLayer as any).features;
    console.log(list, "list");
    if (!list.type) {
      // emit("delFeature", {}, null); //选中
    }
    let arr: any = isRangeIn(obj, list);
    let min: any = cuerrt(arr);
    if (min && arr.length) {
      let feature = arr.filter((item: any) => item.num === min)[0].item;
      if (feature) {
        data.editId = feature.id;
        //设置编辑feature
        data.dbData = feature;
        // emit("delFeature", feature, feature.type); //选中
        gMap.setActiveFeature(feature);
        if (feature.type != "POINT") {
          // 增加删除按钮
          addDeleteIcon(feature, feature.shape);
        }
      }
    }
  });
  gMap.events.on("mouseUp", (feature: any) => {
    const scale = (data.gMap as any).getScale();
    // emit("delcomplete"); //权限恢复
    console.log(scale, "ASAAAA", feature);
  });
  // 双击编辑 在绘制模式下双击feature触发选中
  gMap.events.on("featureSelected", (feature: any) => {
    console.log("编辑", feature);
  });
  //右键 目前只针对点双击选中右键触发
  gMap.events.on("featureDeleted", (feature: any) => {
    console.log(feature, "右键");
    if (feature.type == "POINT") {
      // 根据id删除对应feature
      (data.gFirstFeatureLayer as any).removeFeatureById(feature.id);
      (data.gFirstTextLayer as any).removeTextById(feature.id);
    }
  });

  // 单机空白取消编辑
  gMap.events.on("featureUnselected", () => {
    // 取消featureSelected
    data.editId = "";
    deIcon();
    gMap.setActiveFeature(null);
  });
  // 更新完
  gMap.events.on("featureUpdated", (feature: any, shape: any) => {
    console.log(feature, "更新了");
    feature.updateShape(shape);
    (data.gFirstTextLayer as any).removeTextById(feature.id);
    deIcon();
    if (feature.type != "POINT") {
      addDeleteIcon(feature, shape);
    }
    // 更新或者移动需要重新设置删除图标
  });
  // 删除
  gMap.events.on("featureDeleted", ({ id: featureId }) => {
    console.log("测试", featureId);
  });
};
onUnmounted(() => {
  (data.gMap as any).destroy();
});
watch(
  () => data.mode,
  (newVal, oldVal) => {
    // (data.gMap as any).setMode(newVal)
    setDrawingStyle(newVal);
  },
  { immediate: true, deep: true }
);
onMounted(() => {
  const gMap = new AILabel.Map("map", {
    center: { x: 450, y: 20 }, // 为了让图片居中
    zoom: 1000,
    mode: "PAN", // 绘制线段
    refreshDelayWhenZooming: true, // 缩放时是否允许刷新延时，性能更优
    zoomWhenDrawing: true,
    panWhenDrawing: true,
    zoomWheelRatio: 5, // 控制滑轮缩放缩率[0, 10), 值越小，则缩放越快，反之越慢
    withHotKeys: true, // 关闭快捷键
  });
  data.gMap = gMap;
  // 图片层添加
  const gFirstImageLayer = new AILabel.Layer.Image(
    "first-layer-image", // id
    {
      src: data.imgUrl,
      width: 2667,
      height: 1450,
      crossOrigin: false, // 如果跨域图片，需要设置为true
      position: {
        // 左上角相对中心点偏移量
        x: 0,
        y: 0,
      },
      // 网格
      // grid: {
      //   // 3 * 3
      //   columns: [{ color: "#9370DB" }, { color: "#FF6347" }],
      //   rows: [{ color: "#9370DB" }, { color: "#FF6347" }],
      // },
    }, // imageInfo
    { name: "第一个图片图层" }, // props
    { zIndex: 5 } // style
  );
  // 添加到gMap对象
  gMap.addLayer(gFirstImageLayer);
  // 添加矢量图层
  const gFirstFeatureLayer = new AILabel.Layer.Feature(
    "first-layer-feature", // id
    { name: "第一个矢量图层" }, // props
    { zIndex: 10 } // style
  );
  const gFirstTextLayer = new AILabel.Layer.Text(
    "first-layer-text", // id
    { name: "第一个文本图层" }, // props
    { zIndex: 12, opacity: 1 } // style
  );
  gMap.addLayer(gFirstTextLayer); //文字图层
  gMap.addLayer(gFirstFeatureLayer); //图形图层
  data.gFirstTextLayer = gFirstTextLayer;
  data.gFirstFeatureLayer = gFirstFeatureLayer;
  window.onresize = function () {
    data.gMap && (data.gMap as any).resize();
  };
  addEvent(gFirstFeatureLayer, gFirstTextLayer); //监听
});
</script>
<style lang="scss" scoped>
.home {
  position: relative;
}
.img {
  position: relative;
  min-height: 750px;
}
</style>
