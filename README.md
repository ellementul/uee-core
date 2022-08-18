# UEE
United Events Environment
- Написать юнит тест для стейт модуля(переименовать тест для фабрики отделив его от тестов для модулей без окружения)
- Добавить в фабрику среды категории модулей в разных состояниях, пока только Builded, Loaded, Running
- Фабрика передает модулям сообщения о смене состояния чтобы довести их до нужного.
- Проверить все это в тесте для фабрики.
- Добавить возможноть в модуле наследнике прослушивать события смены состояния через специальные методы которые вызывает родитель сам.
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