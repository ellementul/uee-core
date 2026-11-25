# UnyEvents Core

Фреймворк для событийно-ориентированной коммуникации между компонентами, объединёнными в комнаты.

### Другие языки
#### [English](README.md)

## Возможности

- **Событийная архитектура**: типизированные события с валидацией
- **Комнаты**: участники объединяются в комнаты, события распределяются по графу комнат
- **Инструменты**: конечные автоматы, обмен пингами и логирование подключаются к участнику как инструменты
- **Транспорт (планируется)**: фабрики соединений хоста/клиента и адаптер виртуальной комнаты; архитектура описана в [TODO.md](TODO.md)
- **Кроссплатформенность**: работает в Node.js и в браузере

## Установка

```bash
npm install @ellementul/uny-events
```

Публичные экспорты: `Types`, `EventFactory`, `MemberFactory`, `RelationTool`, `StateTool`, `DEFAULT_STATE`, `ANY_STATE`.

## Основные понятия

### Member (Участник)

`MemberFactory` может создать комнату, присоединиться к другой комнате и отправлять/получать типизированные события.

Реально вызываемые коллбэки:

- `onJoinRoom(roomUid)` — при присоединении к комнате через `setOutsideRoom`;
- `onDestroy()` — только при явном вызове `destroy()`; `deleteMember()` его не вызывает.

Методы:

- `makeRoom({ provider, inEvents, outEvents })` — создать комнату на этом участнике;
- `addMember(member)` / `deleteMember(uid)` — доступны после `makeRoom()`;
- `send(event, payload)` / `sendEvent(msg)` — отправить событие;
- `subscribe(event, handler, getSelfEvent, memberUid, limit)` — подписаться на событие;
- `subscribeTool(...)` / `unsubscribe(...)` — подписка/отписка с id инструмента;
- `setOutsideRoom(room)` / `leaveRoom(roomUid)` — присоединиться/выйти из внешней комнаты;
- `destroy()` — уничтожить инструменты и выйти из внешних комнат.

### Event (Событие)

Типизированное сообщение, создаваемое `EventFactory(type)`. Умеет валидировать данные (`createMsg`, `isValid`, `getValidError`), вычислять сигнатуру (`sign`) и вызывать коллбэки (`on`, `off`, `call`).

### Room (Комната)

Комната создаётся вызовом `makeRoom()` на `MemberFactory` и lives в `member.tools.room`. Она хранит участников (`addMember`, `deleteMember`, `children`), `Provider` и маршрутизирует события (`sendEvent`, `subscribe`, `unsubscribe`). Отдельного публичного класса `Room` нет.

### Инструменты

`addTool(config)` добавляет инструмент в `member.tools[name]`. Конфигурат создаётся фабрикой и имеет вид `{ name, ToolFactory, depends }`; `ToolFactory(depends)` возвращает объект инструмента. `MemberFactory.destroy()` вызывает `destroy()` у всех инструментов, где он определён.

## RelationTool (обмен пингами)

```js
import { MemberFactory, RelationTool } from "@ellementul/uny-events"

const member = new MemberFactory()
member.makeRoom()
member.addTool(RelationTool({ statusValues: ['Running'], pingDelay: 250 }))

const relations = member.tools.Relations
relations.setRole('Master')
relations.setStatus('Running')
relations.onStatusTransition('Created', 'Running', (to, from) => { /* ... */ })
```

Опции: `name` (по умолчанию `"Relations"`), `statusValues` (по умолчанию `['Created']`), `pingDelay` в мс (по умолчанию `250`).

`role` — обычная строка (`setRole`/`role`). `status` — конечный автомат, который ведёт внутренний `StateTool`, зарегистрированный как `member.tools.Status`; начальное значение `'Created'`, допустимы только `statusValues`, чтение/запись через `status()`/`setStatus()`. Пинги несут роль, статус, время работы, список детей и хэши списка участников.

## StateTool

```js
import { MemberFactory, StateTool, ANY_STATE } from "@ellementul/uny-events"

const member = new MemberFactory()
member.makeRoom()
member.addTool(StateTool({ possibleValues: ['idle', 'active'] }))

const state = member.tools.State
state.onTransition('idle', 'active', (to, from) => { /* ... */ })
state.setState('idle')
state.setState('active')
```

Опции: `possibleValues` (обязательно, не пусто), `name` (по умолчанию `"State"`), `initialState` (по умолчанию `DEFAULT_STATE`). `ANY_STATE` можно использовать как подстановочный символ в правилах перехода, но нельзя установить как состояние. Self-переходы `X → X` запрещены. Изменения состояния доставляются только через коллбэки переходов — события не отправляются.

Методы: `state()`, `possibleValues()`, `checkValue(value)`, `checkState(value)`, `setState(value)`, `onTransition(from, to, callback)`, `removeTransitionCallback(from, to)`, `destroy()`.

## Примеры

### Создание комнаты и добавление участника

```js
import { MemberFactory } from "@ellementul/uny-events"

const room = new MemberFactory()
room.makeRoom()

const member = new MemberFactory()
member.onJoinRoom = roomUid => console.log('joined', roomUid)
room.addMember(member)

room.deleteMember(member.uid())
```

### Отправка и подписка

```js
import { Types, EventFactory, MemberFactory } from "@ellementul/uny-events"

const type = Types.Object.Def({
  system: 'Test',
  action: Types.String.Def()
})
const event = EventFactory(type)

const member = new MemberFactory()
member.makeRoom()
member.subscribe(event, payload => console.log(payload))
member.send(event, { action: 'Switch On' })
```

## Разработка

```bash
npm test                       # все тесты
npm run test:w                 # режим наблюдения
npm run test:browser:ticker    # браузерные тесты тикера
npm run test:browser:member    # браузерные тесты участника
```

## Лицензия

ISC
