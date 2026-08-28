import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    file: Express.Multer.File,
    uploadDto: UploadAttachmentDto,
    userId: string,
  ) {

    const fileUrl = `/uploads/${file.filename}`;

    return this.prisma.attachment.create({
      data: {
        entityType: uploadDto.entityType,
        entityId: uploadDto.entityId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedById: userId,
      },
    });
  }

  async findAllByEntity(entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}
