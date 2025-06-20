# UnyEvents Core

Мощный фреймворк для событийно-ориентированной коммуникации, предназначенный для построения распределенных систем и приложений реального времени. UEE Core предоставляет гибкую архитектуру для управления коммуникацией на основе событий между различными компонентами вашего приложения.

## Возможности

- **Событийно-ориентированная архитектура**: Построена на надежной системе событий для гибкой коммуникации
- **Организация на основе комнат**: Организуйте компоненты в комнаты для лучшей структуры
- **Множество вариантов транспорта**: Поддержка различных механизмов транспорта, включая:
  - In-memory транспорт для локальной коммуникации
  - PeerJS транспорт для peer-to-peer коммуникации
  - Надежный wrapper транспорт для повышенной надежности
- **Типобезопасные события**: Встроенная система типов для определения событий
- **Кроссплатформенность**: Работает как в Node.js, так и в браузерной среде
- **Расширяемость**: Легко добавлять новые механизмы транспорта и типы событий

## Установка

```bash
npm install @ellementul/uee-core
```

## Основные концепции

### Member (Участник)
Компонент, который может отправлять и получать сообщения. Участники могут быть организованы в комнаты и общаться через события.

#### Callbacks

- `onMakeRoom` - Вызывается, когда участник становится комнатой
- `onJoinRoom` - Вызывается, когда участник присоединяется к комнате
- `onReady` - Вызывается, когда участник готов отправлять и получать сообщения
- `onDestroy` - Вызывается, когда участник уничтожается (например, при удалении из комнаты)

#### Methods

- `makeRoom()`: Создает новую комнату или присоединяется к существующей
- `addMember(member)`: Добавляет участника в комнату
- `send(event, payload)`: Отправляет событие с данными участнику
- `subscribe(event, handler)`: Подписывается на событие и предоставляет обработчик для события 

### Event (Событие)
Типизированное сообщение, определяющее структуру коммуникации между участниками. События типобезопасны и могут быть валидированы.

### Room (Комната)
Специальный участник, который включает Provider для обработки сообщений и событий. Комнаты могут содержать несколько участников и управлять их коммуникацией.

### Transport (Транспорт)
Канал коммуникации, который соединяет две комнаты, обеспечивая обмен сообщениями между ними. Поддерживает различные механизмы транспорта.

## Примеры использования

### Создание участника

```js
import { MemberFactory } from "@ellementul/uee-core"

const member = new MemberFactory()
```

### Создание комнаты

```js
import { MemberFactory } from "@ellementul/uee-core"

const room = new MemberFactory()

// Опциональные колбэки
room.onMakeRoom = () => { 
    console.log("Комната успешно создана!") 
}

room.onInit = () => { 
    console.log("Комната инициализирована!") 
}

room.makeRoom()
```

### Добавление участника в комнату

```js
import { MemberFactory } from "@ellementul/uee-core"

// Создаем и инициализируем комнату
const room = new MemberFactory()
room.onMakeRoom = () => { console.log("Комната создана!") }
room.makeRoom()

// Создаем участника
const member = new MemberFactory()
member.onJoinRoom = () => { console.log("Участник присоединился к комнате") }
member.onReady = () => { console.log("Участник готов") }

// Добавляем участника в комнату
room.addMember(member)
```

### Удаление участника из комнаты

```js
import { MemberFactory } from "@ellementul/uee-core"

// Создаем и инициализируем комнату
const room = new MemberFactory()
room.makeRoom()

// Создаем участника
const member = new MemberFactory()
member.onDestroy = () => { console.log("Участник уничтожается") }
room.addMember(member)

// Удаляем участника из комнаты
room.deleteMember(member.uuid)
```

### Создание и отправка событий

```js
import { Types, EventFactory } from "@ellementul/uee-core"

// Определяем тип события
const type = Types.Object.Def({ 
    system: "Test", 
    action: Types.Any.Def("Switch On", "Switch Off") 
})

// Создаем событие
const event = EventFactory(type)

// Отправляем событие с данными
const payload = { action: "Switch On" }
member.send(event, payload)
```

### Подписка на события

```js
import { Types, EventFactory } from "@ellementul/uee-core"

// Определяем и создаем событие
const type = Types.Object.Def({ 
    system: "Test", 
    action: Types.Any.Def("Switch On", "Switch Off") 
})
const event = EventFactory(type)

// Подписываемся на событие
const handleEvent = (payload) => { 
    console.log("Получено событие:", payload) 
}
member.subscribe(event, handleEvent)
```

### Соединение комнат через транспорт

```js
// Первая комната (Хост)
import { MemberFactory, InMemory } from "@ellementul/uee-core"

const room1 = new MemberFactory()
const transport1 = new InMemory({ 
    id: "TestTransport", 
    isHost: true 
})

room1.makeRoom(transport1)
room1.connect()

// Вторая комната (Клиент)
const room2 = new MemberFactory()
const transport2 = new InMemory({ 
    id: "TestTransport", 
    isHost: false 
})

room2.makeRoom(transport2)
room2.connect()
```

## Разработка

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:w

# Запуск браузерных тестов
npm run test:browser:ticker
npm run test:browser:member
npm run test:browser:peerjs
```

## Лицензия

ISC

## Вклад в проект

Мы приветствуем ваш вклад в проект! Не стесняйтесь отправлять Pull Request.