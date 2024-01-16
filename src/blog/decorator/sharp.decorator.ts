import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
@Injectable()
// use sharp for reduce quality of image and saved in server
export class SharpPipeCover
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    // check image not send with data
    if (!image) {
      throw new BadRequestException('image required');
    }
    // get name of image and update on it
    const originalName = path.parse(image.originalname).name;
    const filename = uuid() + '-' + originalName + '.jpeg';
    // reduce image size and quality and standare extention jpeg
    await sharp(image.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(path.join('uploads/headerImages', filename));
    // return new name of image
    return filename;
  }
}
