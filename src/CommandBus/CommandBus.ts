import { Subject, from, EMPTY } from "rxjs"
import { filter, mergeMap, catchError } from "rxjs/operators"
import type { Command } from "./Command.js"
import type { CommandHandler } from "./CommandHandler.js"

export class CommandBus<Registry extends Record<string, any>> {
  private readonly command$ = new Subject<
    Command<Registry[keyof Registry & string], keyof Registry & string>
  >()

  private readonly handlers = new Map<
    keyof Registry & string,
    CommandHandler<Registry[keyof Registry & string], keyof Registry & string>
  >()

  register<K extends keyof Registry & string>(
    commandType: K,
    handler: CommandHandler<Registry[K], K>
  ) {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler for ${String(commandType)} already exists`)
    }

    this.handlers.set(commandType, handler)

    this.command$
      .pipe(
        filter(
          (cmd): cmd is Command<Registry[K], K> =>
            cmd.type === commandType
        ),
        mergeMap(cmd =>
          from(handler.execute(cmd)).pipe(catchError(() => EMPTY))
        )
      )
      .subscribe()
  }

  emit<K extends keyof Registry & string>(command: Command<Registry[K], K>) {
    this.command$.next(command)
  }
}
