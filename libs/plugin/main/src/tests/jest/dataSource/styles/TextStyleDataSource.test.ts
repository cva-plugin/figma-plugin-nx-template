import { TextStyleDataSource } from '@code/metadata/dataSource/styles/TextStyleDataSource';
import { textStyles } from '../../data/textStyleObjects';
import { BuildRegexOptions, MatchType } from '@cva/shared';

function createTextStyles(objects: Object[]) {
  objects.map((obj) => {
    const style = figma.createTextStyle();
    Object.entries(obj).map(([name, value]) => {
      // @ts-ignore
      style[name] = value;
    });
  });
}
describe('TextStyleDataSource', () => {
  beforeEach(() => {
    createTextStyles(textStyles);
  });
  describe('TextStyleDataSource Constructor Tests', () => {
    it('should create a TextStyleDataSource instance in manual mode', () => {
      const manualTextStylesDS = new TextStyleDataSource(['1:2', '3:4']);
      expect(manualTextStylesDS.type).toBe('manual');
      expect(manualTextStylesDS.ids).toEqual(['1:2', '3:4']);
    });

    it('should create a TextStyleDataSource instance in dynamic mode', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: true,
        matchType: MatchType.EndsWith,
      };
      const dynTextStylesDS = new TextStyleDataSource(pattern, options);
      expect(dynTextStylesDS.type).toBe('dynamic');
      expect(dynTextStylesDS.pattern).toBeDefined();
      expect(dynTextStylesDS.options).toEqual(options);
    });
  });

  describe('TextStyleDataSource Data Generation Tests', () => {
    it('should generate data for manual mode', () => {
      const manualTextStylesDS = new TextStyleDataSource(['1:2', '5:6']);
      expect(manualTextStylesDS.getEntries()).toEqual({
        'light/title': '1:2',
        'light/paragraph': '5:6',
      });
    });

    it('should generate data for dynamic mode', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: false,
        matchType: MatchType.Contains,
      };
      const dynTextStylesDS = new TextStyleDataSource(pattern, options);
      expect(dynTextStylesDS.getEntries()).toEqual({
        'light/title': '1:2',
        'light/paragraph': '5:6',
      });
    });
  });
  describe('TextStyleDataSource Static Method Tests', () => {
    it('should return a record of all available text styles', () => {
      const allTextStyles = TextStyleDataSource.All();
      expect(allTextStyles).toEqual({
        'light/title': '1:2',
        'dark/heading': '3:4',
        'light/paragraph': '5:6',
      });
    });
  });

  describe('TextStyleDataSource Method Tests', () => {
    it('should return the expected data from the data property', () => {
      const manualTextStylesDS = new TextStyleDataSource(['1:2', '5:6']);
      const dataFromMethod = manualTextStylesDS.getEntries();
      expect(dataFromMethod).toEqual({
        'light/title': '1:2',
        'light/paragraph': '5:6',
      });
    });
  });

  describe('TextStyleDataSource Pattern Matching Tests', () => {
    it('should generate a pattern that matches as expected', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: false,
        matchType: MatchType.StartsWith,
      };
      const dynTextStylesDS = new TextStyleDataSource(pattern, options);
      const mockStyle = { name: 'light/title', id: '1:2' };

      // Test different matching scenarios
      if (dynTextStylesDS.pattern) {
        expect(dynTextStylesDS.pattern.test(mockStyle.name)).toBe(true);
        expect(dynTextStylesDS.pattern.test('dark/title')).toBe(false);

        // Test case insensitivity
        expect(dynTextStylesDS.pattern.test('Light/TITLE')).toBe(true);
      }
    });
  });
});
