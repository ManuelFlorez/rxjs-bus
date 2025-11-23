import type { Command } from "./Command.js"

export interface CommandHandler<TPayload, TType extends string> {
  type: TType
  execute(command: Command<TPayload, TType>): Promise<void>
}
