import { CannotFindPropertiesHostException } from '@code/errors';
import logger from '@shared/logger';
import type {
  FigmaNode,
  GenericPropertyDefinition,
  IPropertyDefinition,
} from '@cva/shared';

/**
 * Finds all property definitions for a given Figma node (component, component set, or instance)
 * and returns a map of property names to their corresponding property definitions.
 *
 * @param {FigmaNode} comp - The FigmaNode to retrieve properties from.
 * @returns {Map<string, IPropertyDefinition>} A map of property names to their definitions.
 * @throws {CannotFindPropertiesHostException} If the real target (Component or ComponentSet) cannot be found.
 */

export function findCompProperties(
  comp: FigmaNode
): Record<string, IPropertyDefinition> {
  let realTarget: ComponentNode | ComponentSetNode | undefined;

  // We are looking for the ComponentSet or the Component
  // where the user defined the properties.
  // That's the real target!
  //
  // It the parent is a ComponentSet, use the parent as the real target
  if (comp.parent?.type == 'COMPONENT_SET') {
    realTarget = comp.parent;
  }
  // If comp is a ComponentSet or a Component outside of a ComponentSet we already have the real target
  else if (comp.type === 'COMPONENT' || comp.type === 'COMPONENT_SET') {
    realTarget = comp;
  }
  // When comp is an Instance, it will have a mainComponent
  else if (comp.type == 'INSTANCE' && comp.mainComponent) {
    // which can be either a variant (ComponentSet in a ComponentSet)
    if (comp.mainComponent?.parent?.type == 'COMPONENT_SET') {
      realTarget = comp.mainComponent.parent;
    }
    // or a simple Component
    else {
      realTarget = comp.mainComponent;
    }
  }

  if (typeof realTarget === 'undefined') {
    throw new CannotFindPropertiesHostException(comp);
  }

  const map: Record<string, IPropertyDefinition> = {};
  Object.entries(realTarget.componentPropertyDefinitions).map(
    (objProp: [string, GenericPropertyDefinition]) => {
      const [name, definition] = objProp;
      if (definition.type === 'VARIANT') {
        map[name] = {
          name,
          target: comp,
          linked: [],
          // type: definition.type,
          // defaultValue: definition.defaultValue,
          ...definition,
        } as IPropertyDefinition;
      }
    }
  );

  logger.tree(`Found ${Object.keys(map)} properties for ${comp.name}`, map);

  return map;
}
