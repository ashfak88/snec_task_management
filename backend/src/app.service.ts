import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'success',
      message: 'SNEC Task & Project Management System API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
