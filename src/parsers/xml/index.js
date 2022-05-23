const objectParser = require('../object');
const { createSchema, resolvePath, formatXml } = require('../../utils');
const { ObjectHelper, XmlHelper } = require('../../helpers');

function xml(output = {}) {
  const { json = {}, mapping, arrayKey = 'x', prettify } = output;

  const obj = objectParser({ json });
  const map = new Map();
  const mappedArraysMap = new Map();

  mapping.forEach((mapper) => {
    const { target, origin, static_value: staticValue = '' } = mapper;

    if (!target.trim()) {
      throw new Error(
        `Target property is required on origin = ${origin}`,
      );
    }

    const targetKeys = target.split('.');
    const originKeys = origin.split('.');
    const originIsArray = originKeys.includes(arrayKey);

    if (originIsArray) {
      const arrayKeyIndex = originKeys.findIndex((k) => k === arrayKey);
      const mapKey = originKeys.splice(0, arrayKeyIndex).join('.');
      const mapObj = map.get(mapKey);

      if (!mapObj) {
        const mapModel = {
          prevKeys: targetKeys,
          prevMapper: mapper,
        };

        map.set(mapKey, mapModel);
      } else {
        const keys = mapObj.keys || targetKeys.filter((k) => mapObj.prevKeys.includes(k));

        if (mapObj.prevMapper) {
          const origin = mapObj.prevMapper.origin.slice(mapKey.length + `.${arrayKey}.`.length, mapObj.prevMapper.origin.length);
          const target = mapObj.prevKeys.slice(keys.length, mapObj.prevKeys.length).join('.');
          const arraySchemaOrigin = { 
            ...mapObj.prevMapper,
            origin,
            target
          };

          if (!Array.isArray(mapObj.__arraySchemaOrigins)) {
            mapObj.__arraySchemaOrigins = [];
          }

          mapObj.__arraySchemaOrigins.push(arraySchemaOrigin);
          mapObj.__arraySchema = {
            [arraySchemaOrigin.target]: arraySchemaOrigin.static_value, 
          }
        }

        const schemaPath = targetKeys.filter((k) => !(mapObj.prevKeys || mapObj.keys).includes(k)).join('.');
        const __arraySchema = {
          ...mapObj.__arraySchema,
          [schemaPath]: staticValue,
        };

        const newMapper = { ...mapper };

        const hasArrayOriginKey = mapper.origin.split('.').includes(arrayKey);
        if (hasArrayOriginKey) {
          const newOrigin = mapper.origin.slice(mapKey.length + `.${arrayKey}.`.length, mapper.origin.length);
          newMapper.origin = newOrigin;
        }

        const hasSameTarget = mapper.target.includes(keys.join('.'));
        if (hasSameTarget) {
          const newTarget = targetKeys.slice(keys.length, targetKeys.length).join('.');
          newMapper.target = newTarget;
        }

        const __arraySchemaOrigins = [
          ...mapObj.__arraySchemaOrigins,
          newMapper,
        ];

        const mapModel = {
          keys,
          __arraySchema,
          __arraySchemaOrigins,
          __origin: { origin: mapKey, target: keys.join('.') },
          defaultValue: [],
        };

        map.set(mapKey, mapModel);
        mappedArraysMap.set(mapKey, mapModel);
      }
    } else {
      const mappedArrays = Array.from(mappedArraysMap.values());
      const targetAlreadyExists = mappedArrays.find((map) => {
        const lastTargetProp = map.keys[map.keys.length - 1];
        
        return targetKeys.includes(lastTargetProp);
      });

      if (targetAlreadyExists) {
        const target = targetKeys.slice(targetAlreadyExists.keys.length, targetKeys.length).join('.');

        const arraySchemaOrigin = {
          ...mapper,
          origin: mapper.origin,
          target,
        };

        targetAlreadyExists.__arraySchemaOrigins.push(arraySchemaOrigin);
        targetAlreadyExists.__arraySchema[target] = mapper.static_value;
      } else {
        const mapModel = {
          __origin: mapper,
          keys: targetKeys,
          defaultValue: staticValue,
        };

        map.set(mapper.target, mapModel);
      }
    }
  })

  const groupedMapping = Array.from(map.values());
  const schema = createSchema(groupedMapping);
  const dataMappedObject = new ObjectHelper(schema);
  const xml = new XmlHelper();

  groupedMapping.forEach((mapper) => {
    const { __arraySchema, __arraySchemaOrigins, __origin, keys } = mapper;

    if (__arraySchema) {
      const array = resolvePath(obj, __origin.origin || '');

      array.forEach((obj, i) => {
        const model = new ObjectHelper({ ...__arraySchema });

        __arraySchemaOrigins.forEach((arraySchemaMapper) => {
          let value = arraySchemaMapper.static_value;

          if (arraySchemaMapper.origin.trim() === '' && typeof arraySchemaMapper.static_value === 'undefined') {
            value = i + 1;
          }

          if (arraySchemaMapper.origin.trim()) {
            value = resolvePath(obj, arraySchemaMapper.origin);
          }

          if (typeof arraySchemaMapper.convert_function === 'string') {
            try {
              const convertedValue = new Function(
                'value = ""',
                arraySchemaMapper.convert_function,
              )(value);
              value = convertedValue;
            } catch (err) {
              throw new Error(
                `Cannot resolve convert function on origin = ${__origin.origin}.${i}.${arraySchemaMapper.origin}\n${err}`,
              );
            }
          }
          
          model.set(arraySchemaMapper.target, value);
        });

        dataMappedObject.push(keys.join('.'), model.state);
      });
    } else {
      if (__origin.origin.startsWith('!!')) {
        __origin.origin = __origin.origin.slice('!!'.length, __origin.length);
        const value = resolvePath(obj, __origin.origin);

        if (typeof value === 'undefined') {
          const [targetObjKey] = __origin.target.split('.');
          return dataMappedObject.delete(targetObjKey);
        }
      }

      let value = typeof __origin.static_value === 'undefined' ? resolvePath(obj, __origin.origin || '') : __origin.static_value;

      if (typeof __origin.convert_function === 'string') {
        try {
          const convertedValue = new Function(
            'value = ""',
            __origin.convert_function,
          )(value);
          value = convertedValue;
        } catch (err) {
          throw new Error(
            `Cannot resolve convert function on origin = ${__origin.origin}\n${err}`,
          );
        }
      }

      const property = {
        path: __origin.target || '',
        value,
      };

      dataMappedObject.set(property.path, value);
    }
  });

  function createXmlTag(obj) {
    Object.keys(obj).forEach((key) => {
      const propValue = obj[key];

      if (Array.isArray(propValue)) {
        propValue.forEach((value) => {
          xml.begin(key);
          createXmlTag(value);
          xml.end();
        })
      } else if (typeof propValue === 'object') {
        xml.begin(key);
        createXmlTag(propValue);
        xml.end();
      } else {
        xml.begin(key).content(propValue).end();
      }
    });
  }

  xml.begin('Orders');
  xml.begin('OrderHeader');
  Object.keys(dataMappedObject.state).forEach((key) => {
    const propValue = dataMappedObject.state[key];

    if (typeof propValue !== 'object') {
      xml.begin(key).content(propValue).end();
    }
  });
  xml.end();

  Object.keys(dataMappedObject.state).forEach((key) => {
    const propValue = dataMappedObject.state[key];

    if (Array.isArray(propValue)) {
      propValue.forEach((value) => {
        xml.begin(key);
        createXmlTag(value);
        xml.end();
      })
    } else if (typeof propValue === 'object') {
      xml.begin(key);
      createXmlTag(propValue);
      xml.end();
    }
  });
  xml.end();

  return prettify ? formatXml(xml.raw) : xml.raw;
}

module.exports = xml;