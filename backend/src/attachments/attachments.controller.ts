import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an attachment' })
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), 
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|pdf|doc|docx|txt)',
          }), 
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDto: UploadAttachmentDto,
    @CurrentUser() user: any,
  ) {
    return this.attachmentsService.create(file, uploadDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attachments for an entity' })
  findAllByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.attachmentsService.findAllByEntity(entityType, entityId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attachment' })
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
