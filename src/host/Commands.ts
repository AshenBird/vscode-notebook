import {window, commands, ExtensionContext } from "vscode";

export const register = (context:ExtensionContext)=>{
  const handle = ()=>{
    // window.showInputBox();
  };
  const name = "mcswift.notebook.add";
  commands.registerCommand(name,handle);
};