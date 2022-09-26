<template>
  <div>
    <div class="margin-bottom20">
      <el-input v-model="queryInfo.query" placeholder="请输入查询内容">
        <template #append>
          <el-button :icon="Search" @click="getOrderList" />
        </template>
      </el-input>
    </div>
    <el-table :data="orderList" style="width: 100%" border>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="order_number" label="订单编号"> </el-table-column>
      <el-table-column prop="order_price" label="订单价格(元)" width="180">
      </el-table-column>
      <el-table-column prop="pay_status" label="是否付款" width="180">
        <!-- 作用域插槽渲染 -->
        <template #default="scope">
          <el-tag v-if="scope.row.pay_status === '1'" type="success"
            >已付款</el-tag
          >
          <el-tag type="danger" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货" width="180">
      </el-table-column>
      <el-table-column prop="create_time" label="下单时间" width="250">
        <template #default="scope">
          {{ formatTime(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <!-- 作用域插槽渲染 -->
        <template #default="scope">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="修改地址"
            placement="top"
          >
            <el-button
              size="mini"
              type="primary"
              :icon="Edit"
              @click="handleEdit(scope.$index, scope.row)"
              circle
            >
            </el-button>
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="物流进度"
            placement="top"
          >
            <el-button
              size="mini"
              type="success"
              :icon="LocationFilled"
              circle
              @click="handleSetting(scope.$index, scope.row)"
            >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 20, 50]"
      :small="false"
      :disabled="false"
      :background="false"
      layout="total, sizes, prev, pager, next, jumper,slot"
      :total="total"
      @size-change="getOrderList"
      @current-change="getOrderList"
    >
    </el-pagination>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="30%"
    @close="resetForm(addressFormRef)"
  >
    <div v-if="dialogType == 'edit'">
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="150px"
        :size="formSize"
        status-icon
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="citiesArr" v-model="addressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div v-else>
      <el-timeline reverse>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(addressFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(addressFormRef)" plain
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { Search, Edit, LocationFilled } from "@element-plus/icons-vue";
import { getOrderListApi } from "../../api/index";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import {
  OrderResDataGoodsInter,
  OrderResInter,
} from "../../utils/interface/interface";
import moment from "moment";

import { citiesArr } from "../../utils/city";
const addressFormRef = ref<FormInstance>();
let dialogVisible = ref(false);
let dialogType = ref("edit");
let dialogTitle = ref("");
const formSize = ref("default");

let queryInfo = reactive({
  query: "",
  pagenum: 1,
  pagesize: 10,
});
const activities = reactive([
  {
    content: "活动按期开始",
    timestamp: "2018-04-15",
  },
  {
    content: "通过审核",
    timestamp: "2018-04-13",
  },
  {
    content: "创建成功",
    timestamp: "2018-04-11",
  },
]);
let orderList: Array<OrderResDataGoodsInter> = reactive([]);
const total = ref(0);
// 用户表单
let addressForm = reactive({
  address1: [],
  address2: "",
});

const addressFormRules = reactive<FormRules>({
  address1: [
    {
      min: 2,
      max: 20,
      required: true,
      message: "请输入省市区/县",
      trigger: "blur",
    },
  ],
  address2: [
    {
      min: 2,
      max: 40,
      required: true,
      message: "请输入详细地址",
      trigger: "blur",
    },
  ],
});

const getOrderList = async () => {
  const { data }: { data: OrderResInter } = await getOrderListApi(queryInfo);
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  orderList.splice(0);
  orderList.push(...data.data.goods);
  total.value = data.data.total;
  queryInfo.pagenum = Number(data.data.pagenum);
};
const handleEdit = (index: number, row: any) => {
  dialogTitle.value = "修改地址";
  dialogVisible.value = true;
  dialogType.value = "edit";
};

const formatTime = (time: number) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

const submitForm = (formEl: FormInstance | undefined) => {
  resetForm(formEl);
};

const resetForm = (formEl: FormInstance | undefined) => {
  dialogVisible.value = false;
  formEl?.resetFields();
};
const handleSetting = (index: number, row: any) => {
  dialogVisible.value = true;
  dialogType.value = "location";
  dialogTitle.value = "物流进度";
};

onMounted(() => {
  getOrderList();
});
</script>
<style lang="scss" scope>
.margin-bottom20 {
  margin-bottom: 20px;
  .el-input {
    width: 40%;
    margin-right: 20px;
  }
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
