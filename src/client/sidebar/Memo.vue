<script lang="ts" setup>
import {
  NCard,
  NButton,
  NIcon,
  NInput
} from "naive-ui"
import {
  // Add as AddIcon,
  CloseCircleOutline as CloseIcon,
} from "@vicons/ionicons5";
import { PropType } from "vue";
import { Memo } from "./interface"
const props = defineProps({
  data:{
    type: Object as PropType<Memo>,
    required: true  
  },
})

const emit = defineEmits({
  "delete":null,
  "input":null
})

const del = ()=>{
  emit("delete", props.data.key);
}

const onInput = (content:string)=>{
  emit("input", {key:props.data.key, content});
}

</script>
<template>
  <n-card header-style="padding: 10px 14px !important">
    <template #header>
      <div class="memo-header">
        <div></div>
        <n-button text @click.stop="del" #icon>
          <n-icon ><close-icon /></n-icon>
        </n-button>
      </div>
    </template>
    <n-input
      style="border-radius: 0"
      type="textarea"
      :value="props.data.content"
      @input="onInput"
      :rows="8"
      placeholder="内容"
    />
  </n-card>
</template>
