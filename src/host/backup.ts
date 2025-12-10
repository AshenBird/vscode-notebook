import {
  CancellationToken,
  commands,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  extensions,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  workspace,
} from "vscode";
import * as fs from "fs";
import * as Path from "path";
import { CustomView } from "./Webview";

const currentIconThemeConf = (() => {
  const themeName = workspace.getConfiguration().get("workbench.iconTheme");

  const themes = [];
  for (const ex of extensions.all) {
    const ts = ex.packageJSON?.contributes?.iconThemes;
    if (ts) {
      themes.push(...ts.map((t: any) => ({ theme: t, extension: ex })));
    }
  }
  const currentTheme = themes.find((item) => item.theme.id === themeName);

  const currentThemeExtensionPath = currentTheme.extension.extensionPath;
  const currentThemeConfPath = currentTheme.theme.path;

  const themeConfPath = Path.join(
    currentThemeExtensionPath,
    currentThemeConfPath
  );

  const c = JSON.parse(fs.readFileSync(themeConfPath, { encoding: "utf-8" }));
  return { path: themeConfPath, ...c };
})();

const getIcon = (exn: string, name?: string) => {
  let iconName = currentIconThemeConf.fileExtensions[exn];
  if (iconName) {
    const { iconPath } = currentIconThemeConf.iconDefinitions[iconName];
    return Uri.file(Path.resolve(currentIconThemeConf.path, "../", iconPath));
  }
  if (name) {
    return new ThemeIcon(name);
  }
  return new ThemeIcon("file");
};

const fileTypes = {
  md: {
    icon: getIcon("md", "markdown"), //new ThemeIcon("markdown"),
    selection: async (item: NoteItem) => {
      const uri = Uri.file(item.path);
      await commands.executeCommand("vscode.openWith", uri, "MarkSwift");
    },
  },
  dio: {
    icon: getIcon("dio"),
    selection: async (item: NoteItem) => {
      const uri = Uri.file(item.path);
      await commands.executeCommand("vscode.open", uri);
    },
  },
  pdf: {
    icon: getIcon("pdf"),
    selection: async (item: NoteItem) => {
      const uri = Uri.file(item.path);
      await commands.executeCommand("vscode.open", uri);
    },
  },
};

export class NoteExplorerProvider implements TreeDataProvider<NoteItem> {
  static fileTypeMap = new Map(Object.entries(fileTypes));
  constructor() {
    this.listen();
  }
  listen() {
    const queue = [
      workspace.onDidChangeWorkspaceFolders,
      workspace.onDidCreateFiles,
      workspace.onDidDeleteFiles,
      workspace.onDidRenameFiles,
    ];
    queue.forEach((item) => {
      item(() => {
        this.refresh();
      });
    });
  }
  async register() {
    const treeDataProvider = new NoteExplorerProvider();
    const noteExplorer = await window.createTreeView("note-explorer", {
      treeDataProvider,
    });
    noteExplorer.onDidChangeSelection(async ({ selection }) => {
      if (selection.length === 0) {
        return;
      }
      const item = selection[0];
      if (item.collapsibleState === 0) {
        const type = item.label.split(".").pop() as string;
        NoteExplorerProvider.fileTypeMap.get(type)?.selection(item);
      }
    });
    return noteExplorer;
  }
  getTreeItem(element: NoteItem): TreeItem {
    return element;
  }

  async getChildren(element?: NoteItem) {
    if (!element) {
      const folders = workspace.workspaceFolders;
      if (folders?.length) {
        return folders.map((item) => {
          const rootPath = item.uri.fsPath;
          return new NoteItem({
            label: item.name,
            collapsibleState: 2,
            path: rootPath,
          });
        });
      }
    }
    if (element?.collapsibleState === 0) {
      return [];
    }
    if (element) {
      const dir = fs.opendirSync(element.path);
      const result = [];
      for await (const dirent of dir) {
        const name = dirent.name;

        const _path = Path.join(element.path, dirent.name);

        if (!(await this.check(dirent, _path))) {
          continue;
        }

        // 如果是文件夹，要预检
        result.push(
          new NoteItem({
            label: name,
            collapsibleState: dirent.isFile() ? 0 : 1,
            path: _path,
          })
        );
      }
      // dir.close();
      return result.sort(({ collapsibleState: a }, { collapsibleState: b }) => {
        if (a * b !== 0) {
          return 0;
        }
        return b - a > 0 ? 1 : -1;
      });
    }
    return [];
  }
  async check(dirent: fs.Dirent, p: string) {
    const name = dirent.name;
    const fileArg = () => {
      const suffix = name.split(".").pop();
      if (!suffix) {
        return false;
      }
      return NoteExplorerProvider.fileTypeMap.has(suffix);
    };
    if (dirent.isFile() && fileArg()) {
      return true;
    }

    if (dirent.isDirectory()) {
      //   const dir = fs.opendirSync(p);
      //   const _p = dir.path;
      //   // 开始递归遍历，只要找到一个就行
      //   for await (const _dn of fs.opendirSync(p)) {
      //     if (await this.check(_dn, path.join(_p, _dn.name))) { return true; }
      //   };
      return true;
    }
    return false;
  }

  private _onDidChangeTreeData: EventEmitter<
    NoteItem | undefined | null | void
  > = new EventEmitter<NoteItem | undefined | null | void>();
  readonly onDidChangeTreeData: Event<NoteItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class NoteItem extends TreeItem {
  public readonly label: string;
  // private version: string,
  public readonly collapsibleState: TreeItemCollapsibleState;
  public dir?: fs.Dir;
  public path: string;

  constructor(option: {
    label: string;
    collapsibleState: TreeItemCollapsibleState;
    dir?: fs.Dir;
    path: string;
  }) {
    super(option.label, option.collapsibleState);
    this.label = option.label;
    this.collapsibleState = option.collapsibleState;
    this.dir = option.dir;
    this.path = option.path;
    if (this.collapsibleState === 0) {
      // this.command = ;
      const type = this.label.split(".").pop() as string;
      this.iconPath = NoteExplorerProvider.fileTypeMap.get(type)?.icon;
    } else {
      this.iconPath = ThemeIcon.Folder;
    }
    // this.tooltip = `${this.label}-${this.version}`;
    // this.description = this.version;
  }

  // iconPath = {
  //   light: path.join(__filename, '..', '..', 'resources', 'light', 'NoteItem.svg'),
  //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'NoteItem.svg')
  // };
}
