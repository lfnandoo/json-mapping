function object(output = {}) {
  const { json = {} } = output;

  return JSON.parse(json);
};

module.exports = object;