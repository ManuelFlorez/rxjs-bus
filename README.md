# RxJS Command Bus

Un **Command Bus** ligero basado en **RxJS** y TypeScript, para manejar comandos de manera tipada, asíncrona y desacoplada en aplicaciones frontend o backend.

Este bus permite:

- Registrar handlers para tipos de comando específicos.
- Emitir comandos de manera segura y tipada.
- Soportar handlers síncronos o asíncronos (promesas u observables).
- Limpiar suscripciones y desregistrar handlers dinámicamente.

Ideal para arquitecturas **CQRS**, patrones de comando/acción y sistemas basados en eventos.

---

## Instalación

```bash
npm install rxjs-bus
# o con Yarn
yarn add rxjs-bus
```

## Uso basico

1. Definir un **Registry** de comandos
El **Registry** define todos los tipos de comandos y los payloads esperados:

```typescript
import { CommandBus } from 'rxjs-bus'

interface AppCommands {
  CREATE_USER: { name: string; email: string }
  DELETE_USER: { userId: string }
}

const bus = new CommandBus<AppCommands>()
```

1. Definir un handler de comando
Un handler debe implementar la interfaz **CommandHandler** y definir un método **execute**:

```typescript
const createUserHandler = {
  execute: async (command: { type: "CREATE_USER"; payload: { name: string; email: string } }) => {
    console.log(`Creando usuario ${command.payload.name}`)
    // lógica de creación...
  }
}
```

1. Registrar un handler

```typescript
bus.register("CREATE_USER", createUserHandler)
```

Si intentas registrar otro handler para el mismo tipo, se lanzará un error:

```typescript
bus.register("CREATE_USER", createUserHandler) // ❌ Error
```

1. Emitir un comando

```typescript
bus.emit({ type: "CREATE_USER", payload: { name: "Manuel", email: "manuel@example.com" } })
```

El handler registrado para CREATE_USER recibirá el comando y se ejecutará.

## Manejo de errores

Actualmente los errores en handlers se silencian para que no rompan el flujo:

```typescript
mergeMap((cmd) => from(handler.execute(cmd)).pipe(catchError(() => EMPTY)))
```

Se recomienda loguear errores dentro del handler o extender el bus para manejar errores globalmente.

## Desregistrar handlers y limpiar el bus

- Desregistrar un handler específico:

```typescript
bus.unregister("CREATE_USER")
```

- Limpiar todos los handlers y suscripciones:

```typescript
bus.clear()
```

## Buenas prácticas

1. Mantén un handler por comando para evitar conflictos.
2. Usa payloads tipados para aprovechar la seguridad de TypeScript.

Ejemplo completo

```typescript
interface AppCommands {
  CREATE_USER: { name: string; email: string };
  DELETE_USER: { userId: string };
}

const bus = new CommandBus<AppCommands>();

bus.register("CREATE_USER", {
  execute: async (cmd) => console.log(`Usuario creado: ${cmd.payload.name}`)
});

bus.register("DELETE_USER", {
  execute: async (cmd) => console.log(`Usuario eliminado: ${cmd.payload.userId}`)
});

bus.emit({ type: "CREATE_USER", payload: { name: "Ana", email: "ana@example.com" } });
bus.emit({ type: "DELETE_USER", payload: { userId: "123" } });

// Limpiar al final
bus.clear();
```

## Contribuir

Se aceptan pull requests para:

- Mejorar documentación y ejemplos.
- Soporte avanzado de errores y concurrencia.
- Integración con librerías de testing y CI.
