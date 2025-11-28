import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as multer from 'multer'
import * as path from 'path'
import * as fs from 'fs'

// Cloudinary will be imported conditionally
let v2: any = null
try {
  const cloudinary = require('cloudinary')
  v2 = cloudinary.v2
} catch (e) {
  // Cloudinary not installed, will use local storage
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string
  private readonly useCloudinary: boolean
  private cloudinaryConfigured: boolean = false

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads')
    this.useCloudinary = this.configService.get('CLOUDINARY_CLOUD_NAME', '') !== ''
    
    if (this.useCloudinary && v2) {
      this.configureCloudinary()
    } else {
      this.ensureUploadDirExists()
    }
  }

  private configureCloudinary() {
    if (this.cloudinaryConfigured || !v2) return
    
    v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    })
    this.cloudinaryConfigured = true
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

  async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    if (!this.useCloudinary || !v2) {
      throw new Error('Cloudinary is not configured')
    }

    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder: 'maslim360/products',
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.secure_url)
          }
        }
      )

      // Convert buffer to stream
      const stream = require('stream')
      const bufferStream = new stream.PassThrough()
      bufferStream.end(file.buffer)
      bufferStream.pipe(uploadStream)
    })
  }

  getFileUrl(filename: string): string {
    if (this.useCloudinary) {
      // If using Cloudinary, filename is actually the URL
      return filename
    }
    const baseUrl = this.configService.get('API_URL', 'http://localhost:4000')
    return `${baseUrl}/uploads/${filename}`
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      if (this.useCloudinary && v2) {
        // Extract public_id from Cloudinary URL
        const urlParts = filename.split('/')
        const publicId = urlParts.slice(-2).join('/').replace(/\.[^/.]+$/, '')
        await v2.uploader.destroy(`maslim360/products/${publicId}`)
        return true
      } else {
        const filePath = path.join(this.uploadDir, filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          return true
        }
        return false
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
}









