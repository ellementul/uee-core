import test from 'ava'
import sinon from 'sinon'
import { deepFreezeMsg } from './deepFreeze.js'

test('throws error for non-object payload', t => {
  t.throws(() => {
    deepFreezeMsg(null)
  }, { 
    message: "payload required type of object",
    instanceOf: TypeError
  })
})

test('accepts empty object and array', t => {
  const emptyObj = {}
  const frozenObj = deepFreezeMsg(emptyObj)
  t.true(Object.isFrozen(frozenObj))
  
  const emptyArray = []
  const frozenArray = deepFreezeMsg(emptyArray)
  t.true(Object.isFrozen(frozenArray))
})

test('primitives are returned unchanged', t => {
  const obj = {
    string: 'value',
    number: 42,
    boolean: true,
    null: null,
    undefined: undefined
  }
  
  const frozen = deepFreezeMsg(obj)
  
  t.is(frozen.string, 'value')
  t.is(frozen.number, 42)
  t.is(frozen.boolean, true)
  t.is(frozen.null, null)
  t.is(frozen.undefined, undefined)
  t.true(Object.isFrozen(frozen))
})

test('simple objects are frozen', t => {
  const obj = { key: 'value' }
  const frozen = deepFreezeMsg(obj)
  
  t.true(Object.isFrozen(frozen))
  t.deepEqual(frozen, obj)
  
  // Попытка изменения должна вызвать ошибку
  t.throws(() => {
    frozen.key = 'new value'
  }, { instanceOf: TypeError })
})

test('nested objects are deeply frozen', t => {
  const obj = { 
    key: 'value', 
    nested: { 
      inner: 'inner value' 
    } 
  }
  const frozen = deepFreezeMsg(obj)
  
  t.true(Object.isFrozen(frozen))
  t.true(Object.isFrozen(frozen.nested))
  
  t.throws(() => {
    frozen.nested.inner = 'new value'
  }, { instanceOf: TypeError })
})

test('arrays are frozen and elements are processed', t => {
  const arr = [1, 2, { nested: 'value' }]
  const frozen = deepFreezeMsg(arr)
  
  t.true(Object.isFrozen(frozen))
  t.true(Object.isFrozen(frozen[2]))
  
  t.throws(() => {
    frozen.push(4)
  }, { instanceOf: TypeError })
  
  t.throws(() => {
    frozen[2].nested = 'new value'
  }, { instanceOf: TypeError })
})

test('Uint8Array is not copied or frozen', t => {
  const uint8 = new Uint8Array([1, 2, 3])
  const payload = { buffer: uint8 }
  const frozen = deepFreezeMsg(payload)
  
  t.is(frozen.buffer, uint8) // Ссылка не изменилась
  
  // Можно изменить содержимое
  uint8[0] = 99
  t.is(frozen.buffer[0], 99)
})

