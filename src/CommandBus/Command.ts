/**
 * Representa un comando dentro del sistema.  
 *  
 * @template TPayload - Tipo del payload del comando.
 * @template {string} TType - Tipo del comando (string literal).
 */
export class Command<TPayload, TType extends string> {
  /**
   * Tipo del comando.
   * @type {TType}
   * @readonly
   */
  readonly type: TType
  /**
   * Datos adjuntos del comando.
   * @type {TPayload}
   * @readonly
   */
  readonly payload: TPayload
  /**
   * Crea un nuevo comando.
   * 
   * @param {TType} type - Tipo del comando.
   * @param {TPayload} payload - Datos del comando.
   */
  constructor(type: TType, payload: TPayload) {
    this.type = type
    this.payload = payload
  }
}
