import { ApiProperty } from '@nestjs/swagger';

export class BulkUploadErrorDto {
  @ApiProperty()
  row!: number;

  @ApiProperty()
  errors!: string[];
}

export class BulkUploadResponseDto {
  @ApiProperty()
  totalRows!: number;

  @ApiProperty()
  successCount!: number;

  @ApiProperty()
  failureCount!: number;

  @ApiProperty({ type: [BulkUploadErrorDto] })
  errors!: BulkUploadErrorDto[];

  @ApiProperty()
  fileKey!: string;
}
