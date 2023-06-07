import { IsNumber,IsOptional,IsString } from "class-validator";

export class CreateServiceDto{
    @IsString()
    name:string;

    @IsString()
    type:string;

    @IsNumber()
    sortOrder:number;

    @IsOptional()
    @IsString()
    role:string;
}