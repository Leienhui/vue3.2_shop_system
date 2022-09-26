<template>
  <div>
    <el-table :data="authoritesList" style="width: 100%" border stripe>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column
        prop="authName"
        label="权限名称"
        width="300"
      ></el-table-column>
      <el-table-column prop="path" label="路径" width="300"></el-table-column>
      <el-table-column prop="level" label="权限等级" width="300">
        <!-- 自定义插槽 -->
        <template #default="scope">
          <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
          <el-tag type="success" v-if="scope.row.level === '1'"
            >二级权限</el-tag
          >
          <el-tag type="warning" v-if="scope.row.level === '2'"
            >三级权限</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:currentPage="currentPage"
      v-model:page-size="pageSize"
      :small="false"
      :disabled="false"
      :background="false"
      :page-sizes="[5, 10, 20, 40, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { getAuthoritesListApi } from "../../api/index";
import {
  AuthorityListResInter,
  AuthorityListResDataInter,
} from "../../utils/interface/interface";
let pageSize = ref(10);
let currentPage = ref(1);
let total = ref(0);

let authoritesListArr: Array<AuthorityListResDataInter> = [];
let authoritesList: Array<AuthorityListResDataInter> = reactive([]);
const getAuthoritesList = async () => {
  const { data }: { data: AuthorityListResInter } =
    await getAuthoritesListApi();
  if (data.meta.status !== 200)
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  authoritesListArr = data.data;
  setPagination();
  total.value = authoritesListArr.length;
};
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  setPagination();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  setPagination();
};
const setPagination = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  authoritesList.splice(0);
  authoritesList.push(
    ...authoritesListArr.slice(start, start + pageSize.value)
  );
};

onMounted(() => {
  getAuthoritesList();
});
</script>
<style lang="scss" scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
