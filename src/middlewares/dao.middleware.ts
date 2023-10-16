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
import { NewDaoDto } from 'src/dtos/dao.dto';

@Injectable()
export class DaoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      this.sanitiseNewDao(req.body);
    }
    next();
  }

  private sanitiseNewDao(obj: NewDaoDto): void {
    obj.id = uuidv4();

    if (!obj.name || obj.name.length > 50) {
      throw new HttpException(
        'Name should not be empty and not greater than 50 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!obj.description || obj.description.length > 200) {
      throw new HttpException(
        'Description should not be empty and not greater than 200 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    obj.logo = obj.logo || constants.DEFAULT_DAO_IMAGE;

    if (!obj.membersRoot || !isKeccakHash(obj.membersRoot)) {
      throw new HttpException(
        'Members root should not be empty and should be a valid keccak256 hash',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
