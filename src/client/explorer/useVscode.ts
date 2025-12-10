import { ref, provide, watch } from "vue";

export const useVscode = ()=>{
  const listeners = ref(new Map<any, (ev:MessageEvent)=>void>());
  const config = ref<Record<string,unknown>>({});
  const status = ref<{
    loading:boolean
  }>({
    loading:false
  });
  const hasInit = ref(false);
  provide("config",config);
  provide("listeners",listeners);
  provide("hasInit",hasInit);
  // @ts-ignore
  const vscode = acquireVsCodeApi();
  const onMessage = (ev:MessageEvent)=>{
    const name = ev.data.name;
    if(name==="config"){
      config.value = ev.data.payload;
    };
    if(!listeners.value.has(name)){return;};
    const listener = listeners.value.get(name) as (ev:MessageEvent)=>void;
    listener(ev);
  };

  const send = (type:string, data:any ="")=>{
    vscode.postMessage({
      type,
      data
    });
  };
  window.addEventListener("message",onMessage);
  watch(hasInit,(n,o)=>{
    if(n===o){return;};
    if(!n){return;}
    send("init");
  });
  return { config, send, status, listeners, hasInit};
};