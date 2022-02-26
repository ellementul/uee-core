import Http from 'http'
import { Server } from "socket.io"
export default new Server(Http.createServer())