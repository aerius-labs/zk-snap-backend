import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProposalMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      this.sanitiseProposalId(req.body);
      this.sanitiseProposalTitle(req.body);
      this.sanitiseProposalDescription(req.body);
      this.sanitiseProposalTime(req.body);
      this.sanitiseRequestBody(req.body);
      //TODO - Add other sanitation methods for POST if needed
    } else if (req.method === 'PATCH') {
      this.sanitiseProposalTitle(req.body);
      this.sanitiseProposalDescription(req.body);
      this.sanitiseProposalTime(req.body);
      this.sanitiseRequestBody(req.body);
      //TOTO - Add other sanitation methods for PATCH if needed
    }
    next();
  }

  private sanitiseProposalId(obj: any): void {
    obj.id = uuidv4();
  }

  // TODO - this is for demo remove this after that
  private sanitiseRequestBody(obj: any): void {
    obj.voting_options = ['Yes', 'No'];
    obj.status = 'NOT_STARTED';
    obj.result = [0, 0];
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

  private sanitiseProposalTime(obj: any): void {
    // TODO- handle the error if the these are not date
    obj.start_time = new Date(obj.start_time);
    obj.end_time = new Date(obj.end_time);
    if (obj.start_time instanceof Date && obj.end_time instanceof Date) {
      const currentMillis = Date.now();
      const startTimeMillis = new Date(obj.start_time).getTime();
      const endTimeMillis = new Date(obj.end_time).getTime();

      if (startTimeMillis > endTimeMillis) {
        throw new HttpException(
          'end_time should be greater than the start_time',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (startTimeMillis <= currentMillis || endTimeMillis <= currentMillis) {
        throw new HttpException(
          'start_time and end_time should be greater than the current date and time',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        'start_time and end_time should be valid date objects',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
