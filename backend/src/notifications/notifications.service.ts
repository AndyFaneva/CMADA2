import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(message: string) {
    const notif = this.notificationRepo.create({ message });
    return this.notificationRepo.save(notif);
  }

async getUnreadCount(user_id: number): Promise<number> {
  return this.notificationRepo.count({
    where: { user_id, isRead: false },
  });
}

async markAllAsRead(user_id: number): Promise<void> {
  await this.notificationRepo.update({ user_id, isRead: false }, { isRead: true });
}


async createForUser(user_id: number, message: string): Promise<Notification> {
  const notification = this.notificationRepo.create({
    message,
    user_id,
    isRead: false,
  });
  return this.notificationRepo.save(notification);
}


async markAsRead(id: number) {
  const notification = await this.notificationRepo.findOneBy({ id });
  if (notification) {
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}


  async getAll(): Promise<Notification[]> {
    return this.notificationRepo.find({ order: { createdAt: 'DESC' } });
  }
}
