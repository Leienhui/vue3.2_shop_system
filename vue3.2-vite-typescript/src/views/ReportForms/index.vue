<template>
  <div id="main"></div>
</template>
<script lang="ts" setup>
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { onMounted } from "vue";
import { getReportDataApi } from "../../api";
import { merge } from "lodash";

type EChartsOption = echarts.EChartsOption;

const getReportData = async () => {
  const { data } = await getReportDataApi();
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  ElMessage({
    type: "success",
    message: data.meta.msg,
  });
  showMain(data.data);
};

const showMain = (data: EChartsOption) => {
  //需要获取到element,所以是onMounted的Hook
  const chartDom = document.getElementById("main")!;
  let myChart = echarts.init(chartDom);
  let option: EChartsOption;
  // 需要合并的选项
  option = {
    title: {
      text: "用户来源",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        boundaryGap: false,
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
  };
  // merge:合并两个对象作为配置项
  option && myChart.setOption(merge(data, option));
  window.onresize = function () {
    //自适应大小
    myChart.resize();
  };
};

onMounted(() => {
  getReportData();
});
</script>
<style lang="scss" scope>
#main {
  min-width: 750px;
  min-height: 500px;
}
</style>
