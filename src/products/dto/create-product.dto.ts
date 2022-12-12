import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength, IsIn } from "class-validator";


export class CreateProductDto {

    @IsString()
    @MinLength(3)
    title: string;

    @IsNumber()
    @IsOptional()
    @IsPositive()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({each:true })
    @IsArray()
    sizes: string[];

    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @IsArray()
    @IsString({each:true})
    @IsOptional()
    tags:string[]
}
