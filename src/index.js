const parsers = require('./parsers');

function jsonMapping(input = {}) {
  const json = JSON.stringify(input);

  return (output = {}) => {
    const parser = parsers[output.type];

    if (typeof parser !== 'function') {
      throw new Error(`Type ${output.type} not found.`);
    }

    const data = parser({ ...output, json });

    return data;
  };
}

module.exports = jsonMapping;