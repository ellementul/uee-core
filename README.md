# UEE
United Events Environment

TODO Connect Parcel!!!

Your module should to extend UEEModule.

```javascript
class YourModule extends UEEModule {

}
```

And your module send UEEManager to run
```javascript
import YourModule from 'your-module.js'
const dispatcher = new UEEDispatcher()
const manager = new UEEManager(dispatcher)
manager.initModule(YourModule)
manager.run()
```

## Plans
1. Time server(ticker)
1. Module ticker send message "tick"(time and count)
1. HTML widget module
1. Time widget
1. Count server widget

### Chat
1. Chat without history
2. Chat show module(recive message)
2. Create new message module(only send message, in message count server and time)
2. Realtime chat(show message what other person write)
3. Create state module, State module send message "Update State of Module", "Load State of Module"
3. Create history module, get state and compare old state
3. History module send event "Save DB object", write object name in const entity 
3. History module get message "Load State of Module" and send "Get DB Object", write object name in const entity 
3. Add in payload and signature Event const "Entity"
3. Create DB module, get message  "Get DB  Object", "Save DB  Object", get object name in const entity 
3. DB send event "Update DB Object", write object name in const entity
3. Chat show extends state module
3. Chat with history
4. Chat with Auth
4. Create several chats

### First game
1. Zero-cross game