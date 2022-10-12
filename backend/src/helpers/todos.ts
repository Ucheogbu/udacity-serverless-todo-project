import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import catchError from '../utils/error';
import { TodoUpdate } from '../models/TodoUpdate';
import { getAttachmentUrl } from './attachmentUtils'
import * as Joi from 'joi'

// TODO: Implement businessLogic

const todoAccess = new TodosAccess();

const logger = createLogger('Todos')

// TODO: Implement businessLogic
export async function getUserTodos(userId: string): Promise<TodoItem[]> {
  try {
    const result = await todoAccess.getAllTodos(userId);
    logger.info(`Items fetched: ${userId}`, JSON.stringify(result))
    return result;
  } catch (error) {
    logger.error(`Error Getting Todo Items: ${error}`)
      throw new catchError(error.message, 500)
  }
}


export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const valid = createTodoSchema.validate(createTodoRequest);
  if (valid.error) {
    logger.error('Error Validating Schema', valid.error)
    throw new catchError(valid.error.message, 400)
  }
  try {
    const todoItem: TodoItem = {
      todoId,
      userId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: null,
      ...createTodoRequest,
    }

    await todoAccess.createTodo(todoItem)
    logger.info('Todo Item Created Successfully', todoItem)
    return todoItem;
  } catch (error) {
    logger.error(`Error Creating Todo Item: ${error}`)
    throw new catchError(error.message, 500)
  }
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string,
): Promise<TodoItem> {

  const valid = updateTodoSchema.validate(updateTodoRequest);
  if (valid.error) {
    logger.error('Error Validating Schema', valid.error)
    throw new catchError(valid.error.message, 400)
  }

  try {

    const item = await todoAccess.updateTodo(updateTodoRequest as TodoUpdate, todoId, userId)

    logger.info('Todo Item Updated successfully', {
      userId,
      todoId,
      updated: updateTodo
    })
    return item
    
  } catch (error) {
    logger.error(`Error Updating Todo Item: ${error}`)
    throw new catchError(error.message, 500)
  }
}

export async function deleteTodo(
  todoId: string,
  userId: string,
) {
  try {

    const item = await todoAccess.deleteTodo(todoId, userId)
    logger.info('Item Deleted Successfully', {
      userId,
      todoId
    })

    return item
  } catch (error) {
    logger.error(`Error Deleting Item: ${error}`)
    throw new catchError(error.message, 500)
  }
}

export async function generateSignedUrl(attachmentId: string): Promise<string> {
  try {
    logger.info('GeneratingSigned URL...')
    const uploadUrl = await getAttachmentUrl(attachmentId)
    logger.info('Signed URL Generated Successfully')

    return uploadUrl
  } catch (error) {
    logger.error(`Error Generating URL: ${error}`)
    throw new catchError(error.message, 500)
  }
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<void> {
  try {

    const attachmentUrl = getAttachmentUrl(attachmentId)
    await todoAccess.updateTodoItemAttachment(userId, todoId, attachmentUrl)

    logger.info(
      'Attachment URL Updated Successfully',{
        userId,
        todoId
      }
    )
    return
  } catch (error) {
    logger.error(`Error Updating Attachment URL: ${error}`)
    throw new catchError(error.message, 500)
  }
}

const createTodoSchema = Joi.object({
  name: Joi.string().required(),
  dueDate: Joi.string().required()
})

const updateTodoSchema = Joi.object({
  name: Joi.string().required(),
  dueDate: Joi.string().required(),
  done: Joi.boolean().required()
})