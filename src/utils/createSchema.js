function createSchema(paths) {
  const dir = {};

  paths.forEach((path) => {
    const lastItemIndex = path.keys.length - 1;

    path.keys.reduce((acc, k, i) => {
      const prop = { ...acc[k] };
      const isLastProp = i === lastItemIndex;

      return (acc[k] =
        isLastProp ? path.defaultValue : prop);
    }, dir);
  });

  return dir;
}

module.exports = createSchema;