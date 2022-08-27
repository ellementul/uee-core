# UEE
United Events Environment
## Мета модуль:
- Ключевые задачи
  - Отслеживать статус всех модулей
  - Обновление статуса систем
- Субзадачи
  - Подписаться на событие обновления статуса модулей
  - Пинговать модули чтобы получать от них статус
  - При смене статуса модуля обновлять статус системы связаной с ним.


## Задачи:


Перейти на [https://parceljs.org/getting-started/webapp/]
Определить UI модуль


- Create SystemManagerModule
  - Определить события для отслеживания состояние модулей
  - Сделать тест с одним модулем которым мы стратуем сообщением вручную
  - Написать тест с тестовой системой которая содержит один тип модуля, и написать это тестовый модуль
  - Написать метод для определения системы внутри мета модуля
  - Написать триггер который создат сообщение о смене статуса ситемы когда все модули внутри нее достигнут определеного статуса
    - в данном случае если наш модуль запущен
    - потом добавить в тестовую систему еще один модуль который сам зависит от другой фейковой системы
    - запустить это модуль так же вручную, послав сообщение о том что фейковая система готова
  - Вынести все определения тестовых сущностей в отдельный файл, чтобы вызов всей цепочки событий можно было запустить одним вызовом функции
    - добить функцию так чтобы она принимала список событий, которые последовательно отсылает через диспетчер
    - сделать несколько одинаковых тестов где события посылаются в разном порядке
  - Передать мета модуль как аргумент Менеджеру
  - Написать другой тест(тест для Менеджера) который убедится что с менедежером все работает так же

- Test ModuleManagerModules with Manager
- Manager recieve this module as argument for constructor

- Create Store system
  - Events
    - requestToUpdateEntityInDB
    - UpdateEntityInDB
    - requestToLoadEntity(if entity doesn't exist then create)
    - LoadEntityInModule
  - Modules
    - Store module type
  
- Create abstract module with Store type(extend SystemModule, system ManageModule )
- Create abstract adapter DB
- Test connect to base while building
- Connect to base while running
- Send event about Store system to be ready
- Ticking time event generate

- Make test for Manager
- replace event create event in module manager


- Создать мета модуль из state module
- Первую систему объявляет о готовности Менеджер
- Так же менеджер передает мета модулю список систем, и типов модулей которые в них участвуют.
- Присуствие модуля в системе должно быть обязательным, иначе модуль не часть этой системы.
- Готовность системы объявляется только тогда когда все модули
- Статус всех систем должен отслеживать сам метамодуль, в том числе пинговать каждого менеджера и модули в каждой системе(часть их он может не пинговать, а просто ловить от них сообщения)

- Фабрика больше не принимает готовые объекты, а только конструторы
- Фабрика принимает мета модуль отдельно и опционально
- Фабрика не просто функция, а служба.
- Проверить все это в тесте для фабрики.
- СДелать фукнции наблюдения асинхронными
- Исправить импорты
- Документировать новый модуль 



TODO: Added Meta Module
Defined six events-methods:
State: null
Build
State: Builded
Load
State: loaded
Run //Избавится от публичного метода и от запуска его в менеджере, для запуска этого метода и остальных передавать сообщение модулю.
State: Running
State: Readonly
Sleep
State: Sleeping
OnlyRead
Stop
State: null
Эти сообщения существуют в системе событий управления модулями.
Модуль может изменить свое состояние по запросу полученого сообщения.
Когда стартует среда, она может перевести определеные модули в определеное состояние с помощью передачи им серии сообщений.
Начальное состояние любого только что созданого модуля, это builded.
Когда менеджер меняет состояние модуля он сообщает об это в систему
Модуль после смены состояния извещает об этом всех.

Менеджер модулей не решает задачу какие модули нужно добавить, а какие усыпить или остановить.
Менеджеры модулей только обмениваются списком запущеных модулей между собой.
Но менеджеры запускают модули если получат об этом сообщение, менеджеры могут решать кто из них конкретно запустит этот модуль.

TODO: Ping between Managers by ServerTime, there are list modules in ping for checking avalibility modules
TODO: event faster then running module(accamulate events)


```javascript
class YourModule extends UEEModule {
  constructor (yourModuleParams) {

  }

  defEvents () {
    return [{
      // Define event signature 
      name: 'YourEvent', 
      payloadType: { 
        system: "YourSystemName(Or empty)", 
        entity: "NameObject(Or empty)"
      } 
    }]
  }
}
```

And your module send UEEManager to run
```javascript
import { UEE } from 'uee'
import YourModule from 'your-module.js'
import YourTransport from 'your-transport.js'
new UEE({
  transport: new YourTransport(transportParams),
  modules: [new YourModule(yourModuleParams)],
  isRun: true,
})
```