export interface ParsedClass {
    name: string;
    attributes: string[];
    methods: string[];
}
export interface Relationship {
    from: string;
    to: string;
    type: 'inheritance' | 'composition';
}
