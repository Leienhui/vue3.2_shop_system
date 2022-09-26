<template v-loading>
  <el-container class="common-layout">
    <el-header>
      <div class="logo-title">
        <img src="../../assets/vue.svg" alt="" />
        <span>vue3.2+typescript+vite</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container class="bottom-container">
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollpase">|||</div>
        <el-menu
          active-text-color="#409EFF"
          background-color="#333744"
          class="el-menu-vertical-demo"
          :default-active="route.path"
          text-color="#fff"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          router
          @open="handleOpen"
          @close="handleClose"
        >
          <el-sub-menu
            v-for="item in menuList"
            :index="item.id + ''"
            :key="item.id"
            index="/home"
          >
            <template #title>
              <i :class="iconfontObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <!--在开启路由模式的情况下，将 index:作为跳转地址 -->
            <el-menu-item
              v-for="subItem in item.children"
              :index="'/home/' + subItem.path"
              :key="subItem.id"
              @click="'/home/' + subItem.path"
            >
              <template #title>
                <i class="iconfont icon-caidan"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main>
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item>首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="item of breadcrumb">{{
                  item
                }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </template>
          <!-- 动态路由匹配对应的页面 -->
          <router-view v-slot="{ Component }">
            <keep-alive :include="includeList">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { reactive, ref, onMounted, watch } from "vue";
import { removeToken } from "../../utils";
import { getMenuListApi } from "../../api";
import { ElMessage } from "element-plus";
import "../../assets/scss/iconfont.scss";
import { RealDataInter, DataInter } from "../../utils/interface/interface";

let breadcrumb: string[] = reactive([]);

// 需要缓存的组件name值
const includeList = ref([
  "Users",
  "AuthorityList",
  "Roles",
  "GoodsCategory",
  "GoodsParams",
  "GoodsList",
  "OrderManage",
  "ReportForms",
]); // 缓存组件

// 进行路由跳转(不能写在函数里)
const router = useRouter();
// 获取路由参数
const route = useRoute();

const isCollapse = ref(true);

let menuList = reactive<Array<RealDataInter>>([]); // 这不就是空数组吗？
// 一级菜单字体图标
const iconfontObj: any = reactive({
  // 以数据id作为键，以字体图标作为值
  125: "iconfont icon-yonghuguanli",
  103: "iconfont icon-quanxianguanli",
  101: "iconfont icon-shangpinguanli",
  102: "iconfont icon-dingdanguanli",
  145: "iconfont icon-shujutongji",
});

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};
const toggleCollpase = () => {
  isCollapse.value = !isCollapse.value;
};
const logout = () => {
  // 清空sessionStorage
  removeToken();
  router.push("/login");
};

onMounted(async () => {
  //   获取左侧菜单
  const { data }: { data: DataInter } = await getMenuListApi();
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  menuList.push(...data.data);
  setBreadcrumb(route.path);
});
//监视reactive所定义的一个响应式数据中的某个属性

const setBreadcrumb = (path: string) => {
  const breadcrumbObj: any = {
    users: ["用户管理", "用户列表"],
    rights: ["权限管理", "权限列表"],
    roles: ["权限管理", "角色列表"],
    categories: ["商品管理", "商品分类"],
    params: ["商品管理", "参数列表"],
    goods: ["商品管理", "商品列表"],
    add: ["商品管理", "添加商品"],
    orders: ["订单管理", "订单列表"],
    reports: ["数据统计", "数据报表"],
  };
  const pathArr = path.split("/");
  const len = pathArr.length - 1;
  const key: string = pathArr[len];
  breadcrumbObj[key]?.forEach((item: string, index: number) => {
    breadcrumb[index] = item;
  });
};
watch(
  () => route.path,
  (newValue: string, oldValue: string) => {
    setBreadcrumb(newValue);
  }
);
</script>

<style lang="scss" scoped>
.common-layout {
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: #373d41;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    .logo-title {
      display: flex;
      height: 50px;
      align-items: center;
      margin-left: 15px;
      font-size: 20px;
    }
  }

  .el-aside {
    background-color: #333744;
    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      letter-spacing: 0.3em;
      text-align: center;
      cursor: pointer;
    }
    .el-menu {
      border: none;
      .iconfont {
        display: inline-block;
        margin-right: 10px;
      }
    }
  }
  .el-main {
    background-color: #eaedf1;
    .el-menu-vertical-demo:not(.el-menu--collapse) {
      width: 200px;
      min-height: 400px;
    }
  }
}
</style>
