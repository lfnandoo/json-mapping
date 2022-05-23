class ObjectHelper {
  #_refs = {};
  state = {};

  constructor(schema) {
    this.state = schema;

    Object.keys(this.state).forEach((key) => {
      const refValue = this.state[key];

      if (typeof refValue === 'object') {
        this.#createChildrenRef(key, refValue);
      }
    });
  }

  set(path, value) {
    const keys = path.split('.');
    const lowKey = keys.pop();
    const objectRefPath = keys.join('.') || path;
    let ref = this.#getRef(objectRefPath);

    if (!this.#hasRef(objectRefPath)) {
      throw new Error(`Cannot set unmapped path ${path}`);
    }

    if (keys.length > 0) {
      ref[lowKey] = value;
    } else {
      this.state[objectRefPath] = value;
    }
  }

  push(path, value) {
    const ref = this.#getRef(path);

    if (typeof ref === 'undefined') {
      throw new Error(`Cannot push unmapped path ${path}`);
    }

    if (!Array.isArray(ref)) {
      throw new Error(
        `Cannot push path ${path}\nPath type is not an array type`,
      );
    }

    ref.push(value);
  }

  delete(path) {
    delete this.state[path];
  }

  #createChildrenRef(path, obj) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const refPath = `${path}.${key}`;

      if (Array.isArray(value)) {
        this.#createRef(refPath, value);
      } else if (typeof value === 'object') {
        this.#createChildrenRef(refPath, value);
      } else {
        this.#createRef(path, obj);
      }
    });
  }

  #createRef(path, ref) {
    this.#_refs[path] = ref;
  }

  #hasRef(path) {
    return this.#_refs.hasOwnProperty(path) || this.state.hasOwnProperty(path);
  }

  #getRef(path) {
    return this.#_refs[path] || this.state[path];
  }
};

module.exports = ObjectHelper;