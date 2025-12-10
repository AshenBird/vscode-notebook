import { ExtensionContext, workspace,Uri } from "vscode";
import { ensureFileSync } from "fs-extra";
export const checkFiles = async (context:ExtensionContext)=>{
  if(!workspace.workspaceFolders){return;}
  const workspaceFolder = workspace.workspaceFolders[0];

  const fileList = await workspace.fs.readDirectory(workspaceFolder.uri);

  const hasDir = fileList.some(item=>item[0]===".mcswift");
  const workspaceFolderPath = workspaceFolder.uri.fsPath;
  if(!hasDir){
    await workspace.fs.createDirectory(
      Uri.file(workspaceFolderPath+"/.mcswift")
    );
  }
  ensureFileSync(workspaceFolderPath+"/.mcswift/todo.json");
  ensureFileSync(workspaceFolderPath+"/.mcswift/memo.json");
};