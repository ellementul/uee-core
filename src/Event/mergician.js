/*!
 * mergician
 * v2.0.2
 * https://jhildenbiddle.github.io/mergician/
 * (c) 2022-2024 John Hildenbiddle
 * MIT license
 */

// src/util.js
function countOccurrences(...arrays) {
  const countObj = {};
  arrays.forEach((array) => {
    array.forEach((v) => {
      countObj[v] = v in countObj ? ++countObj[v] : 1;
    });
  });
  return countObj;
}
function getInAll(...arrays) {
  return arrays.reduce(
    (acc, curr) => acc.filter(Set.prototype.has, new Set(curr))
  );
}
function getInMultiple(...arrays) {
  const countObj = countOccurrences(...arrays);
  return Object.keys(countObj).filter((v) => countObj[v] > 1);
}
function getNotInAll(...arrays) {
  const countObj = countOccurrences(...arrays);
  return Object.keys(countObj).filter((v) => countObj[v] < arrays.length);
}
function getNotInMultiple(...arrays) {
  const countObj = countOccurrences(...arrays);
  return Object.keys(countObj).filter((v) => countObj[v] === 1);
}
function getObjectKeys(obj, hoistEnumerable = false) {
  const keys = Object.getOwnPropertyNames(obj);
  if (hoistEnumerable) {
    for (const key in obj) {
      !keys.includes(key) && keys.push(key);
    }
  }
  return keys;
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isPropDescriptor(obj) {
  if (!isObject(obj)) {
    return false;
  }
  const hasFlagKey = ["writable", "enumerable", "configurable"].some(
    (key) => key in obj
  );
  const hasMethod = ["get", "set"].some((key) => typeof obj[key] === "function");
  const hasMethodKeys = ["get", "set"].every((key) => key in obj);
  let isDescriptor = "value" in obj && hasFlagKey || hasMethod && (hasMethodKeys || hasFlagKey);
  if (isDescriptor) {
    const validKeys = [
      "configurable",
      "get",
      "set",
      "enumerable",
      "value",
      "writable"
    ];
    isDescriptor = Object.keys(obj).some((key) => !(key in validKeys));
  }
  return isDescriptor;
}

// src/index.js
/**
 * @typedef {Object} MergicianOptions
 * @property {string[]} [onlyKeys] - Exclusive array of keys to be merged
 * (others are skipped)
 * @property {string[]} [skipKeys] - Array of keys to skip (others are
 * merged)
 * @property {boolean} [onlyCommonKeys=false] - Merge only keys found
 * in multiple objects (ignore single occurrence keys)
 * @property {boolean} [onlyUniversalKeys=false] - Merge only keys
 * found in all objects
 * @property {boolean} [skipCommonKeys=false] - Skip keys found in
 * multiple objects (merge only single occurrence keys)
 * @property {boolean} [skipUniversalKeys=false] - Skip keys found in
 * all objects (merge only common keys)
 * @property {boolean} [invokeGetters=false] - Invoke "getter" methods
 * and merge returned values
 * @property {boolean} [skipSetters=false] - Skip "setter" methods
 * during merge
 * @property {boolean} [appendArrays=false] - Merge array values at
 * the end of existing arrays
 * @property {boolean} [prependArrays=false] - Merge array values at
 * the beginning of existing arrays
 * @property {boolean} [dedupArrays=false] - Remove duplicate array
 * values in new merged object
 * @property {boolean|function} [sortArrays=false] - Sort array values
 * in new merged object
 * @property {boolean} [hoistEnumerable=false] - Merge enumerable
 * prototype properties as direct properties of merged object
 * @property {boolean} [hoistProto=false] - Merge custom prototype
 * properties as direct properties of merged object
 * @property {boolean} [skipProto=false] - Skip merging of custom
 * prototype properties
 * @property {filterCallback} [filter] - Callback used to conditionally merge
 * or skip a property. Return a "truthy" value to merge or a "falsy" value to
 * skip. Return no value to proceed according to other option values.
 * @property {beforeEachCallback} [beforeEach] - Callback used for
 * inspecting/modifying properties before merge. Return value is used as value
 * to merge.
 * @property {afterEachCallback} [afterEach] - Callback used for
 * inspecting/modifying properties after merge. Return value is used as merged
 * value.
 * @property {onCircularCallback} [onCircular] - Callback used for handling
 * circular object references during merge
 * @preserve
 */
/**
 * @callback filterCallback
 * @param {callbackData} callbackData
 * @preserve
 */
/**
 * @callback beforeEachCallback
 * @param {callbackData} callbackData
 * @preserve
 */
/**
 * @callback afterEachCallback
 * @param {afterEachCallbackData} callbackData
 * @preserve
 */
/**
 * @callback onCircularCallback
 * @param {callbackData} callbackData
 * @preserve
 */
/**
 * @typedef {Object} callbackData
 * @property {number} depth - Nesting level of the key being processed
 * @property {string} key - Object key being processed
 * @property {object} srcObj - Object containing the source value
 * @property {any} srcVal - Source object’s property value
 * @property {object} targetObj - New merged object
 * @property {any} targetVal - New merged object’s current property value
 * @preserve
 */
/**
 * @typedef {Object} afterEachCallbackData
 * @property {number} depth - Nesting level of the key being processed
 * @property {string} key - Object key being processed
 * @property {any} mergeVal - New merged value
 * @property {object} srcObj - Object containing the source value
 * @property {object} targetObj - New merged object
 * @preserve
 */
var defaults = {
  // Keys
  onlyKeys: [],
  skipKeys: [],
  onlyCommonKeys: false,
  onlyUniversalKeys: false,
  skipCommonKeys: false,
  skipUniversalKeys: false,
  // Values
  invokeGetters: false,
  skipSetters: false,
  // Arrays
  appendArrays: false,
  prependArrays: false,
  dedupArrays: false,
  sortArrays: false,
  // Prototype
  hoistEnumerable: false,
  hoistProto: false,
  skipProto: false,
  // Callbacks
  filter: Function.prototype,
  beforeEach: Function.prototype,
  afterEach: Function.prototype,
  onCircular: Function.prototype
};
/**
 * @description Deep (recursive) object merging with support for descriptor
 * values, accessor functions, custom prototypes, and advanced options for
 * customizing the merge process.
 *
 * @example
 * // Custom merge options
 * const mergedObj = mergician({
 *   // Options
 * })(obj1, obj2, obj3);
 *
 * // Custom merge function
 * const customMerge = mergician({
 *   // Options
 * });
 * const customMergeObj = customMerge(obj1, obj2, obj3);
 *
 * @overload
 * @param {MergicianOptions} options
 * @returns {function} New merge function with options set as defaults
 * @preserve
 */
/**
 * @description Deep (recursive) object merging with support for descriptor
 * values, accessor functions, custom prototypes, and advanced options for
 * customizing the merge process.
 *
 * @example
 * // Clone with default options
 * const clonedObj = mergician({}, obj1);
 *
 * // Merge with default options
 * const mergedObj = mergician(obj1, obj2, obj3);
 *
 * @overload
 * @param {...object} objects
 * @returns {object} New merged object
 * @preserve
 */
/**
 * @description Deep (recursive) object merging with support for descriptor
 * values, accessor functions, custom prototypes, and advanced options for
 * customizing the merge process.
 *
 * @example
 * // Clone with default options
 * const clonedObj = mergician({}, obj1);
 *
 * // Merge with default options
 * const mergedObj = mergician(obj1, obj2, obj3);
 *
 * @example
 * // Custom merge options
 * const mergedObj = mergician({
 *   // Options
 * })(obj1, obj2, obj3);
 *
 * // Custom merge function
 * const customMerge = mergician({
 *   // Options
 * });
 * const customMergeObj = customMerge(obj1, obj2, obj3);
 *
 * @param {MergicianOptions} optionsOrObject
 * @param {...object} [objects]
 * @returns {function|object} New merge function with options set as defaults
 * (single argument) or new merged object (multiple arguments)
 * @preserve
 */
function mergician(optionsOrObject, ...objects) {
  const options = arguments.length === 1 ? arguments[0] : {};
  const settings = { ...defaults, ...options };
  const dedupArrayMap = /* @__PURE__ */ new Map();
  const sortArrayMap = /* @__PURE__ */ new Map();
  const sortArrayFn = typeof settings.sortArrays === "function" ? settings.sortArrays : void 0;
  const circularRefs = /* @__PURE__ */ new WeakMap();
  let mergeDepth = 0;
  function _getObjectKeys(obj) {
    return getObjectKeys(obj, settings.hoistEnumerable);
  }
  function _mergician(...objects2) {
    let mergeKeyList;
    if (objects2.length > 1) {
      if (settings.onlyCommonKeys) {
        mergeKeyList = getInMultiple(
          ...objects2.map((obj) => _getObjectKeys(obj))
        );
      } else if (settings.onlyUniversalKeys) {
        mergeKeyList = getInAll(...objects2.map((obj) => _getObjectKeys(obj)));
      } else if (settings.skipCommonKeys) {
        mergeKeyList = getNotInMultiple(
          ...objects2.map((obj) => _getObjectKeys(obj))
        );
      } else if (settings.skipUniversalKeys) {
        mergeKeyList = getNotInAll(...objects2.map((obj) => _getObjectKeys(obj)));
      }
    }
    if (!mergeKeyList && settings.onlyKeys.length) {
      mergeKeyList = settings.onlyKeys;
    }
    if (mergeKeyList && mergeKeyList !== settings.onlyKeys && settings.onlyKeys.length) {
      mergeKeyList = mergeKeyList.filter(
        (key) => settings.onlyKeys.includes(key)
      );
    }
    const newObjProps = objects2.reduce((targetObj, srcObj) => {
      circularRefs.set(srcObj, targetObj);
      let keys = mergeKeyList || _getObjectKeys(srcObj);
      if (settings.skipKeys.length) {
        keys = keys.filter((key) => settings.skipKeys.indexOf(key) === -1);
      }
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const targetVal = targetObj[key];
        const mergeDescriptor = {
          configurable: true,
          enumerable: true
        };
        if (key in srcObj === false) {
          continue;
        }
        if(ArrayBuffer.isView(srcObj[key])) {
          targetObj[key] = srcObj[key]
          continue;
        }
        let isReturnVal = false;
        let mergeVal = srcObj[key];
        const srcDescriptor = Object.getOwnPropertyDescriptor(srcObj, key);
        const isSetterOnly = srcDescriptor && typeof srcDescriptor.set === "function" && typeof srcDescriptor.get !== "function";
        if (isSetterOnly) {
          if (!settings.skipSetters) {
            Object.defineProperty(targetObj, key, srcDescriptor);
          }
          continue;
        }
        if (settings.filter !== defaults.filter) {
          const returnVal = settings.filter({
            depth: mergeDepth,
            key,
            srcObj,
            srcVal: mergeVal,
            targetObj,
            targetVal
          });
          if (returnVal !== void 0 && !returnVal) {
            continue;
          }
        }
        if (settings.beforeEach !== defaults.beforeEach) {
          const returnVal = settings.beforeEach({
            depth: mergeDepth,
            key,
            srcObj,
            srcVal: mergeVal,
            targetObj,
            targetVal
          });
          if (returnVal !== void 0) {
            isReturnVal = true;
            mergeVal = returnVal;
          }
        }
        if (typeof mergeVal === "object" && mergeVal !== null) {
          if (circularRefs.has(srcObj[key])) {
            const returnVal = settings.onCircular({
              depth: mergeDepth,
              key,
              srcObj,
              srcVal: srcObj[key],
              targetObj,
              targetVal
            });
            if (returnVal === void 0) {
              mergeVal = circularRefs.get(srcObj[key]);
              targetObj[key] = mergeVal;
              continue;
            }
            isReturnVal = true;
            mergeVal = returnVal;
          }
        }
        if (Array.isArray(mergeVal)) {
          mergeVal = [...mergeVal];
          if (Array.isArray(targetVal)) {
            if (settings.appendArrays) {
              mergeVal = [...targetVal, ...mergeVal];
            } else if (settings.prependArrays) {
              mergeVal = [...mergeVal, ...targetVal];
            }
          }
          if (settings.dedupArrays) {
            if (settings.afterEach !== defaults.afterEach) {
              mergeVal = [...new Set(mergeVal)];
            } else {
              const keyArray = dedupArrayMap.get(targetObj);
              if (keyArray && !keyArray.includes(key)) {
                keyArray.push(key);
              } else {
                dedupArrayMap.set(targetObj, [key]);
              }
            }
          }
          if (settings.sortArrays) {
            if (settings.afterEach !== defaults.afterEach) {
              mergeVal = mergeVal.sort(sortArrayFn);
            } else {
              const keyArray = sortArrayMap.get(targetObj);
              if (keyArray && !keyArray.includes(key)) {
                keyArray.push(key);
              } else {
                sortArrayMap.set(targetObj, [key]);
              }
            }
          }
        } else if (mergeVal instanceof Date) {
          mergeVal = new Date(mergeVal);
        } else if (isObject(mergeVal) && (!isReturnVal || !isPropDescriptor(mergeVal))) {
          mergeDepth++;
          if (isObject(targetVal)) {
            mergeVal = _mergician(targetVal, mergeVal);
          } else {
            mergeVal = _mergician(mergeVal);
          }
          mergeDepth--;
        }
        if (settings.afterEach !== defaults.afterEach) {
          const returnVal = settings.afterEach({
            depth: mergeDepth,
            key,
            mergeVal,
            srcObj,
            targetObj
          });
          if (returnVal !== void 0) {
            isReturnVal = true;
            mergeVal = returnVal;
          }
        }
        if (isReturnVal) {
          const returnDescriptor = isPropDescriptor(mergeVal) ? mergeVal : {
            configurable: true,
            enumerable: true,
            value: mergeVal,
            writable: true
          };
          Object.defineProperty(targetObj, key, returnDescriptor);
          continue;
        }
        if (srcDescriptor) {
          const { configurable, enumerable, get, set, writable } = srcDescriptor;
          Object.assign(mergeDescriptor, {
            configurable,
            enumerable
          });
          if (typeof get === "function") {
            if (settings.invokeGetters) {
              mergeDescriptor.value = mergeVal;
            } else {
              mergeDescriptor.get = get;
            }
          }
          if (!settings.skipSetters && typeof set === "function" && !Object.hasOwnProperty.call(mergeDescriptor, "value")) {
            mergeDescriptor.set = set;
          }
          if (!mergeDescriptor.get && !mergeDescriptor.set) {
            mergeDescriptor.writable = Boolean(writable);
          }
        }
        if (!mergeDescriptor.get && !mergeDescriptor.set && !("value" in mergeDescriptor)) {
          mergeDescriptor.value = mergeVal;
          mergeDescriptor.writable = srcDescriptor && "writable" in srcDescriptor ? srcDescriptor.writable : true;
        }
        Object.defineProperty(targetObj, key, mergeDescriptor);
      }
      return targetObj;
    }, {});
    for (const [obj, keyArray] of dedupArrayMap.entries()) {
      for (const key of keyArray) {
        const propDescriptor = Object.getOwnPropertyDescriptor(obj, key);
        const { configurable, enumerable, writable } = propDescriptor;
        Object.defineProperty(obj, key, {
          configurable,
          enumerable,
          value: [...new Set(obj[key])],
          writable: writable !== void 0 ? writable : true
        });
      }
    }
    for (const [obj, keyArray] of sortArrayMap.entries()) {
      for (const key of keyArray) {
        obj[key].sort(sortArrayFn);
      }
    }
    let newObj = newObjProps;
    if (!settings.skipProto) {
      const customProtos = objects2.reduce((protosArr, obj) => {
        const proto = Object.getPrototypeOf(obj);
        if (proto && proto !== Object.prototype) {
          protosArr.push(proto);
        }
        return protosArr;
      }, []);
      if (customProtos.length) {
        const newObjProto = _mergician(...customProtos);
        if (settings.hoistProto) {
          newObj = _mergician(newObjProto, newObjProps);
        } else {
          newObj = Object.create(
            newObjProto,
            Object.getOwnPropertyDescriptors(newObjProps)
          );
        }
      }
    }
    return newObj;
  }
  if (arguments.length === 1) {
    return function(...objects2) {
      if (arguments.length === 1) {
        return mergician({ ...settings, ...objects2[0] });
      } else {
        return _mergician(...objects2);
      }
    };
  } else {
    return _mergician(...arguments);
  }
}
export {
  mergician
};
