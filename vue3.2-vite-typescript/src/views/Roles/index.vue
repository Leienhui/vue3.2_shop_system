<template>
  <div>
    <div class="margin-bottom20">
      <el-button type="primary" plain @click="addRole">添加角色</el-button>
    </div>
    <el-table :data="roleList" style="width: 100%" border>
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template #default="scope">
          <!-- 栅格系统 -->
          <el-row
            v-for="(item1, index1) in scope.row.children"
            :key="item1.id"
            :class="['rowbdBottom', index1 === 0 ? 'rowbdTop' : '', 'vcenter']"
          >
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag
                closable
                @close="removeAuthorityById(scope.row, item1.id)"
                >{{ item1.authName }}</el-tag
              ><i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二三级权限 -->
            <el-col :span="19">
              <el-row
                v-for="(item2, index2) in item1.children"
                :key="item2.id"
                :class="[
                  'rowbdBottom',
                  index2 === 0 ? '' : 'rowbdTop',
                  'vcenter',
                ]"
              >
                <!-- 二级权限 -->
                <el-col :span="6">
                  <el-tag
                    closable
                    @close="removeAuthorityById(scope.row, item2.id)"
                    type="success"
                    >{{ item2.authName }}</el-tag
                  ><i class="el-icon-caret-right"></i>
                </el-col>
                <!--三级权限 -->
                <el-col :span="18">
                  <el-tag
                    closable
                    type="warning"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    @close="removeAuthorityById(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="300">
      </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="300">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <!-- 作用域插槽 -->
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
          <el-tooltip
            class="box-item"
            effect="dark"
            content="分配权限"
            placement="top"
          >
            <el-button
              type="warning"
              :icon="Setting"
              circle
              @click="handleSetting(scope.$index, scope.row)"
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
      @close="resetForm(rolesFormRef)"
    >
      <div>
        <el-form
          ref="rolesFormRef"
          :model="roleForm"
          :rules="roleFormRules"
          :size="formSize"
          status-icon
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="roleForm.roleName" />
          </el-form-item>

          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="roleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm(rolesFormRef)">取消</el-button>
          <el-button type="primary" @click="submitForm(rolesFormRef)" plain
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogVisible"
      title="分配权限"
      width="30%"
      :before-close="handleClose"
    >
      <el-tree
        ref="treeRef"
        :data="allAuthoritiesList"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        default-expand-all
        :default-checked-keys="defKeys"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="getCheckedKeys" plain
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import {
  getRolesListApi,
  addRolesApi,
  editRolesApi,
  deleteRolesApi,
  getAllAuthoritesListApi,
  updateRolesAuthoritesListApi,
  deleteRolesAuthoritesApi,
} from "../../api/index";
import { Search, Edit, Delete, Setting } from "@element-plus/icons-vue";
import {
  ElMessage,
  ElMessageBox,
  FormInstance,
  FormRules,
  ElTree,
} from "element-plus";

import {
  RolesResInter,
  RolesInnerDataInter,
  AuthorityListResDataInter,
  TreeInter,
} from "../../utils/interface/interface";
import type Node from "element-plus/es/components/tree/src/model/node";

const treeRef = ref<InstanceType<typeof ElTree>>();
let dialogVisible = ref(false);
const defaultProps = {
  children: "children",
  label: "authName",
};
let allAuthoritiesList: Array<AuthorityListResDataInter> = reactive([]);
const rolesFormRef = ref<FormInstance>();
let dialogType = ref("add");
let dialogTitle = ref("");
const formSize = ref("default");
let defKeys: number[] = reactive([]);
let editDialogVisible = ref(false);
let roleForm = reactive({
  id: 0,
  roleDesc: "",
  roleName: "",
});
const roleFormRules = reactive<FormRules>({
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    {
      min: 2,
      max: 15,
      message: "长度在2到15个字符",
      trigger: "blur",
    },
  ],
  roleDesc: [{ required: true, message: "请输入角色描述", trigger: "blur" }],
});
let pageSize = ref(10);
let currentPage = ref(1);
let total = ref(0);

