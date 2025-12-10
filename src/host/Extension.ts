import * as vscode from "vscode";
import { NoteExplorerWebview } from "./Explorer";

export interface ExtensionsMap {
  markdown?: vscode.Extension<{ editor: MarkdownEditorProvider }>;
}
export interface MarkdownEditorProvider
  extends vscode.CustomTextEditorProvider {
  createAsWebviewPanel: (
    document: vscode.TextDocument
  ) => Thenable<ReturnType<typeof vscode.window.createWebviewPanel>>;
}

	
const noteMap = new Map();
export const createExtensions = async (context: vscode.ExtensionContext) => {
  const noteExplorer = new NoteExplorerWebview().register(context);
  
  context.subscriptions.push(noteExplorer);
};
