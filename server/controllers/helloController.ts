import { GreetingRepository } from '../repositories/greetingRepository'

export class HelloController {
  private greetingRepository: GreetingRepository

  constructor() {
    this.greetingRepository = new GreetingRepository()
  }

  async getGreeting(): Promise<Record<string, unknown>> {
    const greeting = await this.greetingRepository.getDefault()
    return greeting.toJSON()
  }
}
