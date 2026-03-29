import test from 'ava'
import sinon from 'sinon'
import sha1 from 'sha1'
import { loggingErrorEvent, loggingReceivingEvent, loggingSendingEvent, loggingSubscriptionEvent } from './events.js'
import { LogTool } from './tool.js'
import { EventFactory, Types } from '../../Event/index.js'
import { MemberFactory } from '../../Member/index.js'

test.beforeEach(t => {
  ['error', 'log', 'warn'].forEach(method => {
    if (console[method].restore) console[method].restore()
  })
    
  t.context.consoleStub = sinon.stub(console, 'error')
})

test.afterEach(t => {
    t.context.consoleStub.restore()
})

test('tool_initialization', t => {
    const mockMember = {
        uid() { return 'test-member-uid'},
        isReadyToSend() { return true }
    }
  
    const tool = LogTool.ToolFactory({ currentMember: mockMember })
  
    t.is(typeof tool.sendError, 'function')
    t.is(typeof tool.setAlwaysConsole, 'function')
})

test('add tool in member', t => {
    const member = new MemberFactory
    member.strictValidationEvent = true

    member.addTool(LogTool)
    member.makeRoom()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const errorName = "Test Error"
    const callback = sinon.spy(() => { throw new Error(errorName) })
    const errorCallback = sinon.fake()
    
    member.subscribe(event, callback)
    member.subscribe(loggingErrorEvent, errorCallback)
    
    member.send(event)

    t.true(callback.calledOnceWith({ system: "test" }))
    t.true(errorCallback.calledOnce)
    t.true(errorCallback.getCall(0).firstArg.error.message === errorName)
})

test('log to console when member is not ready', t => {
  const mockMember = {
    uid() { return 'test-member-uid'},
    isReadyToSend() { return false }
  }
  
  const tool = LogTool.ToolFactory({ currentMember: mockMember })
  
  const testError = new Error('Test error not ready')
  
  tool.sendError(testError)
  
  t.true(t.context.consoleStub.calledOnce)
  
  const consoleArgs = t.context.consoleStub.firstCall.args
  t.regex(consoleArgs[0], /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[test-member-uid\]/)
  t.is(consoleArgs[1], testError)
})

test('always log to console when flag is set', t => {
    const sendStub = sinon.stub()
    
    const mockMember = {
      uid() { return 'test-member-uid'},
      isReadyToSend() { return true },
      sendEvent: sendStub
    }
    
    const tool = LogTool.ToolFactory({ currentMember: mockMember })
    
    // Устанавливаем флаг дублирования в консоль
    tool.setAlwaysConsole(true)
    
    const testError = new Error('Test error with alwaysConsole')
    
    tool.sendError(testError)
    
    // Проверяем, что событие отправлено
    t.true(sendStub.calledOnce)
    
    // Проверяем, что ошибка также выведена в консоль
    t.true(t.context.consoleStub.calledOnce)
})

test('handle error with missing properties', t => {
    const mockMember = {
      uid() { return 'test-member-uid'},
      isReadyToSend() { return false }
    }
    
    const tool = LogTool.ToolFactory({ currentMember: mockMember })
    
    // Ошибка без message и stack
    const rawError = {}
    
    tool.sendError(rawError)
    
    // Проверяем форматирование ошибки
    t.true(t.context.consoleStub.calledOnce)
    
    const consoleCall = t.context.consoleStub.firstCall
    t.regex(consoleCall.args[0], /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[test-member-uid\]/)
    
    // Проверяем, что обрабатываются ошибки без стека и сообщения
    const testErrorWithoutStack = new Error('No stack')
    delete testErrorWithoutStack.stack
    
    tool.sendError(testErrorWithoutStack)
  t.true(t.context.consoleStub.calledTwice)
})


test('log subscription events', t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.addTool(LogTool)
  member.makeRoom()
  
  
  const subscriptionCallback = sinon.fake()
  const sendingCallback = sinon.fake()
  const receiveCallback = sinon.fake()
  const memberCallback = sinon.fake()
  
  member.subscribe(loggingSubscriptionEvent, subscriptionCallback)
  
  t.true(subscriptionCallback.calledOnce)
  
  const logPayload = subscriptionCallback.getCall(0).firstArg
  t.truthy(logPayload.timestamp)
  t.is(logPayload.sourceUid, member.uid())
  t.is(logPayload.eventHash, sha1(loggingSubscriptionEvent.toJSON().type))
  t.is(logPayload.action, 'Subscription')


  const event = EventFactory(Types.Object.Def({ system: "test" }))
  member.subscribe(loggingSendingEvent, sendingCallback)
  member.subscribe(loggingReceivingEvent, receiveCallback)
  member.subscribe(event, memberCallback)
  member.send(event)

  t.true(sendingCallback.calledOnce)
  
  const logSending = sendingCallback.getCall(0).firstArg
  t.truthy(logSending.timestamp)
  t.is(logSending.sourceUid, member.uid())
  t.is(logSending.eventHash, sha1(event.toJSON().type))
  t.is(logSending.msgHash, sha1(JSON.stringify(event.createMsg())))
  t.is(logSending.action, 'Sending')


  t.true(receiveCallback.calledOnce)
  t.true(memberCallback.calledOnce)
  
  const logReciving = receiveCallback.getCall(0).firstArg
  t.truthy(logReciving.timestamp)
  t.is(logReciving.sourceUid, member.uid())
  t.is(logReciving.eventHash, sha1(event.toJSON().type))
  t.is(logReciving.msgHash, sha1(JSON.stringify(event.createMsg())))
  t.is(logReciving.action, 'Receiving')


})