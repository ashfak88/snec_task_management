import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: any) {
    return this.commentsService.create(createCommentDto, user.id);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all comments for a task' })
  findAllByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findAllByTask(taskId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.update(id, updateCommentDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commentsService.remove(id, user.id);
  }
}
