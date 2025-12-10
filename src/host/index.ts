
import * as vscode from 'vscode';
import {createExtensions} from "./Extension";
export function activate(context: vscode.ExtensionContext) {
	createExtensions(context);
}

export function deactivate() {}
