<template>
  <div>
    <div class="margin-bottom20">
      <el-input v-model="queryInfo.query" placeholder="请输入查询内容">
        <template #append>
          <el-button :icon="Search" @click="getGoodsList" />
        </template>
      </el-input>
      <el-button type="primary" plain @click="addGoods">添加商品</el-button>
    </div>
    <el-table :data="goodsList" style="width: 100%" border>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)" width="95">
      </el-table-column>
      <el-table-column prop="goods_number" label="商品数量" width="140">
      </el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="70">
      </el-table-column>
      <el-table-column prop="add_time" label="添加时间" width="140">
        <template #default="scope">
          <span>{{ formatTime(scope.row.add_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center">
        <template #default="scope">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="编辑"
            placement="top"
          >
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(scope.$index, scope.row)"
            />
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="删除"
            placement="top"
          >
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="handleDelete(scope.$index, scope.row)"
            />
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
      @size-change="getGoodsList"
      @current-change="getGoodsList"
    >
    </el-pagination>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { Search, Edit, Delete, Setting } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { getGoodsListApi, deleteGoodsListApi } from "../../api/index";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  GoodsResInter,
  GoodsResDataGoodsInter,
} from "../../utils/interface/interface";
import moment from "moment";

const router = useRouter();

let queryInfo = reactive({
  query: "",
  pagenum: 1,
  pagesize: 10,
});
let goodsList: Array<GoodsResDataGoodsInter> = reactive([]);
const total = ref(0);
const getGoodsList = async () => {
  const { data }: { data: GoodsResInter } = await getGoodsListApi(queryInfo);
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  goodsList.splice(0);
  goodsList.push(...data.data.goods);
  total.value = data.data.total;
};
const handleEdit = (index: number, row: GoodsResDataGoodsInter) => {
  router.push(`/home/goods/add?id=${row.goods_id}`);
};
const addGoods = () => {
  router.push("/home/goods/add");
};
const handleDelete = (index: number, row: GoodsResDataGoodsInter) => {
  ElMessageBox.confirm("确定删除该数据吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const { data } = await deleteGoodsListApi(row);
      if (data.meta.status !== 200) {
        return ElMessage({
          message: data.meta.msg,
          type: "error",
        });
      }
      ElMessage({
        message: data.meta.msg,
        type: "success",
      });
      getGoodsList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};

const formatTime = (time: number) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};
onMounted(() => {
  getGoodsList();
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
.bold-red {
  font-weight: bold;
  color: red;
}
.add-margin-right20 {
  display: inline-block;
  margin-right: 20px;
}
.add-height {
  line-height: 30px;
  margin-bottom: 20px;
}
</style>
