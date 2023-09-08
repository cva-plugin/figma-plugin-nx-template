import { HeaderPlacement, MutationKind } from '@shared/types';

import { GenerationRule } from './GenerationRule';

export interface ColumnHead {
  label: string;
  value: string | boolean;
}

//cc:generation#2;this is were the magic happens
export abstract class Header {
  /**
   * Width of the header in pixels
   */
  static width = 50;

  /**
   * Height of the header in pixels
   */
  static height = 50;

  /**
   * The number of grid columns each item occupies
   * starts at 1 and gets updated when the sub-headers
   * are added
   */
  public columnSpan = 1;
  public subHeader?: Header;

  constructor(
    public readonly rule: GenerationRule,
    public readonly title: string,
    public readonly type: MutationKind,
    public columnHeads: {
      label: string;
      value: string | boolean;
    }[]
  ) {}

  public get label(): string {
    return `${this.type}: ${this.title}`;
  }

  /**
   * Returns a SceneNode that can than be placed on the canvas
   *
   * @param placement One of: top, bottom, left, right
   * @param size Size in pixels
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public draw(placement: HeaderPlacement, size: number): SceneNode {
    throw new Error('Not implemented');
  }

  public addSubHeader(header: Header) {
    this.subHeader = header;
    this.columnSpan = header.columnHeads.length * header.columnSpan;
  }

  public getColumnHeadAt(gridIndex: number): ColumnHead {
    const index = Math.floor(gridIndex / this.columnSpan) % this.columnHeads.length;
    return this.columnHeads[index];
  }
}
