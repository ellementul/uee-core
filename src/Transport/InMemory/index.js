/**
 * Синглтон-реестр для имитации сети.
 * Хранит все зарегистрированные хосты для возможности подключения клиентов.
 */
const registry = {
  hosts: new Map(),
  
  register(name, factory) {
    if (this.hosts.has(name)) {
      throw new Error(`Host "${name}" already registered`)
    }
    this.hosts.set(name, factory)
  },
  
  unregister(name) {
    this.hosts.delete(name)
  },
  
  get(name) {
    return this.hosts.get(name)
  },
  
  has(name) {
    return this.hosts.has(name)
  },
  
  reset() {
    this.hosts.clear()
  }
}

/**
 * Базовый интерфейс соединения.
 * Все методы должны быть реализованы в наследниках.
 */
class Connection {
  send(data) {
    throw new Error("Method 'send' must be implemented")
  }
  
  onMessage(callback) {
    throw new Error("Method 'onMessage' must be implemented")
  }
  
  close() {
    throw new Error("Method 'close' must be implemented")
  }
  
  onClose(callback) {
    throw new Error("Method 'onClose' must be implemented")
  }
  
  onError(callback) {
    throw new Error("Method 'onError' must be implemented")
  }
}

/**
 * Мок соединения для тестирования.
 * Имитирует сетевую задержку и ошибки.
 * Работает с сериализованными данными (строками).
 */
class MockConnection extends Connection {
  constructor({ delay = 0, errorRate = 0 } = {}) {
    super()
    this._delay = delay
    this._errorRate = errorRate
    this._onMessage = null
    this._onClose = null
    this._onError = null
    this._closed = false
    this._pair = null
    this._messageQueue = []
    this._processing = false
  }
  
  _setPair(pair) {
    this._pair = pair
  }
  
  send(data) {
    if (this._closed) {
      const err = new Error("Connection is closed")
      if (this._onError) {
        this._onError(err)
      }
      return
    }
    
    // Имитация ошибки с вероятностью errorRate
    if (this._errorRate > 0 && Math.random() < this._errorRate) {
      const err = new Error("Simulated network error")
      if (this._onError) {
        this._onError(err)
      }
      return
    }
    
    // Добавляем сообщение в очередь сразу же
    this._messageQueue.push(data)
    
    // Запускаем обработку очереди если она не запущена
    if (!this._processing) {
      this._processQueue()
    }
  }
  
  async _processQueue() {
    this._processing = true
    
    while (this._messageQueue.length > 0) {
      const data = this._messageQueue.shift()
      
      // Задержка перед доставкой сообщения (с jitter)
      const jitter = this._delay * 0.1 * Math.random()
      await new Promise(resolve => setTimeout(resolve, this._delay + jitter))
      
      // Доставляем сообщение парной стороне
      if (this._pair && !this._pair._closed && this._pair._onMessage) {
        this._pair._onMessage(data)
      }
    }
    
    this._processing = false
  }
  
  onMessage(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onMessage = callback
  }
  
  close() {
    if (this._closed) return
    this._closed = true
    
    // Очищаем очередь сообщений
    this._messageQueue = []
    
    if (this._onClose) {
      this._onClose()
    }
    
    // Закрываем парную сторону
    if (this._pair && !this._pair._closed) {
      this._pair.close()
    }
  }
  
  onClose(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onClose = callback
  }
  
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onError = callback
  }
}

/**
 * Middleware сериализации/десериализации.
 * Оборачивает Connection и конвертирует объекты в JSON и обратно.
 * Реализует тот же интерфейс что и Connection (паттерн Декоратор).
 */
class SerializationMiddleware extends Connection {
  constructor(connection) {
    super()
    this._connection = connection
    this._onMessage = null
    this._onClose = null
    this._onError = null
    
    // Подписываемся на события внутреннего соединения
    connection.onMessage((serialized) => {
      if (this._onMessage) {
        try {
          const data = JSON.parse(serialized)
          this._onMessage(data)
        } catch (err) {
          if (this._onError) {
            this._onError(new Error(`Deserialization failed: ${err.message}`))
          }
        }
      }
    })
    
    connection.onClose(() => {
      if (this._onClose) {
        this._onClose()
      }
    })
    
    connection.onError((err) => {
      if (this._onError) {
        this._onError(err)
      }
    })
  }
  
