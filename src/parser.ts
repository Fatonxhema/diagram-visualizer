import * as fs from 'fs';
import * as path from 'path';
import { ParsedClass, Relationship } from './ParsedClass';

export function parseFiles(filePaths: string[]): { classes: ParsedClass[]; relationships: Relationship[] } {
    const classes: ParsedClass[] = [];
    const relationships: Relationship[] = [];

    filePaths.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const ext = path.extname(filePath);

        if (ext === '.cs') {
            parseCSharp(content, classes, relationships);
        } else if (ext === '.java') {
            parseJava(content, classes, relationships);
        }
    });

    return { classes, relationships };
}

function parseCSharp(content: string, classes: ParsedClass[], relationships: Relationship[]) {
    const classRegex = /class\s+(\w+)/g;
    const inheritanceRegex = /class\s+(\w+)\s*:\s*(\w+)/g;
    const attributeRegex = /\s*(public|private|protected)\s+(\w+)\s+(\w+);/g;
    const methodRegex = /\s*(public|private|protected)\s+\w+\s+(\w+)\s*\(/g;

    let match;
    while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        classes.push({ name: className, attributes: [], methods: [] });
    }

    while ((match = inheritanceRegex.exec(content)) !== null) {
        relationships.push({ from: match[2], to: match[1], type: 'inheritance' });
    }

    classes.forEach((cls) => {
        while ((match = attributeRegex.exec(content)) !== null) {
            cls.attributes.push(`${match[2]} ${match[3]}`);
        }
        while ((match = methodRegex.exec(content)) !== null) {
            cls.methods.push(`${match[2]}()`);
        }
    });
}

function parseJava(content: string, classes: ParsedClass[], relationships: Relationship[]) {
    const classRegex = /class\s+(\w+)/g;
    const inheritanceRegex = /class\s+(\w+)\s+extends\s+(\w+)/g;
    const attributeRegex = /\s*(public|private|protected)\s+(\w+)\s+(\w+);/g;
    const methodRegex = /\s*(public|private|protected)\s+\w+\s+(\w+)\s*\(/g;

    let match;
    while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        classes.push({ name: className, attributes: [], methods: [] });
    }

    while ((match = inheritanceRegex.exec(content)) !== null) {
        relationships.push({ from: match[2], to: match[1], type: 'inheritance' });
    }

    classes.forEach((cls) => {
        while ((match = attributeRegex.exec(content)) !== null) {
            cls.attributes.push(`${match[2]} ${match[3]}`);
        }
        while ((match = methodRegex.exec(content)) !== null) {
            cls.methods.push(`${match[2]}()`);
        }
    });
}
