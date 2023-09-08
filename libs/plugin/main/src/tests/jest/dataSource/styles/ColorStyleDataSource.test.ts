import { ColorStyleDataSource } from '@code/metadata/dataSource/styles/ColorStyleDataSource';
import { BuildRegexOptions, MatchType } from '@cva/shared';
import { colorStyles } from '../../data/colorStyleObjects';

function createColorStyles(objects: Object[]) {
  objects.map((obj) => {
    const color = figma.createPaintStyle();
    Object.entries(obj).map(([name, value]) => {
      // @ts-ignore
      color[name] = value;
    });
  });
}
describe('ColorStyleDataSource', () => {
  beforeEach(() => {
    createColorStyles(colorStyles);
  });
  describe('ColorStyleDataSource Constructor Tests', () => {
    it('should create a ColorStyleDataSource instance in manual mode', () => {
      const manualColorStylesDS = new ColorStyleDataSource(['1:2', '3:4']);
      expect(manualColorStylesDS.type).toBe('manual');
      expect(manualColorStylesDS.ids).toEqual(['1:2', '3:4']);
    });

    it('should create a ColorStyleDataSource instance in dynamic mode', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: true,
        matchType: MatchType.StartsWith,
      };
      const dynColorStylesDS = new ColorStyleDataSource(pattern, options);
      expect(dynColorStylesDS.type).toBe('dynamic');
      expect(dynColorStylesDS.pattern).toBeDefined();
      expect(dynColorStylesDS.options).toEqual(options);
    });
  });

  describe('ColorStyleDataSource Data Generation Tests', () => {
    it('should generate data for manual mode', () => {
      const manualColorStylesDS = new ColorStyleDataSource(['1:2', '5:6']);
      expect(manualColorStylesDS.getEntries()).toEqual({
        'light/red': '1:2',
        'light/green': '5:6',
      });
    });

    it('should generate data for dynamic mode', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: false,
        matchType: MatchType.Contains,
      };
      const dynColorStylesDS = new ColorStyleDataSource(pattern, options);
      expect(dynColorStylesDS.getEntries()).toEqual({
        'light/red': '1:2',
        'light/green': '5:6',
      });
    });
  });

  describe('ColorStyleDataSource Static Method Tests', () => {
    it('should return a record of all available color styles', () => {
      const allColorStyles = ColorStyleDataSource.All();
      expect(allColorStyles).toEqual({
        'light/red': '1:2',
        'dark/blue': '3:4',
        'light/green': '5:6',
      });
    });
  });

  describe('ColorStyleDataSource Method Tests', () => {
    it('should return the expected data from the data property', () => {
      const manualColorStylesDS = new ColorStyleDataSource(['1:2', '5:6']);
      const dataFromMethod = manualColorStylesDS.getEntries();
      expect(dataFromMethod).toEqual({
        'light/red': '1:2',
        'light/green': '5:6',
      });
    });
  });

  describe('ColorStyleDataSource Pattern Matching Tests', () => {
    it('should generate a pattern that matches as expected', () => {
      const pattern = 'light/';
      const options: BuildRegexOptions = {
        caseSensitive: false,
        matchType: MatchType.StartsWith,
      };
      const dynColorStylesDS = new ColorStyleDataSource(pattern, options);
      const mockStyle = { name: 'light/red', id: '1:2' };

      if (dynColorStylesDS.pattern) {
        // Test different matching scenarios
        expect(dynColorStylesDS.pattern.test(mockStyle.name)).toBe(true);
        expect(dynColorStylesDS.pattern.test('dark/red')).toBe(false);

        // Test case insensitivity
        expect(dynColorStylesDS.pattern.test('Light/RED')).toBe(true);
      }
    });
  });
});
