<template>
  <div v-loading="loading">
    <div class="margin-bottom20">
      <el-input v-model="queryInfo.query" placeholder="请输入查询内容">
        <template #append>
          <el-button :icon="Search" @click="getUserList" />
        </template>
      </el-input>
      <el-button type="primary" plain @click="addUser">添加用户</el-button>
    </div>
    <el-table :data="userList" style="width: 100%" border>
      <el-table-column prop="username" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="mobile" label="电话" />
      <el-table-column prop="role_name" label="角色" />
      <el-table-column label="创建时间">
        <template #default="scope">
          <span>{{ formatTime(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChange(scope.row)"
          >
          </el-switch>
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
          <el-tooltip
            class="box-item"
            effect="dark"
            content="分配角色"
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
      v-model:currentPage="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 20, 50]"
      :small="false"
      :disabled="false"
      :background="false"
      layout="total, sizes, prev, pager, next, jumper,slot"
      :total="total"
      @size-change="getUserList"
      @current-change="getUserList"
    >
    </el-pagination>
  </div>
  <el-dialog
    v-model="editDialogVisible"
    :title="dialogTitle"
    width="30%"
    @close="resetForm(userFormRef)"
  >
    <div>
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="70px"
        :size="formSize"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            :disabled="dialogType == 'edit'"
          />
        </el-form-item>

        <el-form-item v-if="dialogType == 'add'" label="密码" prop="password">
          <el-input v-model="userForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="userForm.mobile"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(userFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(userFormRef)" plain
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>

  <el-dialog
    v-model="rolesDialogVisible"
    title="角色分配"
    width="30%"
    :before-close="rolesDialogClose"
  >
    <div>
      <div class="add-height">
        <span class="add-margin-right20">当前的用户:</span>
        <span class="bold-red">{{ userForm.username }}</span>
      </div>
      <div class="add-height">
        <span class="add-margin-right20">当前的角色:</span>

        <span class="bold-red">{{ userForm.role_name }}</span>
      </div>
      <div class="add-height">
        <span class="add-margin-right20">分配新角色:</span>
        <el-select
          v-model="roleId"
          class="m-2"
          placeholder="Select"
          size="large"
        >
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          />
        </el-select>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="rolesDialogClose">取消</el-button>
        <el-button type="primary" @click="updateRoles">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { Search, Edit, Delete, Setting } from "@element-plus/icons-vue";
import {
  getUserListApi,
  userStateChangeApi,
  deleteUserApi,
  addUserApi,
  editUserApi,
  getRolesListApi,
  updateRolesApi,
} from "../../api/index";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  UsersInter,
  UserResInter,
  RolesResInter,
  RolesInnerDataInter,
} from "../../utils/interface/interface";
import moment from "moment";

import { validatorEmail, validatorPhone } from "../../utils/rules";
const userFormRef = ref<FormInstance>();
let editDialogVisible = ref(false);
let dialogType = ref("add");
let dialogTitle = ref("");
const formSize = ref("default");

let queryInfo = reactive({
  query: "",
  pagenum: 1,
  pagesize: 10,
});
let userList: Array<UsersInter> = reactive([]);
const total = ref(0);
// 用户表单
let userForm = reactive({
  username: "",
  password: "",
  email: "",
  mobile: "",
  role_name: "",
  id: 0,
});
let rolesList: Array<RolesInnerDataInter> = reactive([]);
let rolesDialogVisible = ref(false);
let roleId = ref();

const userFormRules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 2,
      max: 15,
      message: "长度在 2 到 15 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "长度在 6 到 20 个字符",
      trigger: "blur",
    },
  ],
  // 自定义校验规则
  email: [
    {
      required: true,
      message: "请输入邮箱",
      trigger: "blur",
      validator: validatorEmail,
    },
  ],
  mobile: [
    {
      required: true,
      message: "请输入手机号",
      trigger: "blur",
      validator: validatorPhone,
    },
  ],
});
let loading = ref(false);
const getUserList = async () => {
  loading.value = true;
  const { data }: { data: UserResInter } = await getUserListApi(queryInfo);
  loading.value = false;

  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  userList.splice(0);
  userList.push(...data.data.users);
  total.value = data.data.total;
};
const handleEdit = (index: number, row: UsersInter) => {
  dialogTitle.value = "修改用户";
  editDialogVisible.value = true;
  dialogType.value = "edit";
  setUserForm(row);
};
const addUser = () => {
  dialogTitle.value = "添加用户";
  editDialogVisible.value = true;
  dialogType.value = "add";
};
const handleDelete = (index: number, row: UsersInter) => {
  ElMessageBox.confirm("确定删除该数据吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      const { data } = await deleteUserApi(row);
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
      getUserList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};
// 状态的检测
const userStateChange = async (row: UsersInter) => {
  loading.value = true;
  const { data } = await userStateChangeApi(row);
  loading.value = false;
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  return ElMessage({
    message: data.meta.msg,
    type: "success",
  });
};
const formatTime = (time: number) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  console.log(formEl);
  formEl.validate(async (valid, fields) => {
    if (valid) {
      let data;
      if (dialogType.value == "add") {
        loading.value = true;
        const { data: res } = await addUserApi(userForm);
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
        const { data: res } = await editUserApi(userForm);
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
      getUserList();
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
  userForm.password = "";
  editDialogVisible.value = false;
};
const handleSetting = (index: number, row: UsersInter) => {
  setUserForm(row);
  rolesDialogVisible.value = true;
};
const setUserForm = (row: UsersInter) => {
  userForm.username = row.username;
  userForm.role_name = row.role_name;
  userForm.email = row.email;
  userForm.mobile = row.mobile;
  userForm.id = row.id;
  roleId.value = null;
};
const getRolesList = async () => {
  loading.value = true;
  const { data }: { data: RolesResInter } = await getRolesListApi();
  loading.value = false;
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  rolesList.splice(0);
  rolesList.push(...data.data);
};
const rolesDialogClose = (done: () => void) => {
  // done();
  rolesDialogVisible.value = false;
};
const updateRoles = async () => {
  loading.value = true;
  const { data } = await updateRolesApi({ id: userForm.id, rid: roleId.value });
  loading.value = false;
  if (data.meta.status !== 200)
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  rolesDialogVisible.value = false;
  ElMessage({
    message: data.meta.msg,
    type: "success",
  });
  getUserList();
};

onMounted(() => {
  getUserList();
  getRolesList();
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
