function resolvePath(obj, path) {
  return path
    .split('.')
    .reduce((prev, curr) => (prev ? prev[curr] : null), obj || this);
}

module.exports = resolvePath;