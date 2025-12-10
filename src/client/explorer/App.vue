<script setup lang="tsx">
import { NConfigProvider, darkTheme, NSpin, NTree, NIcon } from "naive-ui";
import { Notebook as NotebookIcon } from "@vicons/tabler";
import {
  Book as BookIcon,
  FilePdfRegular as PDFIcon,
  Markdown as MDIcon,
} from "@vicons/fa";
import { useVscode } from "./useVscode";
import { computed, nextTick, ref, VNodeChild } from "vue";
import { TreeRenderProps, TreeOption } from "naive-ui/lib/tree/src/interface";
import DrawioIcon from "./icons/DrawioIcon.vue";

type NodeType = "md" | "dio" | "pdf" | "epub" | "folder" | "drawio";

interface DirTree {
  label: string;
  type: NodeType;
  children?: DirTree[];
  key: string;
}
const iconMap: Record<NodeType, VNodeChild> = {
  folder: <NotebookIcon />,
  pdf: <PDFIcon />,
  md: <MDIcon />,
  dio: <DrawioIcon />,
  drawio: <DrawioIcon />,
  epub: <BookIcon />,
};
const { config, send, status, listeners, hasInit } = useVscode();
const tree = ref<DirTree[]>([]);

// 活动的节点控制
const actives = ref<string[]>([]);
const onActiveChange = (
  keys: Array<string | number>,
  options: Array<TreeOption | null>
) => {
  if (!options[0] || options[0].type === "folder") return;
  const { type, key } = options[0];
  send("change", { type, path: key });
};


const expandKeys = ref<(string|number)[]>([]);
const onExpendChange = (keys:(string|number)[])=>{
  expandKeys.value = keys
}

//
const theme = computed(() => {
  if (config.value.theme === "dark") {
    return darkTheme;
  }
  return null;
});

listeners.value.set("tree", async (ev) => {
  tree.value = ev.data.payload;
  await nextTick()
  expandKeys.value.push(tree.value[0].key)
});

hasInit.value = true;

const renderPrefix = ({ option }: TreeRenderProps) => (
  <div class="node-prefix"><NIcon>{iconMap[option.type as NodeType]}</NIcon></div>
);
// @ts-ignore
const renderLabel = ({ option }) => <div>{option.label}</div>;
const renderSuffix = () => <div></div>;
</script>
<template>
  <n-config-provider :theme="theme">
    <n-spin :show="status.loading">
      <div style="min-height: 100vh">
        <n-tree
          :expanded-keys="expandKeys"
          :selected-keys="actives"
          @update:selected-keys="onActiveChange"
          @update:expanded-keys="onExpendChange"
          :render-prefix="renderPrefix"
          :render-label="renderLabel"
          :render-suffix="renderSuffix"
          default-expand-all
          selectable
          :data="tree"
          block-node
        />
      </div>
    </n-spin>
  </n-config-provider>
</template>
<style>
.node-prefix {
  height: 1.7em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.n-tree .n-tree-node-content .n-tree-node-content__prefix {
  height: 100%;
}
</style>
