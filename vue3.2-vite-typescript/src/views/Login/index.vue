<template>
  <div class="login_container">
    <div class="login_box">
      <div class="head_box">
        <img src="../../assets/vue.svg" alt="" />
      </div>
      <el-form
        class="login_info"
        :rules="loginFormRules"
        :model="loginForm"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input :prefix-icon="User" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item>
          <div class="btns">
            <el-button type="primary" @click="login(loginFormRef)"
              >登录</el-button
            >
            <el-button type="info" @click="resetLoginForm(loginFormRef)"
              >重置</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<!-- 在 Vue3.0 中变量必须 return 出来， template 中才能使用；
而在 Vue3.2 中只需要在script 标签上加上 setup 属性，无需 return ， template 便可直接使用 
setup 语法糖中可直接使用 await ，不需要写 async ， setup 会自动变成 async setup
-->
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { loginApi } from "../../api";
import { setToken } from "../../utils";
// 进行路由跳转
const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loginForm = reactive({
  username: "admin",
  password: "123456",
});
const loginFormRules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6到 20 个字符", trigger: "blur" },
  ],
});
const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (valid) {
      const { data } = await loginApi(loginForm);
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
      setToken(data.data.token);
      router.push("/home");
    } else {
      return ElMessage({
        message: "验证失败",
        type: "error",
      });
    }
  });
};
const resetLoginForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
<style lang="scss" scope>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .head_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      position: absolute;
      left: 50%;
      background-color: #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px #ddd;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_info {
      position: absolute;
      bottom: 10%;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        flex: 1;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
