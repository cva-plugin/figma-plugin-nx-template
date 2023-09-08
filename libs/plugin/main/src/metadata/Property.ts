import type {
  DefaultValueTypeFor,
  FigmaNode,
  IPropertyDefinition,
  IPropertyDefinitionFor,
} from '@shared/types';

/**
 * The {@link PropertyDefinition} class is an abstract base class for modeling Figma component property definitions.
 * It defines the common properties and methods that are shared by all property types.
 *
 * @template TType - A type parameter that represents the type of the property.
 * @property {string} name - The name of the property.
 * @property {TType} type - The type of the property.
 * @property {DefaultValueTypeFor<TType>} defaultValue - The default value of the property.
 * @property {string[] | undefined} variantOptions - An array of variant options for the property.
 * @property {InstanceSwapPreferredValue[] | undefined} preferredValues - An array of preferred values for the property.
 * @property {FigmaNode} target - The Figma node that the property belongs to.
 * @method {DefaultValueTypeFor<TType>[]} values - A method that returns an array of possible values for the property.
 * @method {boolean} isBoolean - A method that returns true if the property is of type 'BOOLEAN'.
 * @method {boolean} isText - A method that returns true if the property is of type 'TEXT'.
 * @method {boolean} isVariant - A method that returns true if the property is of type 'VARIANT'.
 * @method {boolean} isInstanceSwap - A method that returns true if the property is of type 'INSTANCE_SWAP'.
 * @method {number} getPossibleValuesCount - An abstract method that returns the number of possible values for the property.
 * @method {DefaultValueTypeFor<TType>[]} getPossibleValues - A method that returns an array of possible values for the property.
 * @method {Property<ComponentPropertyType>} create - A static method that creates a new instance of the {@link PropertyDefinition} class based on the type of the property.
 */
export abstract class PropertyDefinition<
  TType extends ComponentPropertyType = ComponentPropertyType
> {
  public name: string;
  public type: TType;
  public defaultValue: DefaultValueTypeFor<TType>;
  public variantOptions?: string[];
  public preferredValues?: InstanceSwapPreferredValue[];
  public target: FigmaNode;
  public linked?: IPropertyDefinition[];

  /**
   * Returns an array of possible values for the property.
   *
   * @returns {DefaultValueTypeFor<TType>[]} An array of possible values for the property.
   */
  public get values(): DefaultValueTypeFor<TType>[] {
    return this.getPossibleValues();
  }

  /**
   * Creates a new instance of the {@link PropertyDefinition} class.
   *
   * @param {IPropertyDefinitionFor<TType>} prop - An object that represents the property definition.
   */
  protected constructor(prop: IPropertyDefinitionFor<TType>) {
    this.name = prop.name;
    this.type = prop.type;
    this.defaultValue = prop.defaultValue;
    this.variantOptions = prop.variantOptions;
    this.preferredValues = prop.preferredValues;
    this.target = prop.target;
    this.linked = prop.linked ?? [];
  }

  /**
   * Returns true if the property is of type 'BOOLEAN'.
   *
   * @returns {boolean} True if the property is of type 'BOOLEAN'.
   */
  public isBoolean(): this is BooleanProperty {
    return this.type === 'BOOLEAN';
  }

  /**
   * Returns true if the property is of type 'TEXT'.
   *
   * @returns {boolean} True if the property is of type 'TEXT'.
   */
  public isText(): this is TextProperty {
    return this.type === 'TEXT';
  }

  /**
   * Returns true if the property is of type 'VARIANT'.
   *
   * @returns {boolean} True if the property is of type 'VARIANT'.
   */
  public isVariant(): this is VariantProperty {
    return this.type === 'VARIANT';
  }

  /**
   * Returns true if the property is of type 'INSTANCE_SWAP'.
   *
   * @returns {boolean} True if the property is of type 'INSTANCE_SWAP'.
   */
  public isInstanceSwap(): this is InstanceSwapProperty {
    return this.type === 'INSTANCE_SWAP';
  }

  /**
   * Returns the number of possible values for the property.
   *
   * @returns {number} The number of possible values for the property.
   */
  public abstract getCardinality(): number;

  /**
   * Returns an array of possible values for the property.
   *
   * @returns {DefaultValueTypeFor<TType>[]} An array of possible values for the property.
   */
  public getPossibleValues(): DefaultValueTypeFor<TType>[] {
    if (this.type === 'BOOLEAN')
      return [this.defaultValue as DefaultValueTypeFor<TType>];

    if (typeof this.defaultValue === 'boolean')
      return [this.defaultValue as DefaultValueTypeFor<TType>];

    if (this.isInstanceSwap())
      return (this.preferredValues?.map((v) => v.key) ??
        []) as DefaultValueTypeFor<TType>[];

    if (this.isVariant())
      return this.variantOptions as DefaultValueTypeFor<TType>[];

    if (this.isBoolean())
      return [this.defaultValue as DefaultValueTypeFor<TType>];

    return [this.defaultValue as DefaultValueTypeFor<TType>];
  }

  /**
   * Creates a new instance of a {@link PropertyDefinition} using
   * the appropriate class based on the type of the property.
   *
   * @param {IPropertyDefinition} prop - An object that represents the property definition.
   * @returns {PropertyDefinition<ComponentPropertyType>} A new instance of the {@link PropertyDefinition} class.
   */
  public static create(
    prop: IPropertyDefinition
  ): PropertyDefinition<ComponentPropertyType> {
    switch (prop.type) {
      case 'BOOLEAN':
        return new BooleanProperty(prop);
      case 'TEXT':
        return new TextProperty(prop);
      case 'VARIANT':
        return new VariantProperty(prop);
      case 'INSTANCE_SWAP':
        return new InstanceSwapProperty(prop);
    }
  }
}

