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
export class DaoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      this.sanitiseDaoId(req.body);
      this.sanitiseDaoName(req.body);
      this.sanitiseDaoDescription(req.body);
      this.sanitiseDaoLogo(req.body);
      this.sanitiseDaoMembersRoot(req.body);
    } else if (req.method === 'PATCH') {
      this.sanitiseDaoName(req.body);
      this.sanitiseDaoDescription(req.body);
      this.sanitiseDaoLogo(req.body);
      this.sanitiseDaoMembersRoot(req.body);
    }
    next();
  }

  private sanitiseDaoId(obj: any): void {
    obj.id = uuidv4();
  }

  private sanitiseDaoName(obj: any): void {
    if (!obj.name || obj.name.length > 50) {
      throw new HttpException(
        'Name should not be empty and not greater than 50 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private sanitiseDaoDescription(obj: any): void {
    if (!obj.description || obj.description.length > 200) {
      throw new HttpException(
        'Description should not be empty and not greater than 200 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private sanitiseDaoLogo(obj: any): void {
    obj.logo = obj.logo || constants.DEFAULT_DAO_IMAGE;
  }

  private sanitiseDaoMembersRoot(obj: any): void {
    if (!obj.membersRoot || !isKeccakHash(obj.membersRoot)) {
      throw new HttpException(
        'Members root should not be empty and should be a valid keccak256 hash',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
