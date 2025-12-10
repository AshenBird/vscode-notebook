<script setup lang="ts">
import {
  NCollapse,
  NCollapseItem,
  NConfigProvider,
  darkTheme,
  NButton,
  NIcon,
  NSpace,
  NSpin,
  NTabs,
  NTabPane
} from "naive-ui";
import { Add as AddIcon, CloseCircleOutline } from "@vicons/ionicons5";
import { usePostMessage } from "./usePostMessage";
import { computed } from "vue";
import MemoCard from "./Memo.vue";
const { data, config, send, status } = usePostMessage();
send("init");

const theme = computed(() => {
  if (config.value.theme === "dark") {
    return darkTheme;
  }
  return null;
});
const collapseClick = () => {
  console.log("abbb");
};
const addMemo = () => {
  send("add-memo");
};

const download = (title:string,data:Blob) => {
  const url = URL.createObjectURL(data);
  let fileName = title;
  var link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  const timer = setTimeout(() => {
    window.URL.revokeObjectURL(link.href);
    clearTimeout(timer);
  }, 1000);
};
const snip = async () => {
  status.value.loading = true;
  let oldContent = await navigator.clipboard.read();
  const close = async (t: NodeJS.Timeout, data: Blob) => {
    clearInterval(t);
    // download("截图.png",data)
  };
  const timer = setInterval(async () => {
    const currentContent = await navigator.clipboard.read();
    const nb = await currentContent[0].getType(currentContent[0].types[0]);
    const ob = await oldContent[0].getType(oldContent[0].types[0]);
    if (nb.size !== ob.size) {
      close(timer, nb);
      return;
    }
    if ((await nb.text()) !== (await ob.text())) {
      close(timer, nb);
      return;
    }
  }, 300);
  send("snip");
};
</script>
<template>
  <n-config-provider :theme="theme">
    <n-spin :show="status.loading">
      <div style="min-height: 100vh;">
        <n-space style="margin-bottom: 10px">
          <n-button size="tiny" @click="snip">截屏</n-button>
        </n-space>
        <n-tabs type="card">
          <n-tab-pane name="todo" tab="待办事项"></n-tab-pane>
          <n-tab-pane name="memo" class="memos" tab="便笺">
            <template #header-extra>
              <n-button text #icon @click.stop="collapseClick"
                ><n-icon><AddIcon /></n-icon
              ></n-button>
            </template>
            <memo-card v-for="item of data.memo" :data="item" :key="item.key" />
            <n-button @click="addMemo" style="width: 100%; margin-top: 10px"
              >添加</n-button
            >
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>
  </n-config-provider>
</template>
<style>
.memos .n-card > .n-card__content {
  padding: 0 !important;
}
.memo-header {
  display: flex;
  justify-content: space-between;
}
</style>
