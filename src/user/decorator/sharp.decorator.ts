import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    if (!image) {
      throw new BadRequestException('image not found');
    }
    const originalName = path.parse(image.originalname).name;
    const filename = uuid() + '-' + originalName + '.jpeg';

    await sharp(image.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(path.join('uploads/profileimages', filename));

    return filename;
  }
}
