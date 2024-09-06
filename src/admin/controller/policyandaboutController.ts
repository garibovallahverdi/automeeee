import { NextFunction, Request, Response } from 'express';
import prisma from '../../config/db';

// Hakkımızda bilgilerini getir
export const getAbout = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const about = await prisma.about.findFirst();
    res.json(about);
  } catch (error) {
    next(error)    
}
};

// Hakkımızda bilgilerini güncelle
export const updateAbout = async (req: Request, res: Response,next:NextFunction) => {
  const { title, content } = req.body;

  try {
    const updatedAbout = await prisma.about.update({
      where: { id: 1 }, // İlk kaydı güncelle
      data: { title, content },
    });
    res.json(updatedAbout);
  } catch (error) {
    next(error)    
}
};


export const getPolicies = async (req: Request, res: Response,next:NextFunction)=>{
    try {
      const policies = await prisma.policy.findMany();
      res.json(policies);
    } catch (error) {
next(error)    
}
  };
  
  // Belirli bir politikayı getir
  export const getPolicyById = async (req: Request, res: Response,next:NextFunction)=> {
    const { id } = req.params;
  
    try {
      const policy = await prisma.policy.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!policy) {
        throw new Error("Policy can not found")
        return;
      }
  
      res.json(policy);
    } catch (error) {
        next(error)
    }
  };
  
  // Bir politikayı güncelle
  export const updatePolicy = async (req: Request, res: Response,next:NextFunction) => {
    const { id } = req.params;
    const { title, content, category } = req.body;
  
    try {
      const updatedPolicy = await prisma.policy.update({
        where: { id: parseInt(id) },
        data: { title, content, category },
      });
  
      res.json(updatedPolicy);
    } catch (error) {
  next(error)
    }
  };