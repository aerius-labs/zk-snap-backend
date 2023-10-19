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
      // TODO - sanitation for account address check
      // this.sanitiseDaoMembers(req.body);
    } else if (req.method === 'PATCH') {
      this.sanitiseDaoName(req.body);
      this.sanitiseDaoDescription(req.body);
      this.sanitiseDaoLogo(req.body);
      // TODO - sanitation for account address check
      // this.sanitiseDaoMembers(req.body);
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

  private isHexString(value: string): boolean {
    const hexRegex = /^[0-9a-fA-F]+$/;
    return hexRegex.test(value);
  }

  private sanitiseDaoMembers(obj: any): void {
    if (!obj.members || !Array.isArray(obj.members)) {
      throw new HttpException(
        'Members should be a non-empty array',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    for (const member of obj.members) {
      if (!this.isHexString(member)) {
        throw new HttpException(
          'Every member should be a hexadecimal string',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
