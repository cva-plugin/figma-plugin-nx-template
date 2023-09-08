/**
 * Base interface for Specifications.
 */
export interface ISpecification<T> {
  /**
   * The isSatisfiedBy method is a function that takes an object of type T and returns a boolean value indicating 
   * whether the object satisfies the criteria specified by the specification. This method is defined in the 
   * ISpecification interface and must be implemented by any class that implements this interface.
   * 
   * @param target The object to check
   */
  isSatisfiedBy(target: T): boolean;
}

/**
 * Base class for creating specifications that can be used to determine if an object satisfies certain criteria.
 * @typeparam T The type of object that the specification applies to.
 */
export abstract class Specification<T> implements ISpecification<T> {
  /**
   * The isSatisfiedBy method is a function that takes an object of type T and returns a boolean value indicating 
   * whether the object satisfies the criteria specified by the specification. This method is defined in the 
   * ISpecification interface and must be implemented by any class that implements this interface.
   * 
   * @param target The object to check
   */
  abstract isSatisfiedBy(target: T): boolean;

  /**
   * Creates a new specification that is the logical AND of this specification and another specification.
   * 
   * @param spec The other specification to AND with this specification.
   * @returns A new specification that is the logical AND of this specification and the other specification.
   */
  and(spec: Specification<T>): Specification<T> {
      return new AndSpecification(this, spec);
  }

  /**
   * Creates a new specification that is the logical OR of this specification and another specification.
   * 
   * @param spec The other specification to OR with this specification.
   * @returns A new specification that is the logical OR of this specification and the other specification.
   */
  or(spec: Specification<T>): Specification<T> {
      return new OrSpecification(this, spec);
  }
}

/**
 * A specification that is the logical AND of two other specifications.
 * @typeparam T The type of object that the specification applies to.
 */
export class AndSpecification<T> extends Specification<T> {
  /**
   * Creates a new AndSpecification.
   * 
   * @param left The left-hand side specification.
   * @param right The right-hand side specification.
   */
  constructor(private left: Specification<T>, private right: Specification<T>) {
      super();
  }

  /**
   * Determines whether an object satisfies this specification by checking whether it satisfies both the left-hand side
   * and the right-hand side specifications.
   * 
   * @param target The object to check.
   * @returns True if the object satisfies both the left-hand side and the right-hand side specifications, false otherwise.
   */
  isSatisfiedBy(target: T): boolean {
      return this.left.isSatisfiedBy(target) && this.right.isSatisfiedBy(target);
  }
}

/**
 * A specification that is the logical OR of two other specifications.
 * @typeparam T The type of object that the specification applies to.
 */
export class OrSpecification<T> extends Specification<T> {
  /**
   * Creates a new OrSpecification.
   * 
   * @param left The left-hand side specification.
   * @param right The right-hand side specification.
   */
  constructor(private left: Specification<T>, private right: Specification<T>) {
      super();
  }

  /**
   * Determines whether an object satisfies this specification by checking whether it satisfies either the left-hand side
   * or the right-hand side specification.
   * 
   * @param target The object to check.
   * @returns True if the object satisfies either the left-hand side or the right-hand side specification, false otherwise.
   */
  isSatisfiedBy(target: T): boolean {
      return this.left.isSatisfiedBy(target) || this.right.isSatisfiedBy(target);
  }
}
