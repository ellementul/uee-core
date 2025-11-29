import { v3 as uuidv3 } from 'uuid'
import { StatesMember } from '../StateMember/index.js'
import { objectCreatedEvent, versionConflictEvent } from './events.js'
import { convertDataToUint8Array } from './untilities.js';

// Основной класс хранилища
export class DataStore extends StatesMember {
  constructor(options = {}) {
    super(['empty', 'not_synced', 'synced']);
    
    const { 
      namespace = 'default-storage',
      hashFunction
    } = options;
    
    this.setState('empty');
    
    this._namespace = namespace;
    this._hashFunction = hashFunction || v3
    
    this._values = new Map();    // key -> Uint8Array
    this._hashes = new Map();    // key -> hash данных
    this._versions = new Map();  // key -> версия
    this._timestamps = new Map(); // key -> timestamp
    this._deleted = new Map();   // key -> timestamp удаления
    
    this.subscribe(objectCreatedEvent, this.handleObjectCreated.bind(this));
    this.subscribe(versionConflictEvent, this.handleVersionConflict.bind(this));
  }
  
  get namespace() {
    return this._namespace
  }
  
  _calculateInitialVersion(key, dataHash) {
    return this._hashFunction(`${key}${dataHash}}`);
  }
  
  _calculateNextVersion(oldVersion, newDataHash) {
    return this._hashFunction(`${oldVersion}${newDataHash}`);
  }
  
  create(data) {
    const uint8Array = convertDataToUint8Array(data);
    
    if (uint8Array.byteLength > 64 * 1024) {
      const formattedSize = (uint8Array.byteLength / 1024).toFixed(2);
      throw new Error(`Data size (${formattedSize}KB) exceeds maximum limit of 64KB`);
    }
    

    const key = this._generateUUID();
    const timestamp = Date.now();
    const dataHash = this._hashFunction(uint8Array);
    const version = this._calculateInitialVersion(key, dataHash);

    // Синхронное обновление коллекций
    this._values.set(key, uint8Array);
    this._hashes.set(key, dataHash);
    this._versions.set(key, version);
    this._timestamps.set(key, timestamp);
    
    // Отправляем событие для синхронизации
    this.send(objectCreatedEvent, {
      key,
      version,
      data: uint8Array,
      namespace: this.namespace,
      storeUuid: this.uuid
    });
    
    // Обновление состояния
    if (this.state === 'empty') {
      this.setState('not_synced');
    }
    
    return {
      key,
      version,
      timestamp,
      action: 'created'
    };
  }
  
  toTrush(key) {
    if (!this.has(key)) {
      console.log(`Attempted to delete non-existent key: ${key}`);
      return false;
    }
    
    const timestamp = Date.now();
    
    // Помечаем как удаленный локально
    this._deleted.set(key, timestamp);
    
    // Генерируем событие удаления для других узлов
    const deletionEvent = {
      key: key,
      timestamp: timestamp,
      sourceNamespace: this.namespace,
      lastVersion: this._versions.get(key)
    };
    
    console.log(`Deletion event sent for key: ${key}`);
    
    return true;
  }
  
  isTrushed(key) {
    return this._deleted.has(key);
  }
  
  has(key) {
    return this._values.has(key) && !this.isTrushed(key);
  }
  
  resolveVersionConflict(originalKey, localVersion, shouldSendEvent = false) {
    const keyHash = this._hashFunction(originalKey);
    const versionHash = this._hashFunction(localVersion);
    
    // Берем по половине от каждого хэша
    const keyPart = keyHash.slice(0, keyHash.length / 2);
    const versionPart = versionHash.slice(0, versionHash.length / 2);
    
    const localNewKey = keyPart + versionPart;
    
    // Сохраняем данные под новым ключом
    this._values.set(localNewKey, this._values.get(originalKey));
    this._hashes.set(localNewKey, this._hashes.get(originalKey));
    this._versions.set(localNewKey, this._versions.get(originalKey));
    this._timestamps.set(localNewKey, this._timestamps.get(originalKey));
    
    // Удаляем старую запись
    this._values.delete(originalKey);
    this._hashes.delete(originalKey);
    this._versions.delete(originalKey);
    this._timestamps.delete(originalKey);
    
    // Отправляем событие ТОЛЬКО при первоначальном конфликте
    if (shouldSendEvent) {
      this.send(versionConflictEvent, {
        originalKey,
        conflictingVersion: localVersion,
        namespace: this.namespace,
        storeUuid: this.uuid
      });
    }
    
    return localNewKey;
  }
  
