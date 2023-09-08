import { PropertyDefinition } from '@code/metadata/Property';
import { GenerationRule } from '@code/types';
import { getFigmaNodeAtPath, figmaNodePath } from '@code/utils';
import logger from '@shared/logger';

import {
  MutableNode,
  type BlueprintNode,
  type Cloneable,
  type IPropertyDefinition,
} from '@shared/types';

/**
 * A `GenerationRule` that applies a property to a Figma instance node.
 */
export class PropertyRule extends GenerationRule {
  public readonly property: PropertyDefinition;

  constructor(
    public override readonly blueprint: BlueprintNode,
    public nodePath: string[],
    property: PropertyDefinition | IPropertyDefinition
  ) {
    super(blueprint);

    if (property instanceof PropertyDefinition) {
      this.property = property;
    } else {
      this.property = PropertyDefinition.create(property);
    }
  }

  public apply(component: ComponentNode, value: string | boolean): string {
    // If the property has components that are linked then the same value will apply to them
    if (this.property.linked && this.property.linked?.length >= 0) {
      logger.generation('linked', this.property.linked);
      this.property.linked.map((prop) => {
        const path = figmaNodePath(prop.target as MutableNode, this.blueprint);
        const target = getFigmaNodeAtPath(path, component) as InstanceNode;

        target.setProperties({ [this.property.name]: value });
      });
    }
    logger.generation('paths: ', this.nodePath);
    logger.generation(this.property.name, 'values: ', value);
    let target = getFigmaNodeAtPath(this.nodePath, component) as
      | InstanceNode
      | ComponentNode;
    let name: string = '';
    //if the target is componentNode, I check if its child does not have the same name,
    //as it may happen that the path is chosen wrong because it is guided by names
    if (target.type == 'COMPONENT') {
      target =
        (target.findOne(
          (child) => child.type == 'INSTANCE' && child.name == target.name
        ) as InstanceNode) ?? target;
    }
    logger.generation('target: ', target);
    if (target.type == 'INSTANCE') {
      try {
        target.setProperties({ [this.property.name]: value });
        name = `${this.nodePath.join('/')}:${this.property.name}=${String(
          value
        )} `;
        logger.generation('the name', name);
      } catch (e) {
        logger.filters('error', e);
      }
    }

    return name;
  }

  private clone<T extends Cloneable>(val: T): T;
  private clone<T extends Cloneable>(val: T[]): T[];
  private clone<AnyT extends Cloneable>(val: AnyT): AnyT {
    const type = typeof val;

    if (val === null) {
      return null as any;
    } else if (
      type === 'undefined' ||
      type === 'number' ||
      type === 'string' ||
      type === 'boolean'
    ) {
      return val;
    } else if (typeof val === 'object') {
      if (val instanceof Array) {
        return val.map((x) => this.clone(x)) as AnyT;
      } else if (val instanceof Uint8Array) {
        return new Uint8Array(val) as AnyT;
      }

      const o: Record<any, any> = {};

      for (const key of Object.keys(val)) {
        o[key] = this.clone(val[key]);
      }

      return o;
    }

    throw 'unknown';
  }
}
