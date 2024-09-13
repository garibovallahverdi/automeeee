import prisma from "../config/db";

export class NotificationService {
  async getNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Toplam bildirim sayısını alıyoruz
    const totalNotifications = await prisma.notification.count({
      where: { userId }
    });

    return {
      notifications,
      totalNotifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit)
    };
  }

  async markNotificationAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }
}
