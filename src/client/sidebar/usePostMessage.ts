import { ref, provide } from "vue";
import { Memo } from "./interface";

// @ts-ignore
const vscode = acquireVsCodeApi();
export const usePostMessage = ()=>{
  
  const data = ref<{memo:Memo[], todo:unknown[]}>({
    memo:[],
    todo:[]
  });
  const config = ref<Record<string,unknown>>({});
  const status = ref<{
    loading:boolean
  }>({
    loading:false
  });
  provide("config",config);
  provide("data", data);
  const onMessage = (ev:MessageEvent)=>{
    const { name, payload } = ev.data as {
      name:"config"|"memo"|"todo",
      payload:any
    };
    ({
      config(){
        config.value = payload;
      },
      memo(){
        data.value.memo = payload||[];
      },
      todo(){
        data.value.todo = payload||[];
      },
      snipBegin(){
        status.value.loading = false;
      },
      snipResult(){
        console.log(payload);
      }
    }[name])();
  };

  const send = (type:string, data:any ="")=>{
    vscode.postMessage({
      type,
      data
    });
  };
  window.addEventListener("message",onMessage);
  return {data, config, send, status};
};