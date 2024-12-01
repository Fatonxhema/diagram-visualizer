import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parseJava, parseCSharp } from "./parser";
import { generateVSCodeDrawioContent } from "./diagram";

interface Relationship {
    from: string;
    to: string;
    type: 'inheritance' | 'implementation' | 'association' | 'composition' | 'aggregation';
}

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

            if (!files || files.length === 0) {
                vscode.window.showInformationMessage("No files selected");
                return;
            }

            try {
                // First pass: Parse all classes to get their names and structure
                const classData = files.map((file) => {
                    const content = fs.readFileSync(file.fsPath, "utf-8");
                    return {
                        filePath: file.fsPath,
                        content: content,
                        parsed: file.fsPath.endsWith(".java")
                            ? parseJava(content)
                            : parseCSharp(content)
                    };
                });

                // Second pass: Analyze relationships
                const relationships: Relationship[] = [];
                const classMap = new Map(classData.map(data => [data.parsed.name, data]));

                // Analyze each file for relationships
                for (const fileData of classData) {
                    const content = fileData.content;
                    const className = fileData.parsed.name;

                    if (fileData.filePath.endsWith(".java")) {
                        // Java relationships
                        analyzeJavaRelationships(content, className, classMap, relationships);
                    } else {
                        // C# relationships
                        analyzeCSharpRelationships(content, className, classMap, relationships);
                    }
                }

                // Generate the draw.io XML format with relationships
                const diagramXml = generateVSCodeDrawioContent(
                    classData.map(d => d.parsed),
                    relationships
                );

                // Get workspace folder or file directory
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 
                                      path.dirname(files[0].fsPath);

                // Create default filename
                const defaultFileName = classData[0]?.parsed.name 
                    ? `${classData[0].parsed.name}_diagram.drawio`
                    : `class_diagram_${new Date().getTime()}.drawio`;

                // Show save dialog
                const saveUri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(path.join(workspaceFolder, defaultFileName)),
                    filters: {
                        "Draw.io Files": ["drawio"],
                    },
                });

                if (saveUri) {
                    // Write diagram XML to file
                    fs.writeFileSync(saveUri.fsPath, diagramXml);

                    // Open the file
                    const document = await vscode.workspace.openTextDocument(saveUri);
                    await vscode.window.showTextDocument(document, {
                        preview: false,
                        viewColumn: vscode.ViewColumn.One
                    });

                    vscode.window.showInformationMessage(
                        `Class diagram saved to ${path.basename(saveUri.fsPath)}`
                    );
                }

                // Show preview
                const panel = vscode.window.createWebviewPanel(
                    "classDiagram",
                    "Class Diagram Preview",
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                panel.webview.html = generatePreviewHtml(diagramXml, relationships);

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error generating class diagram: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

function analyzeJavaRelationships(
    content: string,
    className: string,
    classMap: Map<string, any>,
    relationships: Relationship[]
) {
    // Check for inheritance
    const extendsMatch = content.match(/class\s+\w+\s+extends\s+(\w+)/);
    if (extendsMatch && classMap.has(extendsMatch[1])) {
        relationships.push({
            from: className,
            to: extendsMatch[1],
            type: 'inheritance'
        });
    }

    // Check for interface implementations
    const implementsMatch = content.match(/implements\s+([\w\s,]+)/);
    if (implementsMatch) {
        const interfaces = implementsMatch[1].split(',').map(i => i.trim());
        for (const iface of interfaces) {
            if (classMap.has(iface)) {
                relationships.push({
                    from: className,
                    to: iface,
                    type: 'implementation'
                });
            }
        }
    }

    // Check for associations through fields
    const fieldMatches = Array.from(content.matchAll(/private\s+(\w+)\s+\w+;/g));
    for (const match of fieldMatches) {
        const fieldType = match[1];
        if (classMap.has(fieldType)) {
            relationships.push({
                from: className,
                to: fieldType,
                type: 'association'
            });
        }
    }
}

function analyzeCSharpRelationships(
    content: string,
    className: string,
    classMap: Map<string, any>,
    relationships: Relationship[]
) {
    // Check for inheritance and interface implementations
    const inheritanceMatch = content.match(/class\s+\w+\s*:\s*([\w\s,]+)/);
    if (inheritanceMatch) {
        const inheritedTypes = inheritanceMatch[1].split(',').map(t => t.trim());
        for (const type of inheritedTypes) {
            if (classMap.has(type)) {
                relationships.push({
                    from: className,
                    to: type,
                    type: type.startsWith('I') ? 'implementation' : 'inheritance'
                });
            }
        }
    }

    // Check for associations through properties and fields
    const propertyMatches = Array.from(content.matchAll(/(?:public|private)\s+(\w+)\s+\w+\s*{\s*get;\s*set;\s*}/g));
    for (const match of propertyMatches) {
        const propertyType = match[1];
        if (classMap.has(propertyType)) {
            relationships.push({
                from: className,
                to: propertyType,
                type: 'association'
            });
        }
    }
}

function generatePreviewHtml(diagramXml: string, relationships: Relationship[]): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Class Diagram Preview</title>
            <style>
                body { padding: 10px; font-family: Arial, sans-serif; }
                pre { 
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 4px;
                }
                .relationships {
                    margin: 20px 0;
                    padding: 15px;
                    background: #fff8dc;
                    border-radius: 4px;
                }
                .relationship-item {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <h3>Generated Class Diagram</h3>
            <div class="relationships">
                <h4>Detected Relationships:</h4>
                ${relationships.map(r => `
                    <div class="relationship-item">
                        ${r.from} --[${r.type}]--> ${r.to}
                    </div>
                `).join('')}
            </div>
            <h4>Draw.io XML:</h4>
            <pre>${escapeHtml(diagramXml)}</pre>
        </body>
        </html>`;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function deactivate() {}