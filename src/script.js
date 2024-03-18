function getTitleByRef(ref) {
    const refSplit = ref.split("/");
    return refSplit[refSplit.length - 1];
}

function replaceLast(str, pattern, replacement) {
    const match =
        typeof pattern === "string"
            ? pattern
            : (str.match(new RegExp(pattern.source, "g")) || []).slice(-1)[0];
    if (!match) return str;
    const last = str.lastIndexOf(match);
    return last !== -1
        ? `${str.slice(0, last)}${replacement}${str.slice(last + match.length)}`
        : str;
}

function generateOutput(definitions, json) {
    let output = "";
    if (json.type === "object") {
        output += "{\n";
    }
    if (json.properties) {
        for (const propertyKey in json.properties) {
            const notRequiredStr = json.required.includes(propertyKey)
                ? ""
                : "?";
            output += `"${propertyKey}"${notRequiredStr}: `;
            if (
                json.properties[propertyKey].type &&
                !["array", "object"].includes(json.properties[propertyKey].type)
            ) {
                output +=
                    json.properties[propertyKey].type === "number"
                        ? "float"
                        : json.properties[propertyKey].type;
                output += `,\n`;
            } else if (json.properties[propertyKey].$ref) {
                if (propertyKey === "name") {
                    console.log(json.properties[propertyKey]);
                }
                output += `${generateOutput(
                    definitions,
                    definitions[
                        getTitleByRef(json.properties[propertyKey].$ref)
                    ]
                )}`;
            } else if (json.anyOf) {
                output += json.anyOf.map((t) => t.type).join(" | ");
            } else if (
                json.properties[propertyKey].type &&
                ["array", "object"].includes(json.properties[propertyKey].type)
                // json.properties[propertyKey].type === "array"
            ) {
                if (json.properties[propertyKey]?.items?.type) {
                    output += `${json.properties[propertyKey].items.type},\n`;
                } else if (json.properties[propertyKey]?.items?.$ref) {
                    output += `${generateOutput(
                        definitions,
                        definitions[
                            getTitleByRef(
                                json.properties[propertyKey].items.$ref
                            )
                        ]
                    )}`;
                } else if (
                    json.properties[propertyKey]?.additionalProperties?.$ref
                ) {
                    output += `${generateOutput(
                        definitions,
                        definitions[
                            getTitleByRef(
                                json.properties[propertyKey]
                                    .additionalProperties.$ref
                            )
                        ]
                    )}`;
                } else {
                    output += "mixed,\n";
                }
                output = replaceLast(output, ",\n", "[],\n");
            } else if (json.properties[propertyKey].anyOf) {
                output +=
                    json.properties[propertyKey].anyOf
                        .map((t) => t.type)
                        .join(" | ") + ",\n";
            }
        }
    } else {
        output += json.type === "number" ? "float" : json.type;
        output += `,\n`;
    }
    if (json.type === "object") {
        output += "},\n";
    }
    return output;
}

function format(str, addStar = false) {
    const outputSplit = str
        .split("\n")
        .map((line) => line.trim())
        .filter((l) => l);
    let indentationLevel = 0;
    outputSplit.forEach((line, index) => {
        if (line.includes("}")) {
            indentationLevel--;
        }
        outputSplit[index] = " ".repeat(indentationLevel * 4) + line;
        if (line.includes("array{")) {
            indentationLevel++;
        }
    });

    return replaceLast(outputSplit.join(`\n${addStar ? "*" : ""}`), ",", "");
}

function generateSchema(jsonSchema, targetName = null, addStar = false) {
    const definitions = jsonSchema.definitions;
    const target =
        targetName || getTitleByRef(jsonSchema.$ref || jsonSchema.items?.$ref);
    const generatedOutput = generateOutput(definitions, definitions[target]);
    const formattedOutput = format(
        generatedOutput.replaceAll("{", "array{"),
        addStar
    );
    return formattedOutput;
}
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
const inputEl = document.querySelector("#input");
const outputEl = document.querySelector("#output");
const convertBtnEl = document.querySelector("#convertBtn");
const includeStarEl = document.querySelector("#includeStar");
convertBtnEl.addEventListener("click", (event) => {
    if (!isJsonString(inputEl.value)) {
        alert("json schema invalid");
        return;
    }
    const json = JSON.parse(inputEl.value);
    if (!json.$ref && !json.items?.$ref) {
        alert("Not found $ref");
        return;
    }
    try {
        outputEl.value = generateSchema(json, null, includeStarEl.checked);
    } catch (e) {
        alert(e);
    }
});
