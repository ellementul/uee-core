# UEE
United Events Environment
TODO: Added Meta Module
Defined six events-methods:
Build
Load
Run //Избавится от публичного метода и от запуска его в менеджере, для запуска этого метода и остальных передавать сообщение модулю.
Sleep
Readonly
Stop

Для того чтобы мета модуль мог управлять остальными модулями, создать систему событий которую через которую взаимодествуют менеджеры модулей и метамодуль.
Именно менеджер модулей сообщает о подключении нового клиента
Модули так же могут прослушивать эти сообщения, но только те что касаются их.
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