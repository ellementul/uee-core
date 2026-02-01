import test from 'ava'
import sinon from 'sinon'
import { loggingErrorEvent, loggingErrorType, Tool } from './logging.js'
import { EventFactory, Types } from '../Event/index.js'
import { MemberFactory } from '../Member/index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test.beforeEach(t => {
  t.context.consoleStub = sinon.stub(console, 'error')
})

test.afterEach(t => {
  t.context.consoleStub.restore()
})

test('tool_initialization', t => {
    const mockMember = {
        uuid: 'test-member-uuid',
        get isReadyToSend() { return true }
    }
  
    const tool = Tool.ToolFactory({ currentMember: mockMember })
  
    t.truthy(loggingErrorType)
    t.is(typeof tool.sendError, 'function')
    t.is(typeof tool.setAlwaysConsole, 'function')
})

test('add tool in member', t => {
    const member = new MemberFactory
    member.debug = true

    member.addTool(Tool)
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
    uuid: 'test-member-uuid',
    get isReadyToSend() { return false }
  }
  
  const tool = Tool.ToolFactory({ currentMember: mockMember })
  
  const testError = new Error('Test error not ready')
  
  tool.sendError(testError)
  
  t.true(t.context.consoleStub.calledOnce)
  
  const consoleArgs = t.context.consoleStub.firstCall.args
  t.regex(consoleArgs[0], /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[test-member-uuid\]/)
  t.is(consoleArgs[1], testError)
})

test('always log to console when flag is set', t => {
    const sendStub = sinon.stub()
    
    const mockMember = {
      uuid: 'test-member-uuid',
      get isReadyToSend() { return true },
      send: sendStub
    }
    
    const tool = Tool.ToolFactory({ currentMember: mockMember })
    
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
      uuid: 'test-member-uuid',
      get isReadyToSend() { return false }
    }
    
    const tool = Tool.ToolFactory({ currentMember: mockMember })
    
    // Ошибка без message и stack
    const rawError = {}
    
    tool.sendError(rawError)
    
    // Проверяем форматирование ошибки
    t.true(t.context.consoleStub.calledOnce)
    
    const consoleCall = t.context.consoleStub.firstCall
    t.regex(consoleCall.args[0], /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[test-member-uuid\]/)
    
    // Проверяем, что обрабатываются ошибки без стека и сообщения
    const testErrorWithoutStack = new Error('No stack')
    delete testErrorWithoutStack.stack
    
    tool.sendError(testErrorWithoutStack)
  t.true(t.context.consoleStub.calledTwice)
})