<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="includeList">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { ref } from "vue";
// 需要缓存的组件name值
const includeList = ref(["Home", "Login"]); // 缓存Home和Login组件
</script>

<style scoped></style>
