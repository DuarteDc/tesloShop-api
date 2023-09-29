import { Server, Socket } from 'socket.io';

import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';

import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(private readonly messageWsService: MessageWsService, private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authentication as string;
    let payload: JWTPayload;

    try {
      payload = this.jwtService.verify( token );
      await this.messageWsService.registerClient( client, payload.id );
    } catch (error) { 
      return client.disconnect()
    }

    this.wss.emit('new-clients', this.messageWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient( client.id );
    this.wss.emit('new-clients', this.messageWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto) {
    this.wss.emit('message-from-server', {
      id: this.messageWsService.getUserName(client.id),
      message: payload.message
    })
  }


}
