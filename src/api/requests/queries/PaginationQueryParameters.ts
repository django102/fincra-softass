import { IsInt, IsOptional, Min } from "class-validator";


export default class PaginationQueryParameters {
    @IsOptional()
    @IsInt()
    @Min(1)
        page: number = 1;

    @IsOptional()
    @IsInt()
        pageSize: number = 50;
}