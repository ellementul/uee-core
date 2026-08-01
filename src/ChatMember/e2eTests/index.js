import { AIMember } from '../../AIMember/index.js'
import { EventFactory, Types } from '../../Event/index.js'
import { MemberFactory } from '../../Member/index.js'
import { loggingReceivingEvent } from '../../Tools/logging/events.js'
import { LogTool } from '../../Tools/logging/tool.js'
import { ChatMember } from '../index.js'

console.log('--- Инициализация системы ---')

// 1. Создаем "Хост" — это будет наша общая комната (Room)
const host = new MemberFactory("HostRoom")
host.makeRoom()
console.log(`[Host] Комната создана. UID: ${host.uid()}`)

// 2. Создаем Пользовательский чат (читает stdin, пишет в stdout)
const userChat = new ChatMember("UserChat")
console.log(`[UserChat] Запущен. UID: ${userChat.uid()}`)

// 3. Создаем AI (пока работает как эхо-бот)
const aiChat = new AIMember("AIMember")
console.log(`[AIMember] Запучен. UID: ${aiChat.uid()}`)

// 4. ПОМЕЩАЕМ ОБОИХ В ОДНУ ОБЩУЮ КОМНАТУ
// Это автоматически настроит всплытие событий (bubbling) между ними

aiChat.strictValidationEvent = true
userChat.strictValidationEvent = true

host.addMember(aiChat)
host.addMember(userChat)


console.log('\n=== Система готова к работе ===')
console.log('Введите сообщение в консоль и нажмите Enter.')
console.log('AIMember должен ответить вам.')
console.log('(Ctrl+C для выхода)\n')