  handleObjectCreated(event) {
    // 1. Игнорируем события от самого себя
    if (event.storeUuid === this.uuid) {
      console.log('Ignored self-created object event');
      return;
    }
    
    // 2. Фильтрация по namespace
    if (event.namespace !== this.namespace) {
      console.log(`Ignored event from different namespace: ${event.namespace} vs ${this.namespace}`);
      return;
    }
    
    // 3. Проверяем, не был ли объект уже удален
    if (this.isTrushed(event.key)) {
      console.log(`Ignored creation event for trushed key: ${event.key}`);
      return;
    }
    
    const key = event.key;
    const incomingData = event.data;
    const incomingVersion = event.version;
    
    try {
      // 4. Проверяем размер данных
      if (incomingData.byteLength > 64 * 1024) {
        console.error(`Incoming object exceeds size limit: ${incomingData.byteLength} bytes`);
        return;
      }
      
      // 5. Вычисляем хэш полученных данных
      const dataHash = this._hashFunction(incomingData)
      
      // 6. Проверяем, существует ли уже объект с таким ключом
      const alreadyExists = this._values.has(key)
      
      if (alreadyExists) {
        const localVersion = this._versions.get(key);
        
        if (localVersion === incomingVersion) {
          console.log(`Object ${key} already synchronized with same version`);
          return;
        }
        
        // Версии расходятся — разрешаем конфликт
        this.resolveVersionConflict(key, localVersion, true);
        action = 'conflict_resolved';
      } else {
        // 7. Сохраняем объект в хранилище
        const timestamp = Date.now();
        
        this._values.set(key, incomingData);
        this._hashes.set(key, dataHash);
        this._versions.set(key, incomingVersion);
        this._timestamps.set(key, timestamp);
      }
      
      console.log(`Successfully processed remote object creation: ${key}, version: ${incomingVersion}`);
      
      // 8. Обновление состояния
      if (this.state === 'empty') {
        this.setState('not_synced');
      }
      
    } catch (error) {
      console.error('Error processing remote object creation:', error);
    }
  }
  
  handleVersionConflict(event) {
    // 1. Игнорируем события от самого себя
    if (event.storeUuid === this.uuid) {
      console.log('Ignored self-generated conflict event');
      return;
    }
    
    // 2. Фильтрация по namespace
    if (event.namespace !== this.namespace) {
      console.log(`Ignored conflict from different namespace: ${event.namespace}`);
      return;
    }
    
    const { originalKey, conflictingVersion } = event;
    
    // 3. Проверяем наличие объекта
    if (!this._values.has(originalKey)) {
      console.log(`No local object for conflict: ${originalKey}`);
      return;
    }
    
    // 4. Проверяем удаление
    if (this.isTrushed(originalKey)) {
      console.log(`Ignored conflict for trushed key: ${originalKey}`);
      return;
    }
    
    try {
      // 5. Сравниваем версии
      const localVersion = this._versions.get(originalKey);
      if (localVersion === conflictingVersion) {
        console.log(`Conflict already resolved for: ${originalKey}`);
        return;
      }
      
      // 6. Разрешаем конфликт без отправки нового события
      this.resolveVersionConflict(originalKey, localVersion, false);
      
      console.log(`Resolved remote conflict for key: ${originalKey}`);
      
    } catch (error) {
      console.error('Conflict resolution error:', error);
    }
  }
}