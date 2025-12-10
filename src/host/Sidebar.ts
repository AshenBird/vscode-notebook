import {
  CancellationToken,
  // commands,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  TextDocument,
  Uri,
  ViewColumn,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  workspace,
  WorkspaceFolder
} from "vscode";

import { snip, SnipEmitter } from "./modules/Snip";

import { StringDecoder } from "string_decoder";
import * as path from "path";
import { UniKey } from "./UniKey";
import { ConfigController } from "./ConfigController";


function arr2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}

export class Sidebar implements Disposable, WebviewViewProvider {
  private _webview: WebviewView | undefined;
  private _disposable: Disposable | undefined;
  private template: string = "";
  private html: string = "";
  private _onDidClose = new EventEmitter<void>();
  constructor(private readonly context: ExtensionContext) { }

  // getters
  get onDidClose(): Event<void> {
    return this._onDidClose.event;
  }

  get viewColumn(): ViewColumn | undefined {
    return undefined;
  }

  get visible() {
    return this._webview ? this._webview.visible : false;
  }

  // implements
  public async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ) {
    if (!this._webview) {
      this._webview = webviewView;
    }

    this.setConf();

    this._webview.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    // 解构函数
    this._disposable = Disposable.from(
      this._webview.onDidDispose(this.onWebviewDisposed, this)
    );

    // 监听视图事件
    this._webview.webview.onDidReceiveMessage((message: any) => {
      if (message.type) {
        switch (message.type) {
          case "init":
            this.setConf();
            return;
          case "add-memo":
            return;
          case "snip":
            const p = snip();
            p.addListener("exit", () => {
              this.send("snipBegin", "");
            });
            return;
        }
      }
    });

    if(!this.html){
      this.html= await this.getHtml();
    }
    // 进行渲染
    this._webview.webview.html = this.html;
  }

  // 向视图层发送事件
  private send(name: string, payload: any) {
    const bundle = {
      name,
      payload
    };
    this._webview?.webview.postMessage(bundle);
  }

  private setConf() {
    this.send("config", {
      theme: ({
        1: "light",
        2: "dark",
        3: "light", //HighContrast
      }[window.activeColorTheme.kind]),
    });
  }

  private async getHtml(): Promise<string> {
    if (!this.template) {
      const templatePath = path.resolve(__dirname, `../client/sidebar/index.html`);
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = arr2str(arr);
    }

    // @ts-ignore
    const assetsPath = this._webview.webview.asWebviewUri(
      Uri.file(path.resolve(__dirname, `../client/sidebar`))
    );
    // const nonce = UniKey.generate();
    const result = this.template
      .replace("{{base}}", assetsPath + "/");
    return result;
  }

  // 解构相关
  private onWebviewDisposed() {
    this._onDidClose.fire();
  }

  dispose() {
    // this.destructPrivateDoc();
    this._disposable && this._disposable.dispose();
  }

  // // listenConfigChang
  // private async createPrivateDoc() {
  //   // 初始化数据
  //   this.memoDoc = await this.getPrivateDoc("memo");
  //   this.todoDoc = await this.getPrivateDoc("todo");
  // }


  // private async getPrivateDoc(type: "memo" | "todo") {
  //   // if (!workspace.workspaceFolders) { return undefined; }
  //   const workspaceFolder = (workspace.workspaceFolders as WorkspaceFolder[])[0];
  //   const doc = await workspace.openTextDocument(workspaceFolder.uri.fsPath + `/.mcswift/${type}.json`);
  //   return doc;
  // }

  // // 解构相关数据存储
  // private async destructPrivateDoc() {
  //   if (!this.memoDoc || !this.todoDoc) { return; }

  //   this.memoDoc.save();
  //   this.memoDoc = undefined;

  //   this.todoDoc.save();
  //   this.todoDoc = undefined;
  // }
}
export const createSidebar = (context: ExtensionContext) => {
  const register = () => {
    const sidebar = new Sidebar(context);
    const a = window.registerWebviewViewProvider("mcswift-sidebar", sidebar);
    context.subscriptions.push(a);
  };
  register();
};
