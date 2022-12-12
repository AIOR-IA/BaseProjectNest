import { NotFoundException } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/DTOs/pagination.dto';
import { isUUID } from 'class-validator';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';

@Injectable()
export class ProductsService {
  /// Injection de dependencias para repository 
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}
  async create(createProductDto: CreateProductDto) {
    try {
      if( !createProductDto.slug ) {
        createProductDto.slug = createProductDto.title
          .toLowerCase()
          .replaceAll(' ','_')
          .replaceAll("'",'')
      }

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const{ limit = 10, offset = 0} = paginationDto
    return await this.productRepository.find({
      take: limit,
      skip: offset
    }); 
  }

  async findOne(term: string) {

    let product : Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id:term});
    }else{
      // product = await this.productRepository.findOneBy({slug: term});
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
            .where('UPPER(title) =:title or slug =:slug',
              {
                title: term.toUpperCase(),
                slug: term.toLowerCase()
              }
            ).getOne();
    }
    // const product = await this.productRepository.findOneBy({id});
    if(!product)
      throw new NotFoundException(`Product with id ${ term } not exist`); 
    return product;  
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    
    if( !product ) throw new NotFoundException(`Product with id: ${ id } not found`)
    try {
      

      return await this.productRepository.save(product);

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const producto = await this.productRepository.findOneBy({id}); 
    return this.productRepository.remove(producto);
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Check Server Logs');
    
  }
}
