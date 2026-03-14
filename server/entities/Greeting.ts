export interface GreetingData {
  id: string | number
  message: string
}

export class Greeting {
  id: string | number
  message: string

  constructor({ id, message }: GreetingData) {
    this.id = id
    this.message = message
  }

  static fromJSON(data: GreetingData): Greeting {
    return new Greeting({
      id: data.id,
      message: data.message,
    })
  }

  toJSON(): GreetingData {
    return {
      id: this.id,
      message: this.message,
    }
  }
}
