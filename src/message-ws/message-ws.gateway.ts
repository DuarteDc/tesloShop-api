import { Server, Socket } from 'socket.io';

import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';


@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() Wss: Server;

  constructor(private readonly messageWsService: MessageWsService) { }

  handleConnection(client: Socket) {
    this.messageWsService.registerClient( client );
    this.Wss.emit('new-clients', this.messageWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient( client.id );
    this.Wss.emit('new-clients', this.messageWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto) {

  }


}
