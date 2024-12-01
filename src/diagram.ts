import * as vscode from 'vscode';

interface ParsedClass {
    name: string;
    attributes: string[];
    methods: string[];
}

interface Relationship {
    from: string;
    to: string;
    type: 'inheritance' | 'composition';
}

export function generateDiagramWebView(
    panel: vscode.WebviewPanel,
    classes: ParsedClass[],
    relationships: Relationship[]
) {
    panel.webview.html = generateWebViewContent(classes, relationships);
}

function generateWebViewContent(classes: ParsedClass[], relationships: Relationship[]): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Class Diagram</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: center;
                    margin: 0;
                    padding: 20px;
                }

                .class-box {
                    border: 2px solid #333;
                    border-radius: 5px;
                    padding: 10px;
                    width: 200px;
                    text-align: center;
                    background-color: #f9f9f9;
                    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
                }

                .class-title {
                    font-weight: bold;
                    font-size: 1.2em;
                    margin-bottom: 10px;
                }

                .class-section {
                    border-top: 1px solid #ccc;
                    padding-top: 10px;
                    margin-top: 10px;
                }

                canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: -1;
                }
            </style>
        </head>
        <body>
            <canvas id="connections"></canvas>
            <script>
                const classes = ${JSON.stringify(classes)};
                const relationships = ${JSON.stringify(relationships)};

                const canvas = document.getElementById("connections");
                const ctx = canvas.getContext("2d");

                function renderClasses() {
                    const fragment = document.createDocumentFragment();

                    classes.forEach(cls => {
                        const div = document.createElement("div");
                        div.classList.add("class-box");
                        div.id = cls.name;

                        const title = document.createElement("div");
                        title.classList.add("class-title");
                        title.textContent = cls.name;

                        div.appendChild(title);

                        if (cls.attributes.length > 0) {
                            const attrSection = document.createElement("div");
                            attrSection.classList.add("class-section");
                            attrSection.innerHTML = cls.attributes.join("<br>");
                            div.appendChild(attrSection);
                        }

                        if (cls.methods.length > 0) {
                            const methodSection = document.createElement("div");
                            methodSection.classList.add("class-section");
                            methodSection.innerHTML = cls.methods.join("<br>");
                            div.appendChild(methodSection);
                        }

                        fragment.appendChild(div);
                    });

                    document.body.appendChild(fragment);
                }

                function renderConnections() {
                    const bodyRect = document.body.getBoundingClientRect();
                    canvas.width = bodyRect.width;
                    canvas.height = bodyRect.height;

                    relationships.forEach(rel => {
                        const fromElem = document.getElementById(rel.from);
                        const toElem = document.getElementById(rel.to);

                        if (fromElem && toElem) {
                            const fromRect = fromElem.getBoundingClientRect();
                            const toRect = toElem.getBoundingClientRect();

                            const startX = fromRect.left + fromRect.width / 2;
                            const startY = fromRect.top + fromRect.height;
                            const endX = toRect.left + toRect.width / 2;
                            const endY = toRect.top;

                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);

                            if (rel.type === "inheritance") {
                                // Draw an arrow
                                const arrowSize = 10;
                                const angle = Math.atan2(endY - startY, endX - startX);
                                ctx.lineTo(
                                    endX - arrowSize * Math.cos(angle - Math.PI / 6),
                                    endY - arrowSize * Math.sin(angle - Math.PI / 6)
                                );
                                ctx.moveTo(endX, endY);
                                ctx.lineTo(
                                    endX - arrowSize * Math.cos(angle + Math.PI / 6),
                                    endY - arrowSize * Math.sin(angle + Math.PI / 6)
                                );
                            }

                            ctx.strokeStyle = rel.type === "composition" ? "blue" : "black";
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                }

                renderClasses();
                renderConnections();

                window.addEventListener("resize", renderConnections);
            </script>
        </body>
        </html>
    `;
}
