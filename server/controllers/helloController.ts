import { GreetingRepository } from '../repositories/greetingRepository'

export class HelloController {
  constructor() {
    this.greetingRepository = new GreetingRepository()
  }

  async getGreeting() {
    const greeting = await this.greetingRepository.getDefault()
    return greeting.toJSON()
  }
}
