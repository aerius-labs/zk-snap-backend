import {
    Injectable,
    NestMiddleware,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { NextFunction, Request, Response } from 'express';
  import { v4 as uuidv4 } from 'uuid';
  import { constants } from 'src/constants';
  import { isKeccakHash } from 'src/utils';
  
  @Injectable()
  export class ProposalMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
      if (req.method === 'POST') {
        this.sanitiseProposalId(req.body);
        this.sanitiseProposalTitle(req.body);
        this.sanitiseProposalDescription(req.body);
        // Add other sanitation methods for POST if needed
      } else if (req.method === 'PATCH') {
        this.sanitiseProposalTitle(req.body);
        this.sanitiseProposalDescription(req.body);
        // Add other sanitation methods for PATCH if needed
      }
      next();
    }
  
    private sanitiseProposalId(obj: any): void {
      obj.id = uuidv4();
    }
  
    private sanitiseProposalTitle(obj: any): void {
      if (!obj.title || obj.title.length > 100) {
        throw new HttpException(
          'Title should not be empty and not greater than 100 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    private sanitiseProposalDescription(obj: any): void {
      if (!obj.description || obj.description.length > 500) {
        throw new HttpException(
          'Description should not be empty and not greater than 500 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    // Add other sanitation methods for remaining Proposal attributes as needed.
  }
  