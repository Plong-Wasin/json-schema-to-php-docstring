/**
 * Extracts the title from a reference string by getting the last segment after '/'
 * @param {string} reference - The reference string to parse
 * @returns {string} The extracted title
 */
function extractTitleFromReference(reference) {
  const referenceParts = reference.split("/");
  return referenceParts[referenceParts.length - 1];
}

/**
 * Replaces the last occurrence of a pattern in a string
 * @param {string} sourceString - The original string
 * @param {string|RegExp} pattern - Pattern to match
 * @param {string} replacement - String to replace the pattern with
 * @returns {string} Modified string with last occurrence replaced
 */
function replaceLastOccurrence(sourceString, pattern, replacement) {
  const matchedPattern =
    typeof pattern === "string"
      ? pattern
      : (sourceString.match(new RegExp(pattern.source, "g")) || []).slice(
          -1
        )[0];

  if (!matchedPattern) return sourceString;

  const lastIndex = sourceString.lastIndexOf(matchedPattern);
  return lastIndex !== -1
    ? `${sourceString.slice(0, lastIndex)}${replacement}${sourceString.slice(
        lastIndex + matchedPattern.length
      )}`
    : sourceString;
}

/**
 * Generates output string based on JSON schema definitions
 * @param {Object} definitions - Schema definitions
 * @param {Object} schemaObject - Current schema object being processed
 * @returns {string} Generated output string
 */
function generateOutput(definitions, schemaObject) {
  let outputString = "";

  if (schemaObject.type === "object") {
    outputString += "{\n";
  }

  if (schemaObject.properties) {
    for (const propertyName in schemaObject.properties) {
      const isRequired = schemaObject.required.includes(propertyName);
      const optionalMarker = isRequired ? "" : "?";
      const property = schemaObject.properties[propertyName];

      // Handle property name formatting
      if (propertyName.includes(" ")) {
        outputString += `${propertyName}${optionalMarker}: `;
      } else {
        outputString += `"${propertyName}"${optionalMarker}: `;
      }

      // Handle different property types
      if (property.type && !["array", "object"].includes(property.type)) {
        outputString += property.type === "number" ? "float" : property.type;
        outputString += ",\n";
      } else if (property.$ref) {
        outputString += `${generateOutput(
          definitions,
          definitions[extractTitleFromReference(property.$ref)]
        )}`;
      } else if (schemaObject.anyOf) {
        outputString += processAnyOf(schemaObject.anyOf, definitions);
      } else if (property.type && ["array", "object"].includes(property.type)) {
        outputString += processArrayOrObject(property, definitions);
      } else if (property.anyOf) {
        outputString += `${processAnyOf(property.anyOf, definitions)},\n`;
      }
    }
  } else if (schemaObject.enum) {
    outputString += processEnum(schemaObject.enum);
  } else if (schemaObject.anyOf) {
    outputString += `${processAnyOf(schemaObject.anyOf, definitions)},\n`;
  } else {
    outputString +=
      schemaObject.type === "number" ? "float" : schemaObject.type;
    outputString += ",\n";
  }

  if (schemaObject.type === "object") {
    outputString += "},\n";
  }

  return outputString;
}

/**
 * Processes anyOf schema elements
 * @param {Array} anyOfArray - Array of anyOf elements
 * @param {Object} definitions - Schema definitions
 * @returns {string} Processed string
 */
function processAnyOf(anyOfArray, definitions) {
  return anyOfArray
    .map((type) => {
      if (type.$ref) {
        return generateOutput(
          definitions,
          definitions[extractTitleFromReference(type.$ref)]
        ).replace(/,\s*$/, "");
      }
      return type.type;
    })
    .join(" | ");
}

/**
 * Processes array or object type properties
 * @param {Object} property - Property object
 * @param {Object} definitions - Schema definitions
 * @returns {string} Processed string
 */
function processArrayOrObject(property, definitions) {
  let output = "";

  if (property?.items?.type) {
    output += `${property.items.type},\n`;
  } else if (property?.items?.$ref) {
    output += `${generateOutput(
      definitions,
      definitions[extractTitleFromReference(property.items.$ref)]
    )}`;
  } else if (property?.additionalProperties?.$ref) {
    output += `${generateOutput(
      definitions,
      definitions[extractTitleFromReference(property.additionalProperties.$ref)]
    )}`;
  } else {
    output += "mixed,\n";
  }

  return replaceLastOccurrence(output, ",\n", "[],\n");
}

/**
 * Processes enum values
 * @param {Array} enumValues - Array of enum values
 * @returns {string} Processed string
 */
function processEnum(enumValues) {
  return (
    enumValues
      .map((value) => (typeof value === "string" ? `"${value}"` : value))
      .join(" | ") + ",\n"
  );
}

/**
 * Formats the generated output string
 * @param {string} inputString - String to format
 * @param {boolean} addStar - Whether to add stars in formatting
 * @returns {string} Formatted string
 */
function formatOutput(inputString, addStar = false) {
  const lines = inputString
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let indentLevel = 0;

  lines.forEach((line, index) => {
    if (line.includes("}")) {
      indentLevel--;
    }
    lines[index] = " ".repeat(indentLevel * 4) + line;
    if (line.includes("array{")) {
      indentLevel++;
    }
  });

  return replaceLastOccurrence(lines.join(`\n${addStar ? "*" : ""}`), ",", "");
}

/**
 * Generates schema from JSON input
 * @param {Object} jsonSchema - Input JSON schema
 * @param {string|null} targetName - Target schema name
 * @param {boolean} addStar - Whether to add stars in formatting
 * @returns {string} Generated schema string
 */
function generateSchema(jsonSchema, targetName = null, addStar = false) {
  const definitions = jsonSchema.definitions;
  const targetRef =
    targetName ||
    extractTitleFromReference(jsonSchema.$ref || jsonSchema.items?.$ref);
  const generatedOutput = generateOutput(definitions, definitions[targetRef]);
  const formattedOutput = formatOutput(
    generatedOutput.replaceAll("{", "array{"),
    addStar
  );

  return jsonSchema.type === "array" ? formattedOutput + "[]" : formattedOutput;
}

/**
 * Validates if a string is valid JSON
 * @param {string} jsonString - String to validate
 * @returns {boolean} Whether string is valid JSON
 */
function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

// DOM Elements
const inputElement = document.querySelector("#input");
const outputElement = document.querySelector("#output");
const convertButton = document.querySelector("#convertBtn");
const includeStarCheckbox = document.querySelector("#includeStar");

// Event Listeners
convertButton.addEventListener("click", () => {
  if (!isValidJson(inputElement.value)) {
    alert("JSON schema is invalid");
    return;
  }

  const jsonData = JSON.parse(inputElement.value);
  if (!jsonData.$ref && !jsonData.items?.$ref) {
    alert("No $ref found in schema");
    return;
  }

  try {
    outputElement.value = generateSchema(
      jsonData,
      null,
      includeStarCheckbox.checked
    );
  } catch (error) {
    alert(error);
  }
});
