<template>
  <!-- 卡片视图区 -->
  <div>
    <el-alert
      title="添加商品信息"
      type="info"
      center
      :closable="false"
      show-icon
    >
    </el-alert>
    <el-steps
      :space="200"
      :active="activeIndex"
      finish-status="success"
      align-center
    >
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <el-form
      :model="addGoodsForm"
      :rules="addGoodsFormRules"
      :size="formSize"
      ref="addGoodsFormRef"
      label-width="100px"
      label-position="top"
    >
      <el-tabs
        :tab-position="'left'"
        v-model="activeIndex"
        :before-leave="beforeTabLeave"
        @tab-click="tabClicked"
      >
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input
              v-model="addGoodsForm.goods_price"
              type="number"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input
              v-model="addGoodsForm.goods_weight"
              type="number"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number" type="number">
            <el-input v-model="addGoodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <!-- 级联选择器只允许使用v-model绑定数组 -->
            <el-cascader
              v-model="addGoodsForm.goods_cat"
              :options="goodsCategoryList"
              :props="goodsCategoryProps"
              @change="cascaderHandleChange"
            ></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item
            v-for="item in manyTableData"
            :key="item.attr_id"
            :label="item.attr_name"
          >
            <el-checkbox-group v-model="item.attr_vals_arr">
              <el-checkbox
                v-for="(item1, index) in item.attr_vals_arr"
                :key="index"
                :label="item1"
                border
              ></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item
            :label="item.attr_name"
            v-for="item in onlyTableData"
            :key="item.attr_id"
          >
            <el-input v-model="item.attr_vals_arr"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :headers="headersObj"
            :on-success="picUploadSuccess"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <QuillEditor
            v-model="addGoodsForm.goods_introduce"
            theme="snow"
            class="quill-edior-style"
            toolbar="full"
          ></QuillEditor>
        </el-tab-pane>
        <el-tab-pane name="5">
          <el-button
            type="primary"
            class="btnAdd"
            @click="submitForm(addGoodsFormRef)"
            >添加商品</el-button
          >
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <el-dialog
      title="图片预览"
      v-model="isShowPreviewDialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <img :src="previewPicPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getGoodsCategoryListApi,
  getThirdCategoriesAttributesManyApi,
  getThirdCategoriesAttributesOnlyApi,
  addGoodsApi,
  getGoodsInfoByIdApi,
} from "../../api/index";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import type { UploadProps, UploadUserFile } from "element-plus";
import {
  GoodsCategoryResInter,
  GoodsCategoryDataInter,
  AddGoodsCategoryFormInter,
  GoodsAttributesDataInter,
} from "../../utils/interface/interface";

import { cloneDeep } from "lodash";

import { computed } from "@vue/reactivity";
// // vue3中的组件直接引用，不用注册
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@vueup/vue-quill/dist/vue-quill.bubble.css";

const formSize = ref("default");
const addGoodsFormRef = ref<FormInstance>();
// 进行路由跳转(不能写在函数里)
const router = useRouter();
// 获取路由参数
const route = useRoute();
let activeIndex = ref("0");
let addGoodsForm: AddGoodsCategoryFormInter = reactive({
  goods_name: "",
  goods_price: 0,
  goods_number: 0,
  goods_weight: 0,
  goods_cat: [],
  pics: [],
  goods_introduce: "",
  attrs: [],
});
const addGoodsFormRules = reactive<FormRules>({
  goods_name: [
    {
      required: true,
      message: "请输入商品名称",
      trigger: "blur",
      min: 1,
      max: 15,
    },
  ],
  goods_price: [
    {
      required: true,
      message: "请输入商品价格",
      trigger: "blur",
      min: 1,
      max: 15,
    },
  ],
  goods_weight: [
    {
      required: true,
      message: "请输入商品重量",
      trigger: "blur",
      min: 1,
      max: 15,
    },
  ],
  goods_number: [
    {
      required: true,
      message: "请输入商品数量",
      trigger: "blur",
    },
  ],
  goods_cat: [
    {
      required: true,
      message: "请选择商品分类",
      trigger: "blur",
    },
  ],
});
const goodsCategoryList: Array<GoodsCategoryDataInter> = reactive([]);
const goodsCategoryProps = reactive({
  expandTrigger: "hover",
  label: "cat_name",
  value: "cat_id",
  children: "children",
});
const manyTableData: Array<GoodsAttributesDataInter> = reactive([]);
const onlyTableData: Array<GoodsAttributesDataInter> = reactive([]);
//   图片上传地址
const uploadURL = ref("http://127.0.0.1:8888/api/private/v1/upload");
//   上传图片的请求头
const headersObj = reactive({
  Authorization: window.sessionStorage.getItem("token"),
});
let previewPicPath = ref("");
let isShowPreviewDialogVisible = ref(false);
const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
  console.log(file, uploadFiles);
};

