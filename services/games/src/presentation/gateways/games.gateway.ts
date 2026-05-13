import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoundEngineService } from '../../application/services/round-engine.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GamesGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GamesGateway.name);

  constructor(private readonly roundEngineService: RoundEngineService) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.roundEngineService.setWebSocketServer(server);
    this.roundEngineService.startEngine();
  }
}
