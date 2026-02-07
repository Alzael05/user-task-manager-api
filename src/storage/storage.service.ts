import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('s3.endpoint'),
      region: this.configService.get<string>('s3.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('s3.accessKey'),
        secretAccessKey: this.configService.getOrThrow<string>('s3.secretKey'),
      },
      forcePathStyle: true, // Required for LocalStack
    });
    this.bucket = this.configService.getOrThrow<string>('s3.bucket');
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.log(`Creating bucket: ${this.bucket}`);
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
      }
    }
  }

  async uploadFile(
    file: Buffer,
    originalName: string,
    contentType: string,
  ): Promise<string> {
    const key = `uploads/${uuidv4()}-${originalName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    this.logger.log(`File uploaded: ${key}`);
    return key;
  }
}
