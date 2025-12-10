import {
  CancellationToken,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  workspace,
  ViewColumn,
} from "vscode";
import * as path from "path";
import { binary2str } from "./utils";

export class CustomView implements Disposable, WebviewViewProvider {
  protected context: ExtensionContext | undefined;
  protected template: string = "";
  protected currentView: WebviewView | undefined;
  protected events: Record<
    string,
    (webview: WebviewView, message: any) => void
  > = {};
  private _webview: Webview | undefined;
  // getters
  get onDidClose(): Event<void> {
    return this._onDidClose.event;
  }

  get viewColumn(): ViewColumn | undefined {
    return undefined;
  }

  get visible() {
    return this.currentView ? this.currentView.visible : false;
  }
  constructor(private name: string) {}
  public async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ) {
    const { webview } = webviewView;
    if (!this.currentView) {
      this.currentView = webviewView;
    }

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: this.context?.extensionUri
        ? [this.context.extensionUri]
        : undefined,
    };

    this.listen(webviewView);

    this.disposables.push(
      Disposable.from(webviewView.onDidDispose(this.onWebviewDisposed, this))
    );
    await this.getHtml(webviewView);
  }
  protected async getHtml(webviewView: WebviewView): Promise<string> {
    if (!this.template) {
      const templatePath = path.resolve(
        __dirname,
        `../client/${this.name}/index.html`
      );
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = binary2str(arr);
    }

    // @ts-ignore
    const assetsPath = webviewView.webview.asWebviewUri(
      Uri.file(path.resolve(__dirname, `../client/${this.name}`))
    );
    // const nonce = UniKey.generate();
    const result = this.template.replace("{{base}}", assetsPath + "/");
    webviewView.webview.html = result;
    return result;
  }
  protected send(webview: Webview, name: string, payload: any) {
    const bundle = {
      name,
      payload,
    };
    webview.postMessage(bundle);
  }
  protected sendConf(webview: Webview) {
    this.send(webview, "config", {
      theme: {
        1: "light",
        2: "dark",
        3: "light", //HighContrast
      }[window.activeColorTheme.kind],
    });
  }
  private listen(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage((message: any) => {
      if (message.type === "init") {
        this.sendConf(webviewView.webview);
      }
      if (this.events[message.type]) {
        this.events[message.type](webviewView, message);
      }
    });
  }
  register(context: ExtensionContext) {
    this.context = context;
    const disposable = window.registerWebviewViewProvider(
      `mcswift-note-${this.name}`,
      this,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    );
    context.subscriptions.push(disposable, this);
    return this;
  }

  // 解构相关
  protected disposables: Disposable[] = [];
  protected _onDidClose = new EventEmitter<void>();
  protected onWebviewDisposed() {
    this._onDidClose.fire();
  }
  public dispose() {
    this.disposables.forEach((disposable) => {
      disposable.dispose();
    });
  }
}
