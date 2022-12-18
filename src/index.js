module.exports = {
  ...require('./Event'),
  ...require('./Provider'),
  ...require('./Member'),
  ...require('./Transport'),
  events: {
    change: require('./Member/events/change_state_event'),
    connect: require('./Member/events/connected_event'),
    log: require('./Member/events/log_event'),
    error: require('./Member/events/error_event')
  }
}