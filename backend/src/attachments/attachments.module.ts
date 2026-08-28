import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = './uploads';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!existsSync(UPLOAD_DIR)) {
            mkdirSync(UPLOAD_DIR);
          }
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
