import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { responseInterface } from 'src/utils/interfaces/response';
import { Repository } from 'typeorm';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategories(): Promise<responseInterface> {
    let message = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      let categories = await this.categoryRepository.find({});
      statusCode = STATUS_SUCCESS;
      data = categories;
      message.push('The categories are fetched successfully');
    } catch (err) {
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        statusCode,
        data,
      };
    }
  }
}
