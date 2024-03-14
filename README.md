# JSON Schema to PHP Array Shapes Docstring Converter

This project provides a simple tool to convert JSON Schema into PHP array shapes docstring. It helps developers easily generate PHP documentation for their JSON Schema.

## How to Use

1. **Input JSON Data**: Paste your JSON data into [Quicktype](https://app.quicktype.io) (a tool for generating data types and converters from JSON to various programming languages).

2. **Set Language to JSON Schema**: In Quicktype, ensure that you select "JSON Schema" as the output language.

3. **Adjust Settings**: In the "Other" tab of Quicktype, ensure that all options are checked. This ensures the most comprehensive conversion.

4. **Copy JSON Schema**: Copy the generated JSON Schema from Quicktype.

5. **Access the Converter**: Visit [website](https://plong-wasin.github.io/json-schema-to-php-docstring/).

6. **Paste JSON Schema**: Paste the copied JSON Schema into the designated area on the website.

7. **Convert**: Click on the "Convert" button to initiate the conversion process.

8. **Result**: The converted PHP array shapes docstring will be displayed on the website. You can copy this docstring and use it in your PHP documentation.

## Example

Here's a simple example to illustrate the process:

```json
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "type": "array",
    "items": {
        "$ref": "#/definitions/RootElement"
    },
    "definitions": {
        "RootElement": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "age": {
                    "type": "integer"
                }
            },
            "required": [
                "name"
            ],
            "title": "RootElement"
        }
    }
}
```

This JSON Schema will be converted into the following PHP array shapes docstring:

```text
array{
    name: string,
    age?: int,
}
```

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the terms of the license.
