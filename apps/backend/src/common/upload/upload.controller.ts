import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(), // Use memory storage for both Cloudinary and local
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME !== undefined && 
                          process.env.CLOUDINARY_CLOUD_NAME !== ''

    let fileUrl: string
    let filename: string

    if (useCloudinary) {
      try {
        fileUrl = await this.uploadService.uploadToCloudinary(file)
        filename = fileUrl.split('/').pop() || file.originalname
      } catch (error) {
        console.error('Cloudinary upload failed:', error)
        throw new BadRequestException('Failed to upload image to cloud storage')
      }
    } else {
      // Fallback to local storage
      const fs = require('fs')
      const path = require('path')
      
      const uploadDir = process.env.UPLOAD_DIR || './uploads'
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname)
      filename = `file-${uniqueSuffix}${ext}`
      const filePath = path.join(uploadDir, filename)

      fs.writeFileSync(filePath, file.buffer)
      fileUrl = this.uploadService.getFileUrl(filename)
    }
    
    return {
      success: true,
      data: {
        filename,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        mimetype: file.mimetype
      }
    }
  }
}