const roleList: Array<RolesInnerDataInter> = reactive([]);
let roleListArr: Array<RolesInnerDataInter> = [];
const getRolesList = async () => {
  const { data }: { data: RolesResInter } = await getRolesListApi();
  if (data.meta.status !== 200)
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });

  roleListArr.splice(0);
  roleListArr.push(...data.data);
  total.value = roleListArr.length;
  setPagination();
};
const handleSetting = (index: number, row: RolesInnerDataInter) => {
  dialogVisible.value = true;
  defKeys = [];
  setRolesForm(row);
  recursionGetId(row, defKeys);
  setCheckedKeys();
};
const handleDelete = (index: number, row: RolesInnerDataInter) => {
  ElMessageBox.confirm("确定删除该数据吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const { data } = await deleteRolesApi(row);
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
      getRolesList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};
const handleEdit = (index: number, row: RolesInnerDataInter) => {
  editDialogVisible.value = true;
  dialogTitle.value = "编辑角色";
  dialogType.value = "edit";
  setRolesForm(row);
};
const setRolesForm = (row: RolesInnerDataInter) => {
  roleForm.id = row.id;
  roleForm.roleDesc = row.roleDesc;
  roleForm.roleName = row.roleName;
};
const removeAuthorityById = (row: RolesInnerDataInter, id: number) => {
  ElMessageBox.confirm("此操作将永久删除该权限, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const { data } = await deleteRolesAuthoritesApi({
        id: row.id,
        rightId: id,
      });
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
      row.children = data.data;
      getRolesList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消删除",
      });
    });
};
const addRole = () => {
  editDialogVisible.value = true;
  dialogTitle.value = "添加角色";
  dialogType.value = "add";
};
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.validate(async (valid, fields) => {
    if (valid) {
      let data;
      if (dialogType.value == "add") {
        const { data: res } = await addRolesApi(roleForm);
        data = res;
        if (data.meta.status !== 201) {
          return ElMessage({
            message: data.meta.msg,
            type: "error",
          });
        }
      } else {
        const { data: res } = await editRolesApi(roleForm);
        data = res;
        if (data.meta.status !== 200) {
          return ElMessage({
            message: data.meta.msg,
            type: "error",
          });
        }
      }
      editDialogVisible.value = false;
      getRolesList();
      ElMessage({
        message: data.meta.msg,
        type: "success",
      });
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
  editDialogVisible.value = false;
};
const handleClose = () => {
  dialogVisible.value = false;
  defKeys.splice(0);
};

const getAllroleList = async () => {
  const { data } = await getAllAuthoritesListApi();
  if (data.meta.status !== 200)
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  allAuthoritiesList.splice(0);
  allAuthoritiesList.push(...data.data);
};
// 通过递归的形式获取三级权限id,并将三级权限id给节点数组
const recursionGetId = (row: RolesInnerDataInter, arr: number[]) => {
  // 节点不包含children属性，则说明是最后一层
  if (!row.children) return arr.push(row.id);
  // 如果不是最后一层，则循环他的children字段
  row.children.forEach((item) => recursionGetId(item, arr));
};

const getCheckedKeys = async () => {
  // 拿到全选的树形控件复选框
  const checkedTreeNodeKeysArr = treeRef.value!.getCheckedKeys(false);
  const { data } = await updateRolesAuthoritesListApi({
    id: roleForm.id,
    rids: checkedTreeNodeKeysArr.join(),
  });
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  handleClose();
  getRolesList();
  ElMessage({
    message: data.meta.msg,
    type: "success",
  });
};

const setCheckedKeys = () => {
  let defKeysArr = [];
  defKeysArr = defKeys.map((item) => item);
  treeRef.value?.setCheckedKeys(defKeysArr, false);
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
  roleList.splice(0);
  roleList.push(...roleListArr.slice(start, start + pageSize.value));
};

onMounted(() => {
  getRolesList();
  getAllroleList();
});
</script>
<style lang="scss" scope>
.el-tag {
  margin-top: 7px;
  margin-right: 7px;
}
.rowbdTop {
  border-top: 1px solid #eee;
}
.rowbdBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.margin-bottom20 {
  margin-bottom: 20px;
}
.el-dialog__body {
  .el-tree {
    max-height: 550px;
    overflow-y: scroll;
  }
}
</style>