const handlePreview: UploadProps["onPreview"] = (uploadFile: any) => {
  isShowPreviewDialogVisible.value = true;
  previewPicPath.value = uploadFile.response.data.url;
};
const handleClose = (done: () => void) => {
  isShowPreviewDialogVisible.value = false;
  previewPicPath.value = "";
};

const picUploadSuccess: UploadProps["onSuccess"] = (files) => {
  console.log(files);
};
const getGoodsCategoryList = async () => {
  const { data }: { data: GoodsCategoryResInter } =
    await getGoodsCategoryListApi();
  if (data.meta.status !== 200) {
    return ElMessage({
      message: data.meta.msg,
      type: "error",
    });
  }
  goodsCategoryList.splice(0);
  goodsCategoryList.push(...data.data);
};
const cascaderHandleChange = () => {
  if (addGoodsForm.goods_cat.length != 3) {
    addGoodsForm.goods_cat = [];
  }
};
const beforeTabLeave = (activeName: string, oldActiveName: string) => {
  if (oldActiveName == "0" && addGoodsForm.goods_cat.length != 3) {
    return ElMessage({
      message: "请先选择商品分类",
      type: "error",
    });
  }
};
const tabClicked = async () => {
  if (activeIndex.value == "1") {
    const { data } = await getThirdCategoriesAttributesManyApi(
      thirdCateId.value
    );
    if (data.meta.status !== 200) {
      return ElMessage({
        message: data.meta.msg,
        type: "error",
      });
    }

    data.data.map((item: GoodsAttributesDataInter) => {
      item.attr_vals_arr = item.attr_vals.trim()
        ? item.attr_vals.split(",")
        : [];
      if (item.attr_vals_arr.length != 0) {
        item.attr_vals_arr = item.attr_vals_arr.filter((item) => item !== "");
      }
    });
    manyTableData.splice(0);
    manyTableData.push(...data.data);
  }
  if (activeIndex.value == "2") {
    const { data } = await getThirdCategoriesAttributesOnlyApi(
      thirdCateId.value
    );
    if (data.meta.status !== 200) {
      return ElMessage({
        message: data.meta.msg,
        type: "error",
      });
    }
    data.data.forEach((item: GoodsAttributesDataInter) => {
      item.attr_vals_arr = item.attr_vals.trim() ? [item.attr_vals] : [];
    });
    onlyTableData.splice(0);
    onlyTableData.push(...data.data);
  }
};
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    console.log(fields);
    if (valid) {
      const _addGoodsForm: any = cloneDeep(addGoodsForm);
      _addGoodsForm.goods_cat = _addGoodsForm.goods_cat.join(",");
      // 处理动态参数与静态属性
      manyTableData.forEach((item) => {
        const newInfo: any = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals_arr.join(","),
        };
        addGoodsForm.attrs.push(newInfo);
      });
      onlyTableData.forEach((item) => {
        const newInfo: any = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals_arr.join(","),
        };
        addGoodsForm.attrs.push(newInfo);
      });
      _addGoodsForm.attrs = addGoodsForm.attrs;
      const { data } = await addGoodsApi(_addGoodsForm);
      if (data.meta.status !== 201) {
        return ElMessage({
          message: data.meta.msg,
          type: "error",
        });
      }
      ElMessage({
        message: data.meta.msg,
        type: "success",
      });

      router.push("/home/goods");
    } else {
      return ElMessage({
        message: "表单验证失败",
        type: "error",
      });
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
onMounted(() => {
  getGoodsCategoryList();
  const query: any = route.query;
  const id: number = query.id;
  if (id) {
    getGoodsInfoById(id);
  }
});

const thirdCateId = computed(() => {
  if (addGoodsForm.goods_cat.length == 3) {
    return addGoodsForm.goods_cat[2];
  }
  return null;
});
const getGoodsInfoById = async (id: number) => {
  const { data } = await getGoodsInfoByIdApi(id);
};
</script>

<style lang="scss" scope>
.el-step__title {
  font-size: 13px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
.quill-edior-style {
  min-height: 300px !important;
}
</style>
