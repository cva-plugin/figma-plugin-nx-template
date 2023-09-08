export type Property = {
  name: string;
  value: VariableValue;
};

export type PropertySet = {
  name: string;
  values: { name: string; properties: Property[] }[];
};

export enum MatchType {
  StartsWith,
  EndsWith,
  Exact,
  Contains,
  All,
}

export type BuildRegexOptions = {
  /**
   * Whether or not the regular expression should be case sensitive.
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * The type of match that should be performed.
   * @default MatchType.Contains
   */
  matchType?: MatchType;
};
export interface IDataSource {
  getEntries(): Record<string, VariableValue>;
}
