import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<number, Socket>(); // user_id → socket

  constructor(private notifService: NotificationsService) {}

  afterInit() {
    console.log('✅ NotificationsGateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.user_id);

    if (userId) {
      console.log(`👤 Utilisateur connecté via WebSocket : user_id=${userId}`);
      this.clients.set(userId, client);
    } else {
      console.warn('❌ Aucune query user_id fournie à la connexion WebSocket');
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.clients.entries()) {
      if (socket.id === client.id) {
        this.clients.delete(userId);
        console.log(`👋 Déconnexion du user_id=${userId}`);
        break;
      }
    }
  }

  /**
   * Envoie une notification ciblée à un utilisateur
   */
  async sendNotificationToUser(userId: number, message: string) {
    const notif = await this.notifService.createForUser(userId, message);
    const socket = this.clients.get(userId);

    if (socket) {
      socket.emit('notification:new', notif);
    }

    const unreadCount = await this.notifService.getUnreadCount(userId);
    if (socket) {
      socket.emit('notification:count', unreadCount);
    }
  }

  /**
   * Requête côté client pour obtenir le nombre de notifications non lues
   */
  @SubscribeMessage('notification:get-unread-count')
  async handleGetUnread(@ConnectedSocket() client: Socket) {
    const userId = Number(client.handshake.query.user_id);
    const count = await this.notifService.getUnreadCount(userId);
    client.emit('notification:count', count);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  @SubscribeMessage('notification:mark-as-read')
  async handleMarkAsRead(@ConnectedSocket() client: Socket) {
    const userId = Number(client.handshake.query.user_id);
    await this.notifService.markAllAsRead(userId);
    const count = await this.notifService.getUnreadCount(userId);
    client.emit('notification:count', count);
  }
}
