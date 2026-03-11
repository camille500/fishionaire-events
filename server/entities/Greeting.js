export class Greeting {
  constructor({ id, message }) {
    this.id = id
    this.message = message
  }

  static fromJSON(data) {
    return new Greeting({
      id: data.id,
      message: data.message,
    })
  }

  toJSON() {
    return {
      id: this.id,
      message: this.message,
    }
  }
}
