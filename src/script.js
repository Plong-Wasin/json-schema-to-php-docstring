const jsonSchema = {
    $schema: "http://json-schema.org/draft-06/schema#",
    $ref: "#/definitions/Welcome",
    definitions: {
        Welcome: {
            type: "object",
            additionalProperties: false,
            properties: {
                data: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/Datum",
                    },
                },
                links: {
                    $ref: "#/definitions/Links",
                },
                meta: {
                    $ref: "#/definitions/Meta",
                },
            },
            required: ["data", "links", "meta"],
            title: "Welcome",
        },
        Datum: {
            type: "object",
            additionalProperties: false,
            properties: {
                id: {
                    type: "string",
                },
                title: {
                    $ref: "#/definitions/Title",
                },
                regular_price: {
                    type: "integer",
                },
                discounted_price: {
                    type: "integer",
                },
                shop: {
                    $ref: "#/definitions/Shop",
                },
                parent_id: {
                    type: "null",
                },
                created_at: {
                    type: "string",
                    format: "date-time",
                },
                updated_at: {
                    type: "string",
                    format: "date-time",
                },
                thumb_url: {
                    type: "string",
                    format: "uri",
                    "qt-uri-protocols": ["https"],
                    "qt-uri-extensions": [".jpg", ".png"],
                },
                sale_count: {
                    type: "integer",
                },
                rating: {
                    anyOf: [
                        {
                            type: "integer",
                        },
                        {
                            type: "null",
                        },
                    ],
                },
                free_shipping: {
                    type: "boolean",
                },
                is_cod: {
                    type: "boolean",
                },
            },
            required: [
                "created_at",
                "discounted_price",
                "free_shipping",
                "id",
                "is_cod",
                "parent_id",
                "rating",
                "regular_price",
                "sale_count",
                "shop",
                "thumb_url",
                "title",
                "updated_at",
            ],
            title: "Datum",
        },
        Shop: {
            type: "object",
            additionalProperties: false,
            properties: {
                id: {
                    type: "integer",
                },
                name: {
                    type: "string",
                },
                address: {
                    type: "string",
                },
                slug: {
                    type: "string",
                },
                is_thp_shop: {
                    type: "boolean",
                },
                created_at: {
                    type: "string",
                    format: "date-time",
                },
                updated_at: {
                    anyOf: [
                        {
                            type: "string",
                            format: "date-time",
                        },
                        {
                            type: "null",
                        },
                    ],
                },
                logo_url: {
                    anyOf: [
                        {
                            type: "null",
                        },
                        {
                            type: "string",
                            format: "uri",
                            "qt-uri-protocols": ["https"],
                            "qt-uri-extensions": [".png"],
                        },
                    ],
                },
            },
            required: [
                "address",
                "created_at",
                "id",
                "is_thp_shop",
                "logo_url",
                "name",
                "slug",
                "updated_at",
            ],
            title: "Shop",
        },
        Title: {
            type: "object",
            additionalProperties: false,
            properties: {
                th: {
                    type: "string",
                },
                en: {
                    anyOf: [
                        {
                            type: "null",
                        },
                        {
                            type: "string",
                        },
                    ],
                },
            },
            required: ["en", "th"],
            title: "Title",
        },
        Links: {
            type: "object",
            additionalProperties: false,
            properties: {
                first: {
                    type: "string",
                    format: "uri",
                    "qt-uri-protocols": ["http"],
                },
                last: {
                    type: "string",
                    format: "uri",
                    "qt-uri-protocols": ["http"],
                },
                prev: {
                    type: "null",
                },
                next: {
                    type: "string",
                    format: "uri",
                    "qt-uri-protocols": ["http"],
                },
            },
            required: ["first", "last", "next", "prev"],
            title: "Links",
        },
        Meta: {
            type: "object",
            additionalProperties: false,
            properties: {
                current_page: {
                    type: "integer",
                },
                from: {
                    type: "integer",
                },
                last_page: {
                    type: "integer",
                },
                links: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/Link",
                    },
                },
                path: {
                    type: "string",
                    format: "uri",
                    "qt-uri-protocols": ["http"],
                },
                per_page: {
                    type: "integer",
                },
                to: {
                    type: "integer",
                },
                total: {
                    type: "integer",
                },
            },
            required: [
                "current_page",
                "from",
                "last_page",
                "links",
                "path",
                "per_page",
                "to",
                "total",
            ],
            title: "Meta",
        },
        Link: {
            type: "object",
            additionalProperties: false,
            properties: {
                url: {
                    anyOf: [
                        {
                            type: "null",
                        },
                        {
                            type: "string",
                            format: "uri",
                            "qt-uri-protocols": ["http"],
                        },
                    ],
                },
                label: {
                    type: "string",
                },
                active: {
                    type: "boolean",
                },
            },
            required: ["active", "label", "url"],
            title: "Link",
        },
    },
};

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
    for (const propertyKey in json.properties) {
        const notRequiredStr = json.required.includes(propertyKey) ? "" : "?";
        output += `${propertyKey}${notRequiredStr}: `;
        if (
            json.properties[propertyKey].type &&
            json.properties[propertyKey].type !== "array"
        ) {
            output += `${json.properties[propertyKey].type},\n`;
        } else if (json.properties[propertyKey].$ref) {
            output += `${generateOutput(
                definitions,
                definitions[getTitleByRef(json.properties[propertyKey].$ref)]
            )}`;
        } else if (json.anyOf) {
            output += json.anyOf.map((t) => t.type).join(" | ");
        } else if (
            json.properties[propertyKey].type &&
            json.properties[propertyKey].type === "array"
        ) {
            if (json.properties[propertyKey].items.type) {
                output += `${json.properties[propertyKey].items.type},\n`;
            } else if (json.properties[propertyKey].items.$ref) {
                output += `${generateOutput(
                    definitions,
                    definitions[
                        getTitleByRef(json.properties[propertyKey].items.$ref)
                    ]
                )}`;
            }
            output = replaceLast(output, ",\n", "[],\n");
        } else if (json.properties[propertyKey].anyOf) {
            output +=
                json.properties[propertyKey].anyOf
                    .map((t) => t.type)
                    .join(" | ") + ",\n";
        }
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
