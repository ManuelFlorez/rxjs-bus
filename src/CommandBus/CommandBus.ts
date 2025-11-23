import { Subject, from, EMPTY,Subscription } from "rxjs"
import { filter, mergeMap, catchError } from "rxjs/operators"
import type { Command } from "./Command.js"
import type { CommandHandler } from "./CommandHandler.js"

type PayloadOf<Registry, K extends keyof Registry & string> = Registry[K];

export class CommandBus<Registry extends Record<string, any>> {
  private readonly command$ = new Subject<Command<any, keyof Registry & string>>()
  private readonly handlers = new Map<string, CommandHandler<any, string>>()
  private readonly subscriptions = new Map<string, Subscription>()

  register<K extends keyof Registry & string>(
    commandType: K,
    handler: CommandHandler<PayloadOf<Registry, K>, K>
  ): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler for ${commandType} already exists`)
    }

    this.handlers.set(commandType, handler)

    const sub = this.createHandlerSubscription(commandType, handler);
    this.subscriptions.set(commandType, sub);
  }

  unregister<K extends keyof Registry & string>(commandType: K): void {
    if (!this.handlers.has(commandType)) {
      return
    }

    const sub = this.subscriptions.get(commandType)
    if (sub) {
      sub.unsubscribe()
      this.subscriptions.delete(commandType)
    }

    this.handlers.delete(commandType);
  }

  emit<K extends keyof Registry & string>(command: Command<PayloadOf<Registry, K>, K>): void {
    this.command$.next(command);
  }

  private createHandlerSubscription<K extends keyof Registry & string>(
    commandType: K,
    handler: CommandHandler<PayloadOf<Registry, K>, K>
  ): Subscription {
    return this.command$
      .pipe(
        filter((cmd): cmd is Command<PayloadOf<Registry, K>, K> => cmd.type === commandType),
        mergeMap((cmd) => from(handler.execute(cmd)).pipe(catchError(() => EMPTY)))
      )
      .subscribe();
  }

  clear() {
    for (const [key, sub] of this.subscriptions) {
      sub.unsubscribe();
      this.handlers.delete(key);
    }
    this.subscriptions.clear();
  }
}
