export function hashFromMapByKeys(map, hashFunction) {
    return [...map.keys()]
    .sort()
    .reduce((acc, key) => hashFunction(acc+key), '')
}