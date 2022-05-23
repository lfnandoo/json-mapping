function formatXml(input, indent) {
  indent = indent || '\t'; 

  xmlString = input.replace(/^\s+|\s+$/g, '');

  xmlString = input
    .replace(/(<([a-zA-Z]+\b)[^>]*>)(?!<\/\2>|[\w\s])/g, '$1\n')
    .replace(/(<\/[a-zA-Z]+[^>]*>)/g, '$1\n')
    .replace(/>\s+(.+?)\s+<(?!\/)/g, '>\n$1\n<')
    .replace(/>(.+?)<([a-zA-Z])/g, '>\n$1\n<$2')
    .replace(/\?></, '?>\n<');

  xmlArr = xmlString.split('\n');

  var tabs = '';
  var start = 0;

  if (/^<[?]xml/.test(xmlArr[0])) start++;

  for (
    var i = start;
    i < xmlArr.length;
    i++
  ) {
    var line = xmlArr[i].replace(/^\s+|\s+$/g, '');

    if (/^<[/]/.test(line)) {
      tabs = tabs.replace(indent, '');
      xmlArr[i] = tabs + line;
    } else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(line)) {
      xmlArr[i] = tabs + line;
    } else if (/<.*>/.test(line)) {
      xmlArr[i] = tabs + line;
      tabs += indent;
    }
    else {
      xmlArr[i] = tabs + line;
    }
  }

  return xmlArr.join('\n');
}

module.exports = formatXml;