  send(data) {
    try {
      const serialized = JSON.stringify(data)
      this._connection.send(serialized)
    } catch (err) {
      if (this._onError) {
        this._onError(new Error(`Serialization failed: ${err.message}`))
      }
    }
  }
  
  onMessage(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onMessage = callback
  }
  
  close() {
    this._connection.close()
  }
  
  onClose(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onClose = callback
  }
  
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onError = callback
  }
}

/**
 * Фабрика соединений для хоста.
 * Регистрирует себя в синглтон-реестре под указанным именем.
 */
class HostConnectionFactory {
  constructor({ name, delay = 0, errorRate = 0 } = {}) {
    if (!name) {
      throw new TypeError("Host name is required")
    }
    
    this._name = name
    this._delay = delay
    this._errorRate = errorRate
    this._connections = new Set()
    this._onConnection = null
    this._onError = null
    this._stopped = false
    
    registry.register(name, this)
  }
  
  onConnection(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    
    const firstCall = this._onConnection === null
    this._onConnection = callback
    
    // При повторном вызове передаём все существующие соединения
    if (!firstCall) {
      for (const conn of this._connections) {
        callback(conn)
      }
    }
  }
  
  /**
   * Не часть публичного интерфейса.
   * Вызывается клиентом через синглтон-реестр для передачи соединения.
   */
  _acceptConnection(connection) {
    if (this._stopped) {
      connection.close()
      return
    }
    
    this._connections.add(connection)
    
    connection.onClose(() => {
      this._connections.delete(connection)
    })
    
    if (this._onConnection) {
      this._onConnection(connection)
    }
  }
  
  stop() {
    this._stopped = true
    
    for (const conn of this._connections) {
      conn.close()
    }
    this._connections.clear()
    
    registry.unregister(this._name)
  }
  
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onError = callback
  }
  
  _emitError(err) {
    if (this._onError) {
      this._onError(err)
    }
  }
}

/**
 * Фабрика соединений для клиента.
 * Не регистрирует себя в реестре, подключается к хостам по имени.
 */
class ClientConnectionFactory {
  constructor({ delay = 0, errorRate = 0 } = {}) {
    this._delay = delay
    this._errorRate = errorRate
    this._connections = new Set()
    this._onConnection = null
    this._onError = null
    this._stopped = false
  }
  
  onConnection(callback, hostName) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    if (!hostName) {
      throw new TypeError("Host name is required")
    }
    
    this._onConnection = callback
    
    // Создаём новое соединение
    this._connectTo(hostName)
  }
  
  _connectTo(hostName) {
    const host = registry.get(hostName)
    
    if (!host) {
      const err = new Error(`Host "${hostName}" not found`)
      if (this._onError) {
        this._onError(err)
      }
      return
    }
    
    // Создаём пару соединений (клиентская и хостовая стороны)
    const clientSide = new MockConnection({
      delay: this._delay,
      errorRate: this._errorRate
    })
    const hostSide = new MockConnection({
      delay: host._delay,
      errorRate: host._errorRate
    })
    
    clientSide._setPair(hostSide)
    hostSide._setPair(clientSide)
    
    // Оборачиваем в middleware сериализации
    const clientConn = new SerializationMiddleware(clientSide)
    const hostConn = new SerializationMiddleware(hostSide)
    
    // Отслеживаем закрытие
    this._connections.add(clientConn)
    clientConn.onClose(() => {
      this._connections.delete(clientConn)
    })
    
    // Передаём хосту его сторону соединения
    host._acceptConnection(hostConn)
    
    // Передаём клиенту его сторону соединения
    if (this._onConnection) {
      this._onConnection(clientConn)
    }
  }
  
  stop() {
    this._stopped = true
    
    for (const conn of this._connections) {
      conn.close()
    }
    this._connections.clear()
  }
  
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError("Callback must be a function")
    }
    this._onError = callback
  }
  
  _emitError(err) {
    if (this._onError) {
      this._onError(err)
    }
  }
}

export {
  Connection,
  MockConnection,
  SerializationMiddleware,
  HostConnectionFactory,
  ClientConnectionFactory,
  registry
}