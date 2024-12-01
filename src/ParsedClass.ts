export interface ParsedClass {
    name: string;
    attributes: string[]; // Now includes visibility markers like "+name", "-name", "#name"
    methods: string[];
}
export interface Relationship {
    from: string;
    to: string;
    type: 'inheritance' | 'composition';
}
