# UEE
United Events Environment

YOURModule extend UEEModule {

  need methods: {
    defineEvents
    run
    callbacks methods with names events...
  }

  portotype(UEEModule's methods): {
    define event and check method for this event
    send event
  }
}