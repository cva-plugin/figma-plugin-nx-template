/**
 * NOTE: settings inside the '#' properties are internal
 * so the user should never be allowed to change them.
 */

// settings
export interface Settings {
  '#': {
    ui: {
      title?: string;
    };
  };
  ui: {
    width: number;
    height: number;
  };
  generation: {
    warnThreshold: number;
  };
}

export const Settings: Settings = {
  '#': {
    ui: {
      // title: 'CVA - CVA',
    },
  },
  ui: {
    width: 300,
    height: 520,
  },
  generation: {
    warnThreshold: 250,
  },
};

export default Settings;
