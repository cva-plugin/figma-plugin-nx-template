import { buildRegex } from '@code/utils';
import { BuildRegexOptions, IDataSource, MatchType } from '@cva/shared';

/**
 * A data source that can retrieve color styles from the document and generate a record of their names and ids.
 *
 * @remarks
 * The data source can be used in two ways:
 * 1. Manually provide a list of color style ids to retrieve. (this.type === 'manual')
 * 2. Dynamically generate a list of color styles based on a pattern. (this.type === 'dynamic')
 *
 * @example
 * ```
 * // Manually provide a list of color style ids
 * const manualColorStylesDS = new ColorStyleDataSource(['1:2', '3:4']);
 *
 * // Dynamically generate a list of color styles based on a pattern
 * const dynColorStylesDS = new ColorStyleDataSource('light/', {
 *  caseSensitive: true,
 *  matchType: MatchType.StartsWith,
 * });
 * ```
 */
export class ColorStyleDataSource implements IDataSource {
  /**
   * The type of this data source instance
   */
  public readonly type: 'manual' | 'dynamic';

  // --- manual type properties ---
  public readonly ids?: string[];

  // --- dynamic type properties ---
  public readonly pattern?: RegExp;
  public readonly options?: BuildRegexOptions;

  constructor(colorStyleIds: string[]);
  constructor(pattern: string, options: BuildRegexOptions);
  constructor(patternOrIds: string | string[], options?: BuildRegexOptions) {
    if (Array.isArray(patternOrIds) && patternOrIds.length > 0) {
      this.type = 'manual';
      this.ids = patternOrIds;
    } else if (typeof patternOrIds === 'string') {
      options = {
        caseSensitive: false,
        matchType: MatchType.Contains,
        ...(options ?? {}),
      };

      this.type = 'dynamic';
      this.pattern = buildRegex(patternOrIds, options);
      this.options = options;
    } else {
      throw new Error('Invalid parameters for TextStyleDataSource');
    }
  }

  /**
   * Returns the source color styles without any filtering.
   */
  public static All(): Record<string, string> {
    return figma
      .getLocalPaintStyles()
      .reduce((record: Record<string, string>, style) => {
        record[style.name] = style.id;
        return record;
      }, {});
  }

  /**
   * Returns the source color styles with dynamic or manual filters
   */
  getEntries(): Record<string, VariableValue> {
    let source: PaintStyle[];

    if (this.type == 'dynamic') {
      source = figma
        .getLocalPaintStyles()
        .filter((style) => this.pattern!.test(style.name));
    } else {
      source = figma
        .getLocalPaintStyles()
        .filter((style) => (this.ids ?? []).includes(style.id));
    }
    return source.reduce((record: Record<string, string>, style) => {
      record[style.id] = style.name;
      return record;
    }, {});
  }
}
