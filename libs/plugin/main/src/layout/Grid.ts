import { CvaException, ErrorMessages } from '@code/errors';
import { PropertyRule } from '@code/generation/rules';
import { PropertyDefinition, VarianceTree } from '@code/metadata';
import { type ColumnHead, Header } from '@code/types';
import { figmaNodePath, type Size } from '@code/utils';

import { HeaderGroup } from './HeaderGroup';

import logger from '@shared/logger';
import {
  Exists,
  type FigmaNode,
  type FigmaNodeId,
  HeaderPlacement,
  type IPropertyDefinition,
  MutationKind,
} from '@shared/types';
import { PropertyHeader } from '@code/generation/headers';

export class Grid {
  public readonly headers: Header[];
  public readonly topHeaders: Header[];
  public readonly leftHeaders: Header[];
  public readonly topHeaderGroup: HeaderGroup;
  public readonly leftHeaderGroup: HeaderGroup;
  public readonly rows: number;
  public readonly cols: number;
  public size: Size;
  public cell: Size;
  public padding: Size;

  /**
   * A matrix ([row][col]) of variant ids
   */
  private readonly variants: FigmaNode[][] = [];

  public get contentStartX(): number {
    return this.output.x + Header.width * this.leftHeaders.length * 8;
  }

  public get contentStartY(): number {
    return this.output.y + Header.height * this.topHeaders.length * 2;
  }

  public variantAt(col: number, row: number): FigmaNode {
    return this.variants[row][col];
  }

  public hashMap = new Map<FigmaNodeId, FigmaNode>();

  constructor(tree: VarianceTree, private output: FrameNode) {
    logger.generation('Creating grid for tree', tree);

    ({
      headers: this.headers,
      topHeaders: this.topHeaders,
      leftHeaders: this.leftHeaders,
    } = this.createHeaders(tree));

    this.topHeaderGroup = new HeaderGroup(this.topHeaders, HeaderPlacement.Top);
    this.leftHeaderGroup = new HeaderGroup(
      this.leftHeaders,
      HeaderPlacement.Left
    );

    this.cols = this.topHeaderGroup.gridLength;
    this.rows = this.leftHeaderGroup.gridLength;
    // First grid size estimation
    // these will be updated later when we add the variants
    ({
      size: this.size,
      cell: this.cell,
      padding: this.padding,
    } = this.estimateGridDimensions(tree.root.node, this.cols, this.rows));
  }

  private createHeaders(tree: VarianceTree) {
    const headers = this.generatePropertyHeaders(tree);

    // Let's use the ordered props to determine vertical and horizontal headers
    const [topHeaders, leftHeaders] = headers.reduce<[Header[], Header[]]>(
      ([xHeaders, yHeaders], header: Header, index: number) => {
        if (index % 2 === 0) {
          xHeaders.push(header);
        } else {
          yHeaders.push(header);
        }

        return [xHeaders, yHeaders];
      },
      [[], []]
    );

    logger.generation('Headers', headers);
    logger.generation('Top headers', topHeaders);
    logger.generation('Left headers', leftHeaders);

    return {
      headers,
      topHeaders,
      leftHeaders,
    };
  }

  /**
   * #done
   * A memoized function that returns the size of a variant grid cell
   * based on the the size of the biggest variant
   *
   * @param master
   * @returns
   */
  private estimateGridDimensions(
    master: SceneNode,
    cols: number,
    rows: number
  ): { size: Size; cell: Size; padding: Size } {
    if (!master.height || !master.width) {
      const message = ErrorMessages.master_has_no_size();
      figma.notify(message);
      throw new CvaException(message);
    }

    return {
      size: {
        width: master.width * cols,
        height: master.width * rows,
      },
      cell: {
        width: master.width,
        height: master.height,
      },
      padding: this.calculatePadding(master.width, master.height),
    };
  }

