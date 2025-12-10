import { commands, Uri, WebviewView, workspace, window } from "vscode";
import * as fs from "fs";
import * as Path from "path";
import { CustomView } from "./Webview";

const fileTypes = {
  md: {
    selection: async (path: string) => {
      const uri = Uri.file(path);
      await commands.executeCommand("vscode.openWith", uri, "MarkSwift");
    },
  },
  default: {
    selection: async (path: string) => {
      const uri = Uri.file(path);
      await commands.executeCommand("vscode.open", uri);
    },
  },
};

const extNames = ["md","pdf","dio","drawio","epub",];
interface DirTree {
  label: string;
  type: string;
  children?: DirTree[];
  key: string;
}
export class NoteExplorerWebview extends CustomView {
  constructor() {
    super("explorer");
    this.events = {
      init: (webviewView) => {
        this.update(webviewView);

        // @todo 这个地方要优化监听，直接从文件系统发生的变更无法监听到，这里只能监听在vscode内进行的变更
        const updateQueue = [
          workspace.onDidChangeWorkspaceFolders,
          workspace.onDidCreateFiles,
          workspace.onDidDeleteFiles,
          workspace.onDidRenameFiles,
        ];
        updateQueue.forEach((item) => {
          item(() => {
            this.update(webviewView);
          });
        });
      },
      change: (webviewView, message) => {
        const { type, path } = message.data;
        if(Object.keys(fileTypes).includes(type)){
          // @ts-ignore
          fileTypes[type].selection(path);
        }else{
          fileTypes["default"].selection(path);
        }
        
      },
    };
  }
  async getTree() {
    const result: DirTree[] = [];
    const { workspaceFolders } = workspace;
    if (!workspaceFolders?.length) {
      return result;
    }

    for (const folder of workspaceFolders) {
      result.push(await this.plant(folder.uri.fsPath, folder.name, true));
    }
    return result;
  }
  private async plant(path: string, name: string, isFolder: boolean) {
    const r: DirTree = {
      label: name,
      type: "",
      key: path,
    };
    if (isFolder) {
      r.type = "folder";
      const dir = fs.opendirSync(path);
      r.children = [] as DirTree[];
      for await (const dirent of dir) {
        const ns = dirent.name.split(".");
        const suffix = ns.pop();
        const isDirectory = dirent.isDirectory();
        if (
          !isDirectory &&
          (ns.length === 0 || !suffix || !extNames.includes(suffix))
        ) {
          continue;
        }
        if(name==="drawio_assets"){
          continue;
        }
        if(name.startsWith(".")){
          continue;
        }
        r.children.push(
          await this.plant(
            Path.join(path, dirent.name),
            dirent.name,
            isDirectory
          )
        );
      }
      r.children.sort((a,b)=>{
        if(a.type===b.type){return 0;};
        if(a.type==="folder"){return -1;};
        if(b.type==="folder"){return 1;};
        return 0;
      });
    } else {
      r.type = name.split(".").pop() as keyof typeof fileTypes;
    }
    return r;
  }
  async update(webviewView: WebviewView) {
    this.send(webviewView.webview, "tree", await this.getTree());
  }
}
