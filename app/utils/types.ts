/**
 * Arbitrary factory function for object of shape `Shape`.
 */
export type Factory<Shape> = (object?: Partial<Shape>) => Shape;
