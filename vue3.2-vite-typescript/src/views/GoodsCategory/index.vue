<template>
  <div>
    <div class="margin-bottom20">
      <el-button type="primary" plain @click="addCate">添加分类</el-button>
    </div>
    <el-table :data="goodsCategoryList" style="width: 100%" row-key="id" border>
      <el-table-column type="index" width="50" />
      <el-table-column prop="cat_name" label="分类名称" />
      <el-table-column prop="cat_deleted" label="是否有效">
        <template #default="scope">
          <el-tag
            class="ml-2"
            type="success"
            v-if="scope.row.cat_deleted === false"
            ><el-icon><Check /></el-icon
          ></el-tag>
          <el-tag class="ml-2" type="danger" v-else
            ><el-icon><Close /></el-icon
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cat_level" label="排序">
        <template #default="scope">
          <el-tag class="ml-2" type="primary" v-if="scope.row.cat_level === 0"
            >一级</el-tag
          >
          <el-tag
            class="ml-2"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag class="ml-2" type="warning" v-else>三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
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
    <el-dialog
      v-model="editDialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="resetForm(goodsCategoryFormRef)"
    >
      <el-form
        :model="goodsCategoryForm"
        :rules="goodsCategoryFormRules"
        ref="goodsCategoryFormRef"
        label-width="120px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="goodsCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" v-if="dialogType == 'add'">
          <!-- 级联选择器 -->
          <!-- 1.options绑定数据源
          2.props配置选项
          3.v-model:将双向绑定的值保存起来
          4. -->
          <el-cascader
            v-model="selectedKeys"
            :options="goodsParentCategoryList"
            :props="cascader"
            clearable
            @change="parentGoodsCategoryHandleChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm(goodsCategoryFormRef)">取消</el-button>
          <el-button
            type="primary"
            @click="submitForm(goodsCategoryFormRef)"
            plain
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import type { UploadProps, UploadUserFile } from "element-plus";
import { Check, Edit, Delete, Close } from "@element-plus/icons-vue";
import {
  GoodsCategoryResInter,
  GoodsCategoryDataInter,
} from "../../utils/interface/interface";
import {
  getGoodsCategoryListApi,
  editGoodsCategoriesApi,
  addGoodsCategoriesApi,
  deleteGoodsCategoriesApi,
  getGoodsParentCategoryListApi,
} from "../../api";
const goodsCategoryFormRef = ref<FormInstance>();
let editDialogVisible = ref(false);
let dialogType = ref("add");
let dialogTitle = ref("");
const formSize = ref("default");
let pageSize = ref(10);
let currentPage = ref(1);
let total = ref(0);
let loading = ref(false);
let selectedKeys = reactive([]);
let goodsParentCategoryList: Array<GoodsCategoryDataInter> = reactive([]);
const cascader = {
  // 次级菜单的展开方式
  expandTrigger: "hover",
  // 指定选项的值为选项对象的某个属性值
  value: "cat_pid",
  // 指定选项标签为选项对象的某个属性值
  label: "cat_name",
  // 指定选项的子选项为选项对象的某个属性值
  children: "children",
};

let goodsCategoryForm = reactive({
  cat_name: "",
  cat_pid: 0,
  cat_level: 0,
});
const goodsCategoryFormRules = {
  cat_name: [
    {
      required: true,
      message: "请输入分类名称",
      trigger: "blur",
      min: 2,
    },
  ],
};
const goodsCategoryList: Array<GoodsCategoryDataInter> = reactive([]);
let goodsCategoryListArr: Array<GoodsCategoryDataInter> = [];

const load = (
  row: GoodsCategoryDataInter,
  treeNode: unknown,
  resolve: (date: Array<GoodsCategoryDataInter>) => void
) => {
  setTimeout(() => {
    console.log(row);
    resolve([]);
  }, 1000);
};
// hasChildren: true,
const getGoodsCategoryList = async () => {
  const { data }: { data: GoodsCategoryResInter } =
    await getGoodsCategoryListApi();
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  goodsCategoryListArr = data.data;
  setPagination();
  total.value = goodsCategoryListArr.length;
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
  goodsCategoryList.splice(0);
  goodsCategoryList.push(
    ...goodsCategoryListArr.slice(start, start + pageSize.value)
  );
};
const handleEdit = (index: number, row: GoodsCategoryDataInter) => {
  dialogTitle.value = "修改分类";
  editDialogVisible.value = true;
  dialogType.value = "edit";
  setUserForm(row);
};
const addCate = () => {
  dialogTitle.value = "添加分类";
  editDialogVisible.value = true;
  dialogType.value = "add";
};
const handleDelete = (index: number, row: GoodsCategoryDataInter) => {
  ElMessageBox.confirm("确定删除该数据吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      const { data } = await deleteGoodsCategoriesApi(row);
      loading.value = false;
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
      getGoodsCategoryList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};
const setUserForm = (row: GoodsCategoryDataInter) => {
  // userForm.username = row.username;
  // userForm.role_name = row.role_name;
  // userForm.email = row.email;
  // userForm.mobile = row.mobile;
  // userForm.id = row.id;
  // roleId.value = null;
};
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  console.log(formEl);
  formEl.validate(async (valid, fields) => {
    if (valid) {
      let data;
      if (dialogType.value == "add") {
        loading.value = true;
        const { data: res } = await addGoodsCategoriesApi(goodsCategoryForm);
        loading.value = false;
        data = res;
        if (data.meta.status !== 201) {
          return ElMessage({
            message: data.meta.msg,
            type: "error",
          });
        }
      } else {
        loading.value = true;
        const { data: res } = await editGoodsCategoriesApi(goodsCategoryForm);
        data = res;
        loading.value = false;
        if (data.meta.status !== 200) {
          return ElMessage({
            message: data.meta.msg,
            type: "error",
          });
        }
      }
      editDialogVisible.value = false;
      getGoodsCategoryList();
      ElMessage({
        message: data.meta.msg,
        type: "success",
      });
      selectedKeys.splice(0);
    } else {
      return ElMessage({
        message: "信息验证不合格",
        type: "error",
      });
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  // userForm.password = "";
  selectedKeys.splice(0);
  editDialogVisible.value = false;
};
const showAddGoodsCategory = () => {
  editDialogVisible.value = true;
  getGoodsParentCategoryList();
};
const getGoodsParentCategoryList = async () => {
  // 获取前两级父级数据
  const { data }: { data: GoodsCategoryResInter } =
    await getGoodsParentCategoryListApi();
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  goodsParentCategoryList.splice(0);
  goodsParentCategoryList.push(...data.data);
};
// 选择项发生变化触发
const parentGoodsCategoryHandleChange = () => {
  // 如果选择数组中的长度大于0,说明选中父级分类,否则就没有任何父级分类
  if (selectedKeys.length > 0) {
    // 父级分类id
    goodsCategoryForm.cat_pid = selectedKeys[selectedKeys.length - 1];
    // 为当前商品分类的等级赋值
    goodsCategoryForm.cat_level = selectedKeys.length;
  } else {
    // 父级分类id
    goodsCategoryForm.cat_pid = 0;
    // 为当前商品分类的等级赋值
    goodsCategoryForm.cat_level = 0;
  }
};
onMounted(() => {
  getGoodsCategoryList();
  getGoodsParentCategoryList();
});
</script>
<style lang="scss" scope>
.margin-bottom20 {
  margin-bottom: 20px;
}
</style>
