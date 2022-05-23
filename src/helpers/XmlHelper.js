class XmlHelper {
  #_openTags = [];

  constructor() {
    this.raw = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  }

  begin(tagName) {
    this.raw = this.raw + `<${tagName}>`;

    this.#_openTags.push(tagName);

    return this;
  }

  content(c = '') {
    this.raw = this.raw + c;

    return this;
  }

  end() {
    const tagName = this.#_openTags.pop();

    this.raw = this.raw + `</${tagName}>`;

    return this;
  }
}

module.exports = XmlHelper;