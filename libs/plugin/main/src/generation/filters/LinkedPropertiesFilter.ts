import logger from '@shared/logger';
import { Specification } from '@shared/patterns/specification';
import type { Variant } from '@shared/types';

export type PropertyRef = {
  nodePath: string[];
  property: string;
};

export class LinkedPropertiesFilter extends Specification<Variant> {
  constructor(private sourceProperty: PropertyRef, private targetProperty: PropertyRef) {
    super();
  }

  private propName(ref: PropertyRef) {
    return ref.nodePath.join('/') + ':' + ref.property;
  }

  isSatisfiedBy(variant: Variant): boolean {
    let sourceProp;
    let targetProp;

    if ('componentProperties' in variant) {
      sourceProp = variant.componentProperties[this.propName(this.sourceProperty)];
      targetProp = variant.componentProperties[this.propName(this.targetProperty)];
      return sourceProp?.value === targetProp?.value;
    }
    if(variant.parent?.type == "COMPONENT_SET"){
      
      sourceProp = variant.parent.componentPropertyDefinitions[this.propName(this.sourceProperty)];
      targetProp = variant.parent.componentPropertyDefinitions[this.propName(this.targetProperty)];
      logger.filters('variant', variant);
      logger.filters('this sourceProp', this.sourceProperty, sourceProp);
      logger.filters('variant', this.targetProperty, targetProp);
      return sourceProp?.defaultValue === targetProp?.defaultValue;
    }
    try {
      sourceProp = variant.componentPropertyDefinitions[this.propName(this.sourceProperty)];
      targetProp = variant.componentPropertyDefinitions[this.propName(this.targetProperty)];
      return sourceProp?.defaultValue === targetProp?.defaultValue;
    } catch (e) {
      logger.filters('variant', variant);
      logger.filters('sourceProp', sourceProp);
      logger.filters('variant', targetProp);
    }
    return false
  }
}

export default LinkedPropertiesFilter;
