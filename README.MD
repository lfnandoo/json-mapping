# json-mapper

A useful helper to map data from a json object on Node.jS environments.

## Table of contents

- [Installation](#installation)
  - [Node.js](#nodejs)
- [Usage](#usage)
- [Output types](#output-types)
  - [Object](#object)
  - [XML](#xml)
    - [Mapping](#mapping)
    - [Mapping samples](#mapping-samples)

## Installation[⬆](#table-of-contents)

### Node.js[⬆](#table-of-contents)

1. Install module:

   `npm install json-mapping --save`

2. Then try it.

# Usage[⬆](#table-of-contents)
```javascript
import jsonMapping from 'json-mapping';

const jsonMapper = jsonMapping(someJsonInput); // input the json data
const object = jsonMapper({ type: 'object' }); // convert the inputed json data to javascript literal object
const xml = jsonMapper({ type: 'xml', mapping, prettify: true }); // convert the inputed json data to xml based on a mapping array
```

## Output types[⬆](#table-of-contents)

### Object[⬆](#table-of-contents)
Runs the json mapper function passing the type 'object' as an argument to map your json data.
```javascript
import jsonMapping from 'json-mapping';

const jsonMapper = jsonMapping(someJsonInput);
const object = jsonMapper({ type: 'object' });
```

### XML[⬆](#table-of-contents)
Runs the json mapper function passing the type 'xml' and a mapping array as arguments to map your json data.
```javascript
import jsonMapping from 'json-mapping';

const jsonMapper = jsonMapping(someJsonInput);
const xml = jsonMapper({ type: 'xml', mapping, prettify: true });
```

#### Mapping[⬆](#table-of-contents)
| argument | type | required | description
|--|--|--|--|
| target | string | true | XML target tag you want to fill
| origin | string | false | JSON path where you want to get data from
| static_value | any | false | A static value to the XML target tag
| convert_function | string | false | Function to convert the origin data

## Mapping samples[⬆](#table-of-contents)
The '!!' characters assumes the target will be setted only if value isn't undefined.
```json
{
  "origin": "!!extension_attributes.bold_order_comment",
  "target": "CommentLine.CustomerPoLine"
}
```

The 'x' character assumes the origin 'items' will be a iterable array.
```json
{
  "origin": "items.x.name",
  "target": "Customers.CustomerName"
}
```

The convert_function property will be executed as a javascript function receiving the value as a parameter.
```json
{
  "origin": "customer.born_date",
  "target": "Header.CustomerAge",
  "convert_function": "return new Date().getFullYear() - new Date(value).getFullYear()"
}
```
