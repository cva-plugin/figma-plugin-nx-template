// doubleMaker is a function that takes an Object
// and returns a proxy that tracks all property access
// and function calls made to the target object and its children
// so that later the proxy can be used to generate an Object
// containing only the accessed properties and functions that

import logger from './logger';

// were accessed
type ProxyHandlerWithAccessed = ProxyHandler<object> & { accessed: Record<string, any> };
type Watched<TTarget> = TTarget & { accessed: Record<string, any> };

export function doubléMaker<TTarget extends object>(target: TTarget): Watched<TTarget> {
  function createAccessedProxy<TTarget extends object>(
    target: TTarget,
    path: string[] = []
  ): Watched<TTarget> {
    const handler: ProxyHandlerWithAccessed = {
      accessed: {},
      get(target, prop, receiver) {
        logger.generation(`Accessing ${String(prop)} on ${path.join('.')}`);

        if (prop === 'accessed') {
          return handler.accessed;
        }

        const value = Reflect.get(target, prop, receiver);
        const currentPath = [...path, prop as string];

        if (typeof value === 'object' && value !== null) {
          handler.accessed[prop as string] = createAccessedProxy(value, currentPath);
        } else {
          handler.accessed[prop as string] = value;
        }

        return value;
      },
    };

    return new Proxy(target, handler) as Watched<TTarget>;
  }

  const proxy = createAccessedProxy(target);
  return proxy;
}

// function doubleMaker2(target: object) {
//   const accessedProperties = new Set<string>();
//   const accessedFunctions = new Set<string>();

//   const handler: ProxyHandler<any> = {
//     get(target, prop, receiver) {
//       if (typeof target[prop] === 'function') {
//         accessedFunctions.add(prop.toString());
//       } else {
//         accessedProperties.add(prop.toString());
//       }
//       return Reflect.get(target, prop, receiver);
//     }
//   };

//   return new Proxy(target, handler);
// }
