import { encode, decode } from '@msgpack/msgpack'

/**
 * Конвертирует произвольные данные в Uint8Array с использованием MessagePack.
 * Поддерживает вложенные бинарные данные, типизированные массивы, объекты и примитивы.
 * @param {*} data - данные для сериализации
 * @returns {Uint8Array} сериализованные байты
 */
export function convertDataToUint8Array(data) {
  try {
    return encode(data)
  } catch (error) {
    throw new Error(`Failed to serialize with MessagePack: ${error.message}`)
  }
}

export function convertUint8ArrayToData(bytes) {
  return decode(bytes)
}