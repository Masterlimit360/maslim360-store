import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as multer from 'multer'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class UploadService {
  private readonly uploadDir: string

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads')
    this.ensureUploadDirExists()
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir)
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
      }
    })

    const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new BadRequestException('Invalid file type. Only images are allowed.'), false)
      }
    }

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024) // 10MB default
      }
    })
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`
  }

  deleteFile(filename: string): boolean {
    try {
      const filePath = path.join(this.uploadDir, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
}





