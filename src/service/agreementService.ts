import { PrismaClient, AgreementStatus } from '@prisma/client';
import prisma from '../config/db';

class AgreementService {
  async getUserAgreements(userId: string, status?: AgreementStatus) {
    const whereCondition: any = {
      OR: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    };
    
    if (status) {
      whereCondition.status = status;
    }

    return await prisma.agreement.findMany({
      where: whereCondition,
      include: {
        auction: true,
        buyer: true,
        seller: true,
        bid: true,
      },
    });
  }

  async getAgreementById(id: string) {
    return await prisma.agreement.findUnique({
      where: { id },
      include: {
        auction: true,
        buyer: true,
        seller: true,
        bid: true,
      },
    });
  }

  async updateAgreementStatus(id: string, status: AgreementStatus) {
    return await prisma.agreement.update({
      where: { id },
      data: { status },
    });
  }

  async confirmAgreementByBuyer(id: string) {
    return await prisma.agreement.update({
      where: { id },
      data: { buyerConfirmed: true },
    });
  }

  async confirmAgreementBySeller(id: string) {
    return await prisma.agreement.update({
      where: { id },
      data: { sellerConfirmed: true },
    });
  }

  async cancelAgreement(id: string) {
    return await prisma.agreement.update({
      where: { id },
      data: { status: AgreementStatus.canceled },
    });
  }
}

export default  AgreementService;
