export function deepFreezeMsg(obj) {
  // WeakSet для отслеживания циклических ссылок

  if (!obj || typeof obj !== 'object')
    throw new TypeError("payload required type of object")

  return _deepFreeze(obj, [])
  
  function _deepFreeze(currentObj, path) {
    // Запрещенные типы - вызывают ошибку
    if (typeof currentObj === 'function') {
      throw new TypeError(`Functions are not allowed in payload`);
    }
    
    if (typeof currentObj === 'symbol') {
      throw new TypeError(`Symbols are not allowed in payload`);
    }
    
    if (currentObj instanceof Promise) {
      throw new TypeError(`Promises are not allowed in payload`);
    }

    if (
      currentObj instanceof ArrayBuffer || 
      (Blob && currentObj instanceof Blob) || 
      ArrayBuffer.isView(currentObj)
    ) {
        if(currentObj instanceof Uint8Array)
            return currentObj
        
        console.warn(`Binary type will be ignored. Use Uint8Array for binary data.`)
        return null
    }
    
    // Специальная обработка для Error
    if (currentObj instanceof Error) {
      const plainObj = {
        name: currentObj.constructor.name,
        message: currentObj.message || ""
      };
      return Object.freeze(plainObj);
    }
    
    // Обработка Date
    if (currentObj instanceof Date) {
      console.warn(`Date object at path ${path.join('.')} will be converted to unix timestamp object. Consider storing dates as ISO strings instead.`);
      const result = {
        _date: true,
        timestamp: currentObj.getTime()
      };
      return Object.freeze(result);
    }

    // Проверка циклических ссылок
    if (currentObj !== null && (typeof currentObj === 'object' || Array.isArray(currentObj))) {

      if (path.includes(currentObj)) 
        throw new TypeError(`Cyclic reference detected!`);
      
      path.push(currentObj)
    }
    
    // Обработка примитивов (не требуют заморозки)
    if (currentObj === null || typeof currentObj !== 'object') {
      return currentObj;
    }
    
    // Обработка Map
    if (currentObj instanceof Map) {
      console.warn(`Map at path ${path.join('.')} will be converted to plain object`);
      const plainObj = {};
      for (const [key, value] of currentObj) {
        if (typeof key !== 'string') {
          throw new TypeError(`Map key at path ${path.join('.')} must be string, got ${typeof key}`);
        }
        plainObj[key] = _deepFreeze(value, path)
      }
      return Object.freeze(plainObj);
    }
    
    // Обработка Set
    if (currentObj instanceof Set) {
      console.warn(`Set at path ${path.join('.')} will be converted to array`);
      const array = [];
      for (const value of currentObj) {
        array.push(_deepFreeze(value, path));
      }
      return Object.freeze(array);
    }
    
    // Игнорируем WeakMap/WeakSet с предупреждением
    if (currentObj instanceof WeakMap || currentObj instanceof WeakSet) {
      console.warn(`WeakMap/WeakSet at path ${path.join('.')} will be ignored as they cannot be serialized`);
      return {};
    }
    
    // Игнорируем RegExp с предупреждением
    if (currentObj instanceof RegExp) {
      console.warn(`RegExp at path ${path.join('.')} will be ignored. Convert to string manually if needed.`);
      return null;
    }
    
    // Обработка массивов
    if (Array.isArray(currentObj)) {
      for (let i = 0; i < currentObj.length; i++) {
        currentObj[i] = _deepFreeze(currentObj[i], path)
      }
      return Object.freeze(currentObj);
    }

    for (const key of Object.keys(currentObj)) {      
      currentObj[key] = _deepFreeze(currentObj[key], path);
    }
    
    return Object.freeze(currentObj);
  }
}