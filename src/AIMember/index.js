import { MemberFactory } from '../Member/index.js'
import { userMessageEvent, aiResponseEvent } from './events.js'

export class AIMember extends MemberFactory {
  constructor(name = "AIMember") {
    super(name)
    
    this.onJoinRoom = () => {
      console.log(`[AIMember] Присоединился к общей комнате. UID: ${this.uid()}`)
      this.subscribe(userMessageEvent, this.handleUserMessage.bind(this))
    }
  }
  
  handleUserMessage(msg) {
    // Игнорируем свои же сообщения
    if (msg.sourceUid === this.uid()) return
    
    console.log(`[AI] Получено: "${msg.message}" от ${msg.sourceUid}`)
    
    // Простая логика: копируем сообщение обратно
    const response = `Вы сказали: ${msg.message}`
    
    // Отправляем ответ
    this.send(aiResponseEvent, {
      sourceUid: this.uid(),
      message: response,
      timestamp: Date.now().toString()
    })
    
    console.log(`[AI] Отправлено: "${response}"`)
  }
}