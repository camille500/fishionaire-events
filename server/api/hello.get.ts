import { HelloController } from '../controllers/helloController'

const helloController = new HelloController()

export default defineEventHandler(async () => {
  return await helloController.getGreeting()
})
