# UEE
United Events Environment
## Мета модуль:
- Существует в едиснтвенном экземпляре( или все экзепляры кроме одного в режиме readonly)
- Слушает все сообщения о состоянии модулей
- Заполняет у себя список запущеных модулей
- Реализует функции загрузки и запуска модулей
- Может сделать запрос на создание нового модуля определного класса
- Содержит список систем и уведомляет другие модули о состоянии этих систем
- Позволяет создать зависимый от опредленных систем модуль, который стартует или загрузится как только эти системы будут готовы.

## Задачи:
- Create modules system interface    

- Make async onBuild, onLoad, onStart in state module(if promise then wait, esle sync call)
- Create DB module
- Test connect to base while building
- Connect to base while running
- Ticking time event generate 

- Создать мета модуль из системного и определить в нем существование двух систем: Modules, Store
- Первую систему объявляет о готовности Менеджер
- Вторая система включает в себя DB Module
- Так же менеджер передает мета модулю список систем, и типов модулей которые в них участвуют.
- Присуствие модуля в системе должно быть обязательным, иначе модуль не часть этой системы.
- Готовность системы объявляется только тогда когда все модули
- Статус всех систем должен отслеживать сам метамодуль, в том числе пинговать каждого менеджера и модули в каждой системе(часть их он может не пинговать, а просто ловить от них сообщения)
- 

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