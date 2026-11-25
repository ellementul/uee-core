# PROBLEMS

Подтверждённые текущие проблемы кода. Каждая проверена по исходникам.

## Неограниченный рост `MemberFactory.caches`

`CACHE_LIMIT` (`src/Member/index.js:5`) ограничивает только размер `Set` внутри ключа (`src/Member/index.js:188-191`), но не количество самих ключей `${sourceUid}:${memberUid}` в `Map` (`src/Member/index.js:174-181`). `destroy()` кэш не очищает (`src/Member/index.js:309-332`). Ключи приходят из внешних событий, поэтому число ключей растёт без границы.

## Циклические зависимости в `addMember`

`src/Tools/room/tool.js:47-50` добавляет участника без проверки на себя/предков; `MemberFactory.addMember` — это прямой алиас (`src/Member/index.js:132`). В `room.sendEvent` → `sendOutside` → `room.sendEvent` нет visited-set или TTL (`src/Tools/room/tool.js:61-75`, `src/Member/index.js:167-171`). Два room, добавившие друг друга, дают `RangeError: Maximum call stack size exceeded` при отправке валидного внешнего события.

## `deepFreezeMsg` мутирует входные данные

`src/utils/deepFreeze.js:105-115` присваивает преобразованные значения в исходные массивы и объекты до `Object.freeze`. Дополнительно: `path.push` без `pop` (`:60`) даёт ложное срабатывание циклической ссылки на двух sibling-ссылках к одному объекту, хотя комментарий в файле обещает WeakSet.

## Один коллбэк в transport-интерфейсе

`Connection` и фабрики соединений хранят по одному коллбэку на событие (`src/Transport/InMemory/index.js:68-70,127-163,257,340-352`). Мультикаст выполняется перебором `Set` в `HostConnectionFactory` (`:256,274-298`), а `SerializationMiddleware` (`:171-241`) — декоратор, который только сериализует в JSON. Первоначальный тезис («рассылка управляется декоратором») не соответствует коду.
