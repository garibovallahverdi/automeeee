import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { LotStatus, ParticipantStatus } from '@prisma/client';


interface UpdateUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
}

class UserService {
    

  async getUserOwnAuctions(userId: string, status?: string) {
    const whereCondition: any = { ownerId: userId };

    if (status && status !== 'all') {
        whereCondition.status = status as LotStatus; 
    }

    const auctions = await prisma.auction.findMany({
        where: whereCondition,
        include: {
            owner: true,
        },
    });

    return auctions;
}
      async getUserParticipants(userId: string, status?: string) {
        let statusFilter: ParticipantStatus[] | undefined;
    
        if (status) {
          if (status === 'both') {
            statusFilter = [ParticipantStatus.participant, ParticipantStatus.winner];
          } else {
            statusFilter = [status as ParticipantStatus];
          }
        }
    
        const participations = await prisma.participant.findMany({
          where: { 
            userId,
            status: statusFilter ? { in: statusFilter } : undefined, 
          },
          include: {
            auctions: true, 
          },
        });
    
        return participations;
      }


  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user =  await prisma.user.findUnique({where:{id:userId}});
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Incorrect old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }


  async updateUserInfo(data: UpdateUserData) {
    const { id, firstName, lastName, email, location } = data;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        location,
      },
    });

    return updatedUser;
  }


 
}

export default UserService;
