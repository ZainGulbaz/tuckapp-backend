import { IsString,IsNumber, IsOptional } from "class-validator";

export class SortOrderDto{
    @IsNumber()
    toBeReplacedId:number;

    @IsNumber()
    toBeReplacedSortOrder:number;

    @IsOptional()
    @IsString()
    role:string;
}