import { ParsedClass } from "./ParsedClass";

export function parseJava(content: string): ParsedClass {
  const classRegex =
    /(?:public\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?/;
  const fieldRegex =
    /(?:public|protected|private|static|final|\s)*(?:[\w<>[\],\s]+)\s+(\w+)\s*(?:=.*?)?;/gm;
  const methodRegex =
    /(?:public|protected|private|static|\s) +[\w\<\>\[\],\s]+\s+(\w+) *\([^)]*\) *(?:throws[\w,\s]+)?\s*\{/gm;

  const result: ParsedClass = {
    name: "",
    attributes: [],
    methods: [],
  };

  // Find class name
  const classMatch = content.match(classRegex);
  if (classMatch) {
    result.name = classMatch[1];
  }

  // Find fields with full signature
  let match;
  const processedFields = new Set<string>();

  while ((match = fieldRegex.exec(content)) !== null) {
    const fullMatch = match[0].trim();
    const fieldName = match[1];

    // Skip if we've already processed this field or if it looks like a method declaration
    if (processedFields.has(fieldName) || fullMatch.includes("(")) continue;

    // Clean up the field declaration
    const cleanField = fullMatch
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*$/, "")
      .replace(/\s*=\s*.*$/, "");

    processedFields.add(fieldName);
    result.attributes.push(transformICollectionDeclarations(cleanField));
  }

  // Find methods with full signature
  const processedMethods = new Set<string>();

  while ((match = methodRegex.exec(content)) !== null) {
    const fullMatch = match[0].trim();
    const methodName = match[1];

    if (processedMethods.has(methodName)) continue;

    // Clean up the method signature
    const cleanMethod = fullMatch
      .replace(/\s+/g, " ")
      .replace(/\s*\{\s*$/, "")
      .trim();

    processedMethods.add(methodName);
    result.methods.push(transformICollectionDeclarations(cleanMethod));
  }

  return result;
}

export function parseCSharp(content: string): ParsedClass {
  const classRegex =
    /(?:public|internal|private|protected|\s)*\s*class\s+(\w+)(?:\s*:\s*[\w,\s]+)?/;
  const propertyRegex =
    /(?:public|private|protected|internal|static|\s)*(?:[\w<>[\],\s]+)\s+(\w+)\s*\{[^{}]*\}/gm;
  const methodRegex =
    /(?:public|private|protected|internal|static|virtual|override|abstract|\s)* +[\w\<\>\[\],\s]+\s+(\w+)\s*\([^)]*\)\s*(?:where\s+[\w\s,:<>]+)?[;{]/gm;

  const result: ParsedClass = {
    name: "",
    attributes: [],
    methods: [],
  };

  // Find class name
  const classMatch = content.match(classRegex);
  if (classMatch) {
    result.name = classMatch[1];
  }

  // Find properties with full signature
  let match;
  const processedProperties = new Set<string>();

  while ((match = propertyRegex.exec(content)) !== null) {
    const fullMatch = match[0].trim();
    const propertyName = match[1];

    if (processedProperties.has(propertyName)) continue;

    // Clean up the property declaration
    const cleanProperty = fullMatch
      .replace(/\s+/g, " ")
      .replace(/\s*\{\s*.*\s*\}\s*$/, " { get; set; }")
      .trim();

    processedProperties.add(propertyName);
    result.attributes.push(transformICollectionDeclarations(cleanProperty));
  }

  // Find methods with full signature
  const processedMethods = new Set<string>();

  while ((match = methodRegex.exec(content)) !== null) {
    const fullMatch = match[0].trim();
    const methodName = match[1];

    // Skip property accessors and already processed methods
    if (
      methodName === "get" ||
      methodName === "set" ||
      methodName === "init" ||
      processedMethods.has(methodName)
    )
      continue;

    // Clean up the method signature
    const cleanMethod = fullMatch
      .replace(/\s+/g, " ")
      .replace(/[;{]\s*$/, "")
      .trim();

    processedMethods.add(methodName);
    result.methods.push(transformICollectionDeclarations(cleanMethod));
  }

  return result;
}
/**
 * Transforms strings in the format "public virtual ICollection<T> Ts"
 * to "+ T[] t".
 *
 * @param inputLines - A string to transform.
 * @returns A new transformed string.
 */
function transformICollectionDeclarations(line: string): string {
  const match = /public virtual ICollection<(\w+)> (\w+)/.exec(line);
  if (match) {
    const [_, type, name] = match; // Destructure the matched groups
    return sanitizeString(`+ ${type}[] ${name.toLowerCase()}`);
  }
  return sanitizeString(line); // Return the line unchanged if it doesn't match
}

/**
 * Removes all characters from the input string that are not alphanumeric
 * or one of the allowed special characters: +, -, #, _, (, ), [, ], ,, ., :, <, >.
 *
 * @param input - The input string to sanitize.
 * @returns The sanitized string.
 */
function sanitizeString(input: string): string {
  return input.replace(/[^a-zA-Z0-9+#\-_ ()[\],.:<>]/g, " ");
}
