import { Greeting } from '../entities/Greeting'

export class GreetingRepository {
  async getDefault() {
    // Simulates a database call — replace with real DB logic later
    const data = { id: 1, message: 'Hello from Fishionaire Events!' }
    return Greeting.fromJSON(data)
  }
}
