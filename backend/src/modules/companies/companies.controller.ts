import type { Request, Response, NextFunction } from 'express';
import { getCompanyPrep, getSupportedCompanies } from './companies.service.js';
import { badRequest } from '../../common/errors.js';

export async function getCompanyPrepController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const company = req.query.company;
    if (typeof company !== 'string' || !company) {
      return next(badRequest('Query param "company" is required'));
    }
    const result = await getCompanyPrep(company, req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSupportedCompaniesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({ companies: getSupportedCompanies() });
  } catch (error) {
    next(error);
  }
}
