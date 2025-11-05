import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    const fileUrl = this.uploadService.getFileUrl(file.filename)
    
    return {
      success: true,
      data: {
        filename: file.filename,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        mimetype: file.mimetype
      }
    }
  }
}