test('other binary types are ignored with warning', t => {
  const warnStub = sinon.stub(console, 'warn')
  
  try {
    const payload = {
      buffer: new ArrayBuffer(8),
      dataView: new DataView(new ArrayBuffer(8)),
      int8: new Int8Array([1, 2, 3])
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.is(frozen.buffer, null)
    t.is(frozen.dataView, null)
    t.is(frozen.int8, null)
    
    t.true(warnStub.calledWithMatch(/Binary type.*will be ignored/))
    t.is(warnStub.callCount, 3)
  } finally {
    warnStub.restore()
  }
})

test('Date objects are converted to timestamp objects with warning', t => {
  const warnStub = sinon.stub(console, 'warn')
  
    const date = new Date('2023-01-01T00:00:00Z')

    try {
        const payload = {
            date
        }
        
        const frozen = deepFreezeMsg(payload)
        
        t.true(Object.isFrozen(frozen.date))
        t.is(frozen.date._date, true)
        t.is(frozen.date.timestamp, date.getTime())
        t.true(warnStub.calledWithMatch(/Date object.*will be converted to unix timestamp/))
    } finally {
        warnStub.restore()
    }
})

test('Error objects are converted to plain objects', t => {
    const payload = {
        error: new Error('Test error')
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.true(Object.isFrozen(frozen.error))
    t.is(frozen.error.name, 'Error')
    t.is(frozen.error.message, 'Test error')
    
    // Проверяем подклассы
    const payloadWithTypeError = {
        typeError: new TypeError('Type error')
    }
    
    const frozenTypeError = deepFreezeMsg(payloadWithTypeError)
    t.is(frozenTypeError.typeError.name, 'TypeError')
})

test('Map is converted to plain object with warning', t => {
  const warnStub = sinon.stub(console, 'warn').callsFake(() => {})
  
  try {
    const payload = {
      map: new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ])
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.true(Object.isFrozen(frozen.map))

    

    t.deepEqual(frozen.map, { key1: 'value1', key2: 'value2' })
    t.true(warnStub.calledWithMatch(/Map.*will be converted to plain object/))
  } finally {
    warnStub.restore()
  }
})

test('Map with non-string keys throws error', t => {
  const payload = {
    map: new Map([
      [123, 'value'] // Числовой ключ
    ])
  }
  
  t.throws(() => {
    deepFreezeMsg(payload)
  }, { message: /Map key.*must be string.*number/ })
})

test('Set is converted to array with warning', t => {
  const warnStub = sinon.stub(console, 'warn')
  
  try {
    const payload = {
      set: new Set(['value1', 'value2', 'value3'])
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.true(Object.isFrozen(frozen.set))
    t.deepEqual(frozen.set, ['value1', 'value2', 'value3'])
    t.true(warnStub.calledWithMatch(/Set.*will be converted to array/))
  } finally {
    warnStub.restore()
  }
})

test('WeakMap and WeakSet are ignored with warning', t => {
  const warnStub = sinon.stub(console, 'warn')
  
  try {
    const payload = {
      weakMap: new WeakMap(),
      weakSet: new WeakSet()
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.deepEqual(frozen.weakMap, {})
    t.deepEqual(frozen.weakSet, {})
    t.true(warnStub.calledWithMatch(/WeakMap.*will be ignored/))
    t.true(warnStub.calledWithMatch(/WeakSet.*will be ignored/))
  } finally {
    warnStub.restore()
  }
})

test('RegExp is ignored with warning', t => {
  const warnStub = sinon.stub(console, 'warn')
  
  try {
    const payload = {
      regex: /test/i
    }
    
    const frozen = deepFreezeMsg(payload)
    
    t.is(frozen.regex, null)
    t.true(warnStub.calledWithMatch(/RegExp.*will be ignored/))
  } finally {
    warnStub.restore()
  }
})

test('cyclic references throw error with path', t => {
  const obj = { self: null }
  obj.self = obj
  
  const payload = { cyclic: obj }
  
  t.throws(() => {
    deepFreezeMsg(payload)
  }, { 
    message: /Cyclic reference detected/,
    instanceOf: TypeError
  })
})

test('forbidden types throw errors', t => {
  const payloadWithFunction = {
    func: () => {}
  }
  
  t.throws(() => {
    deepFreezeMsg(payloadWithFunction)
  }, { 
    message: /Functions are not allowed in payload/,
    instanceOf: TypeError
  })
  
  const payloadWithSymbol = {
    sym: Symbol('key')
  }
  
  t.throws(() => {
    deepFreezeMsg(payloadWithSymbol)
  }, { 
    message: /Symbols are not allowed in payload/,
    instanceOf: TypeError
  })
  
  const payloadWithPromise = {
    promise: Promise.resolve()
  }
  
  t.throws(() => {
    deepFreezeMsg(payloadWithPromise)
  }, { 
    message: /Promises are not allowed in payload/,
    instanceOf: TypeError
  })
})

test('deepFreezeMsg handles complex nested structures', t => {
  const complexObj = {
    string: 'value',
    number: 42,
    boolean: true,
    null: null,
    array: [1, 2, 3, { nested: 'object' }],
    object: {
      key1: 'value1',
      key2: {
        inner: 'inner value'
      }
    },
    error: new Error('Test error'),
    set: new Set(['a', 'b', 'c']),
    map: new Map([['x', 'y'], ['z', 'w']])
  }
  
  const frozen = deepFreezeMsg(complexObj, ['root'])
  
  t.true(Object.isFrozen(frozen))
  t.true(Object.isFrozen(frozen.array))
  t.true(Object.isFrozen(frozen.array[3]))
  t.true(Object.isFrozen(frozen.object))
  t.true(Object.isFrozen(frozen.object.key2))
  
  // Проверяем, что Error был преобразован
  t.true(Object.isFrozen(frozen.error))
  t.is(frozen.error.name, 'Error')
  t.is(frozen.error.message, 'Test error')
  
  // Проверяем Set и Map преобразования
  t.true(Array.isArray(frozen.set))
  t.deepEqual(frozen.set, ['a', 'b', 'c'])
  
  t.false(frozen.map instanceof Map)
  t.deepEqual(frozen.map, { x: 'y', z: 'w' })
})