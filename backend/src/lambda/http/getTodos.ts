import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { getUserTodos } from '../../helpers/todos'

const logger = createLogger('getTodos')


// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
      const userId = getUserId(event)
      const todos = await getUserTodos(userId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      };
    } catch (error) {
      logger.error('Error: ', error.message)
      throw new Error(error);
    }
  });

handler.use(
  cors({
    credentials: true
  })
)
