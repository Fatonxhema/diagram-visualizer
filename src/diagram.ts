export function generateVSCodeDrawioContent(classes: any[], relationships: any[]) {
    const drawioXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2024-01-01T00:00:00.000Z" agent="Mozilla/5.0" version="21.6.1" type="device">
    <diagram name="Page-1" id="class-diagram">
        <mxGraphModel dx="1422" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
            <root>
                <mxCell id="0" />
                <mxCell id="1" parent="0" />
                ${classes.map((cls, index) => generateClass(cls, index)).join('\n')}
                ${generateRelationships(classes, relationships)}
            </root>
        </mxGraphModel>
    </diagram>
</mxfile>`;

    return drawioXml;
}

function generateClass(cls: any, index: number): string {
    if (!cls || !cls.name) return '';

    const x = 100 + (index % 3) * 300;
    const y = 100 + Math.floor(index / 3) * 200;
    const classId = `class${index}`;
    
    // Calculate heights
    const attributeHeight = (cls.attributes?.length || 0) * 26;
    const methodHeight = (cls.methods?.length || 0) * 26;
    const totalHeight = 40 + attributeHeight + methodHeight + (cls.attributes?.length ? 10 : 0) + (cls.methods?.length ? 10 : 0);

    return `
                <mxCell id="${classId}" value="${cls.name}" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;" vertex="1" parent="1">
                    <mxGeometry x="${x}" y="${y}" width="240" height="${totalHeight}" as="geometry"/>
                </mxCell>
                ${generateAttributes(cls.attributes || [], classId)}
                ${cls.attributes?.length ? `<mxCell id="${classId}_separator" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;" vertex="1" parent="${classId}">
                    <mxGeometry y="${26 + attributeHeight}" width="240" height="8" as="geometry"/>
                </mxCell>` : ''}
                ${generateMethods(cls.methods || [], classId, attributeHeight)}`;
}

function generateAttributes(attributes: string[], parentId: string): string {
    return attributes.map((attr, index) => {
        const cleanedAttr = attr.replace(/^[+#-]/, '').trim();
        const visibility = attr.charAt(0) === '+' ? '+ ' : (attr.charAt(0) === '#' ? '# ' : '- ');
        
        return `
                <mxCell id="${parentId}_attr${index}" value="${visibility}${cleanedAttr}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="${parentId}">
                    <mxGeometry y="${26 + (index * 26)}" width="240" height="26" as="geometry"/>
                </mxCell>`;
    }).join('');
}

function generateMethods(methods: string[], parentId: string, attributeHeight: number): string {
    return methods.map((method, index) => {
        const cleanedMethod = method.replace(/^[+#-]/, '').trim();
        const visibility = method.charAt(0) === '+' ? '+ ' : (method.charAt(0) === '#' ? '# ' : '- ');
        
        return `
                <mxCell id="${parentId}_method${index}" value="${visibility}${cleanedMethod}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="${parentId}">
                    <mxGeometry y="${44 + attributeHeight + (index * 26)}" width="240" height="26" as="geometry"/>
                </mxCell>`;
    }).join('');
}

function generateRelationships(classes: any[], relationships: any[]): string {
    return relationships.map((rel, index) => {
        if (!rel || !rel.from || !rel.to) return '';

        const fromIndex = classes.findIndex(cls => cls.name === rel.from);
        const toIndex = classes.findIndex(cls => cls.name === rel.to);
        
        if (fromIndex === -1 || toIndex === -1) return '';

        const fromId = `class${fromIndex}`;
        const toId = `class${toIndex}`;
        
        return `
                <mxCell id="rel${index}" value="" style="endArrow=block;endFill=0;endSize=12;html=1;rounded=0;" edge="1" parent="1" source="${fromId}" target="${toId}">
                    <mxGeometry width="160" relative="1" as="geometry">
                        <mxPoint x="340" y="300" as="sourcePoint"/>
                        <mxPoint x="500" y="300" as="targetPoint"/>
                    </mxGeometry>
                </mxCell>`;
    }).join('');
}