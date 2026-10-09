import { registerHooks } from 'node:module';
import { extname } from 'node:path';

// Nuxt resolves extensionless TS imports; mirror that for Node's native TS tests.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  }
});
