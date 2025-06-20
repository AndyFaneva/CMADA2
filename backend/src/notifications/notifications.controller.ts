import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Patch(':id/read')
markAsRead(@Param('id') id: number) {
  return this.service.markAsRead(id);
}
}

