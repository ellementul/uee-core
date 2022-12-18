module.exports = {
  ...require('./src/Event'),
  ...require('./src/Provider'),
  ...require('./src/Member'),
  ...require('./src/Transport'),
  events: {
    change: require('./src/Member/events/change_state_event'),
    connect: require('./src/Member/events/connected_event'),
    log: require('./src/Member/events/log_event'),
    error: require('./src/Member/events/error_event')
  }
}