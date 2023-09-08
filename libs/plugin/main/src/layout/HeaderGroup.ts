import { HeaderPlacement } from '@shared/types';
import { type ColumnHead, Header } from '@code/types/Header';
import logger from '@shared/logger';

export class HeaderGroup {
  public readonly headers: Header[];

  private rootHeader(): Header {
    return this.headers[0];
  }

  public get gridLength(): number {
    logger.generation('HEADERS', this.headers);
    const root = this.rootHeader();
    return root.columnHeads.length * root.columnSpan;
  }

  constructor(headers: Header[], public placement: HeaderPlacement) {
    if (!headers || headers.length === 0) {
      throw new Error('No headers provided');
    }

    if (headers.length > 1) {
      for (let i = 1; i < headers.length; i++) {
        headers[i].addSubHeader(headers[i - 1]);
      }
    }
    this.headers = headers.reverse();
    return;
  }

  /**
   * Returns a SceneNode that can than be placed on the canvas
   *
   * @param placement One of: top, bottom, left, right
   * @param size Size in pixels
   */
  public draw(): SceneNode {
    throw new Error('Not implemented');
  }

  public getColumnHeadsAt(
    gridIndex: number
  ): { header: Header; column: ColumnHead }[] {
    const heads = [];

    for (const header of this.headers) {
      heads.push({
        header,
        column: header.getColumnHeadAt(gridIndex),
      });
    }

    return heads;
  }
}