/**
 * The `BooleanProperty` class is a concrete implementation of the
 * {@link PropertyDefinition} class for boolean properties.
 *
 * @extends {PropertyDefinition<'BOOLEAN'>}
 */
export class BooleanProperty extends PropertyDefinition<'BOOLEAN'> {
  public declare defaultValue: boolean;

  /**
   * Creates a new instance of the `BooleanProperty` class.
   *
   * @param {IPropertyDefinition & { type: 'BOOLEAN' }} prop - An object that represents the boolean property definition.
   */
  constructor(prop: IPropertyDefinition & { type: 'BOOLEAN' }) {
    super(prop);
  }

  public getCardinality(): number {
    return 2;
  }
}

/**
 * The `TextProperty` class is a concrete implementation of the {@link PropertyDefinition} class for text properties.
 *
 * @extends {PropertyDefinition<'TEXT'>}
 */
export class TextProperty extends PropertyDefinition<'TEXT'> {
  public declare defaultValue: string;

  /**
   * Creates a new instance of the `TextProperty` class.
   *
   * @param {IPropertyDefinition & { type: 'TEXT' }} prop - An object that represents the text property definition.
   */
  constructor(prop: IPropertyDefinition & { type: 'TEXT' }) {
    super(prop);
  }

  public getCardinality(): number {
    return 1;
  }
}

/**
 * The `VariantProperty` class is a concrete implementation of the {@link PropertyDefinition} class for variant properties.
 *
 * @extends {PropertyDefinition<'VARIANT'>}
 */
export class VariantProperty extends PropertyDefinition<'VARIANT'> {
  public declare defaultValue: string;
  public override variantOptions: string[];

  /**
   * Creates a new instance of the `VariantProperty` class.
   *
   * @param {IPropertyDefinition & { type: 'VARIANT' }} prop - An object that represents the variant property definition.
   */
  constructor(prop: IPropertyDefinition & { type: 'VARIANT' }) {
    super(prop);

    this.variantOptions = prop.variantOptions;
  }

  public getCardinality(): number {
    return this.variantOptions?.length ?? 0;
  }
}

/**
 * The `InstanceSwapProperty` class is a concrete implementation of the
 * {@link PropertyDefinition} class for instance swap properties.
 *
 * @extends {PropertyDefinition<'INSTANCE_SWAP'>}
 */
export class InstanceSwapProperty extends PropertyDefinition<'INSTANCE_SWAP'> {
  public declare defaultValue: string;
  public override preferredValues?: {
    type: 'COMPONENT' | 'COMPONENT_SET';
    key: string;
  }[];

  /**
   * Creates a new instance of the `InstanceSwapProperty` class.
   *
   * @param {IPropertyDefinition & { type: 'INSTANCE_SWAP' }} prop - An object that represents the instance swap property definition.
   */
  constructor(prop: IPropertyDefinition & { type: 'INSTANCE_SWAP' }) {
    super(prop);

    this.preferredValues = prop.preferredValues;
  }

  public getCardinality(): number {
    return this.preferredValues?.length ?? 0;
  }
}