  /**
   * Use 10% of the master's size as the padding
   * between the variants but limit it to 10px min and 30px max
   */
  private calculatePadding(cellWidth: number, cellHeight: number): Size {
    const space = Math.max(
      Math.min(Math.round(Math.max(cellHeight, cellWidth) * 0.3), 10),
      30
    );

    return {
      width: space,
      height: space,
    };
  }

  /**
   * This method positions a variant in the output frame and records
   * it's size so at the end we'll know the size of the biggest width
   * and height among all variants.
   *
   * @param node
   * @param col
   * @param row
   */
  public addVariant(node: FigmaNode, row: number, col: number) {
    this.updateSize(node);

    node.x = col * this.cell.width + col * this.padding.width;
    node.y = row * this.cell.height + row * this.padding.height;

    this.variants[row] = this.variants[row] || [];
    this.hashMap.set(node.id, node);
    this.variants[row][col] = node;
  }

  public arrangeVariants() {
    for (let r = 0; r < this.variants.length; r++) {
      const row = this.variants[r];

      for (let col = 0; col < row.length; col++) {
        const variant = row[col];

        variant.x =
          col * (this.cell.width + this.padding.width) + this.contentStartX;
        variant.y =
          r * (this.cell.height + this.padding.height) + this.contentStartY;
      }
    }
  }

  private updateSize(node: SceneNode) {
    this.cell.width = Math.max(this.cell.width, node.width);
    this.cell.height = Math.max(this.cell.height, node.height);

    this.size.width = this.cell.width * this.cols;
    this.size.height = this.cell.height * this.rows;

    this.padding = this.calculatePadding(this.cell.width, this.cell.height);
  }

  public getHeaderValuesAt(
    row: number,
    col: number
  ): { header: Header; column: ColumnHead }[] {
    const top = this.topHeaderGroup.getColumnHeadsAt(row);
    const left = this.leftHeaderGroup.getColumnHeadsAt(col);

    return [...top, ...left];
  }

  /**
   * Generates an array of headers for a given variance tree, ordered by precedence.
   *
   * The order of the headers is determined by the internal `propPrecedence` array.
   *
   * @param tree The variance tree to generate headers for.
   * @returns An array of headers for the given variance tree.
   */
  private generatePropertyHeaders(tree: VarianceTree): PropertyHeader[] {
    type PropMatcher = (prop: IPropertyDefinition) => boolean;
    // Defines a property precedence order to
    // try to generate the most readable grid.
    // Each item in the array is a function that
    // returns true if the property matches the criteria.
    const propPrecedence: PropMatcher[] = [
      (prop: IPropertyDefinition) => prop.name === 'size',
      (prop: IPropertyDefinition) => prop.type === 'INSTANCE_SWAP',
      (prop: IPropertyDefinition) => prop.type === 'VARIANT',
      (prop: IPropertyDefinition) => prop.name === 'shape',
      (prop: IPropertyDefinition) => prop.name === 'color',
      (prop: IPropertyDefinition) => prop.name === 'state',
      (prop: IPropertyDefinition) => prop.type === 'BOOLEAN',
    ];

    const orderedProps = Object.values(tree.properties).sort((aProp, bProp) => {
      const aIndex = propPrecedence.findIndex((rule) => rule(aProp));
      const bIndex = propPrecedence.findIndex((rule) => rule(bProp));

      return aIndex - bIndex;
    });

    logger.generation('Ordered props', orderedProps);

    const headers = orderedProps
      .map((prop) => {
        if (prop.target.type == 'INSTANCE') {
          const path = figmaNodePath(prop.target, tree.root.node);
          const propertyRule = new PropertyRule(
            tree.root.node,
            path,
            PropertyDefinition.create(prop)
          );

          return new PropertyHeader(
            propertyRule,
            propertyRule.property.name,
            MutationKind.Property,
            PropertyHeader.getColumnHeads(propertyRule.property)
          );
        }

        return null;
      })
      .filter<PropertyHeader>(Exists);

    return headers;
  }
}
