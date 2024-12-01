import * as vscode from "vscode";
import * as fs from "fs";
import { parseFiles } from "./parser";
import { generateDiagramWebView } from "./diagram";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "classDiagram.generate",
    async () => {
      const files = await vscode.window.showOpenDialog({
        canSelectMany: true,
        filters: {
          "Source Files": ["cs", "java"],
        },
      });

      if (!files) return;

      // Parse the selected files to extract class details and relationships
      const filePaths = files.map((file) => file.fsPath);
      const { classes, relationships } = parseFiles(filePaths);

      // Create a new Webview Panel to display the diagram
      const panel = vscode.window.createWebviewPanel(
        "classDiagram",
        "Class Diagram",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      // Generate the diagram and set it as the panel's webview content
      generateDiagramWebView(panel, classes, relationships);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
