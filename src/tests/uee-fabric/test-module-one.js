import BaseMember from "../../BaseMember/abstaract-module.js"

class TestModuleOne extends BaseMember {
  
  defEvents () {
    return [{ name: 'message', payloadType: { system: "Testing" } }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    expect(payload).toEqual({ system: 'Testing', message: `It send Module Two` });
    this.sendEvent({ name: 'answer', payload: 'It is sent Module One' })
  }
}

export default TestModuleOne