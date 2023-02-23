import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [
    MulterModule.register({
      limits: { fileSize: parseInt(process.env.MAX_IMAGE_SIZE) },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          req.body.profilePhoto = '';
          req.body.uploadMessage = 'Unsupported image format';
          req.body.uploadStatusCode = STATUS_FAILED;
          callback(null, false);
        } else callback(null, true);
      },
      storage: diskStorage({
        destination: './client/uploads/customer/',
        filename: (req, file, callback) => {
          const { originalname } = file;
          const filename = `${uuidv4()}${originalname.slice(
            originalname.lastIndexOf('.'),
          )}`;
          req.body.profilePhoto = filename;
          req.body.uploadMessage = 'The lisence image is uploaded successfully';
          req.body.uploadStatusCode = STATUS_SUCCESS;
          callback(null, filename);
        },
      }),
    }),
    TypeOrmModule.forFeature([Customer]),
  ],
})
export class CustomerModule {}
