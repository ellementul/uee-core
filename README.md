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
const manager = new UEEManager
manager.initModule(YourModule)
manager.run()
```