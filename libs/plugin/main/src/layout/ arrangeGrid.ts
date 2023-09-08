import { IPropertyDefinition } from '@cva/shared';
import { serialize } from '@shared/utils';

export type GridParameters = {
  row: string;
  col: string;
  hGroup?: string;
};

type VariantValues = {
  [property: string]: string;
};

const subGrid = 24;
const groups = 96;

export async function arrangeGrid(
  parameters: GridParameters,
  compSet: ComponentSetNode
) {
  await loadFonts();

  let variantProperties = compSet.componentPropertyDefinitions;
  const variants = compSet.children as ComponentNode[];

  if (!parameters['hGroup']) {
    parameters['hGroup'] = '';
  }

  // Determine columns and rows in both sub-grid and horizontal groups
  const columnPropValues_subGrid =
    variantProperties[parameters['col']]?.variantOptions ?? [];
  const rowPropValues_subGrid =
    variantProperties[parameters['row']]?.variantOptions ?? [];
  const columnPropValues_group =
    parameters['hGroup'] &&
    (variantProperties[parameters['hGroup']]?.variantOptions ?? []);

  // Calculate grid sizing based on largest variant sizes (rounded up to sit on 8px grid)
  const maxWidth =
    Math.ceil(Math.max(...variants.map((element) => element.width)) / 8) * 8;
  const maxHeight =
    Math.ceil(Math.max(...variants.map((element) => element.height)) / 8) * 8;

  const dx_subGrid = maxWidth + subGrid;
  const dy_subGrid = maxHeight + subGrid;
  const dx_group =
    dx_subGrid * columnPropValues_subGrid.length - subGrid + groups;
  const dy_group = dy_subGrid * rowPropValues_subGrid.length - subGrid + groups;
  // Seperate out properties used for vertical grouping
  function getGroupProps(variant: ComponentNode) {
    const props = variantProps(variant.name);
    if (!props) throw Error('One or more variants are named incorrectly');

    const {
      [parameters['col']]: columnProp,
      [parameters['row']]: rowProp,
      ...groupProps
    } = props;

    if (parameters['hGroup']) {
      delete groupProps[parameters['hGroup']];
    }
    return groupProps;
  }

  const groupPropsOfEveryVariant = variants.map((variant: ComponentNode) =>
    getGroupProps(variant)
  );

  // Calculate group numbers and sort according to order of props and values in Component Set
  function getPropIdentifier([key, value]: [string, string]) {
    const keyIndex = getPaddedIndex(key, Object.keys(variantProperties));
    const valueIndex = getPaddedIndex(
      value,
      variantProperties[key].variantOptions ?? []
    );
    return `${keyIndex}${valueIndex}`;
  }

  function getObjectIdentifier(json: string) {
    const obj: Object = JSON.parse(json);
    return Object.entries(obj)
      .map((prop) => getPropIdentifier(prop))
      .sort()
      .toString();
  }

  const uniqueGroups = [
    ...new Map(
      groupPropsOfEveryVariant.map((obj) => [serialize(obj), obj])
    ).keys(),
  ].sort((a, b) => {
    const idA = getObjectIdentifier(a);
    const idB = getObjectIdentifier(b);

    if (idA < idB) {
      return -1;
    }
    if (idA > idB) {
      return 1;
    }

    // identifiers must be equal
    return 0;
  });

  // Layout variants in grid
  compSet.layoutMode = 'NONE';

  variants.forEach((variant: ComponentNode) => {
    const columnIndex_subGrid = columnPropValues_subGrid.indexOf(
      ValuePropertyByName(variant.name, parameters['col'])
    );
    const rowIndex_subGrid = rowPropValues_subGrid.indexOf(
      ValuePropertyByName(variant.name, parameters['row'])
    );
    const columnIndex_group = parameters['hGroup']
      ? columnPropValues_group.indexOf(
          ValuePropertyByName(variant.name, parameters['hGroup'])
        )
      : 0;
    const rowIndex_group = uniqueGroups.indexOf(
      serialize(getGroupProps(variant))
    );
    variant.x =
      columnIndex_subGrid * dx_subGrid + columnIndex_group * dx_group + subGrid;
    variant.y =
      rowIndex_subGrid * dy_subGrid + rowIndex_group * dy_group + subGrid;
  });

  // Resize Component Set
  const bottomRigthX = Math.max(
    ...variants.map((child) => child.x + child.width)
  );
  const bottomRigthY = Math.max(
    ...variants.map((child) => child.y + child.height)
  );

  compSet.resizeWithoutConstraints(
    bottomRigthX + subGrid,
    bottomRigthY + subGrid
  );

  const componentSetIndex = compSet.parent?.children.indexOf(compSet);
  if (componentSetIndex == undefined)
    throw Error('Your componentSet is not in the variants output frame');
  const labelsParentFrame = figma.createFrame();
  compSet.parent?.insertChild(componentSetIndex, labelsParentFrame);

  labelsParentFrame.x = compSet.x;
  labelsParentFrame.y = compSet.y;
  labelsParentFrame.resize(compSet.width, compSet.height);
  labelsParentFrame.fills = [];
  labelsParentFrame.name = `${compSet.name} - labels`;
  labelsParentFrame.expanded = false;
  labelsParentFrame.clipsContent = false;

  // labels
  const labels_rowGroups: TextNode[] = [];
  const labels_subGridRows: TextNode[] = [];

  // list of boolean properties
  const booleanPropNames = Object.entries(variantProperties)
    .filter((arr) => {
      const values =
        arr[1]['type'] == 'BOOLEAN'
          ? String(arr[1].defaultValue).toLowerCase()
          : false;
      if (values == false) return false;
      return (
        values === 'off' ||
        values === 'on' ||
        values === 'no' ||
        values === 'yes' ||
        values === 'false' ||
        values === 'true'
      );
    })
    .map((arr) => arr[0]);

  // Include property names with boolean values to make labels clearer
  function getLabelText(key: string, value: string) {
    return booleanPropNames.includes(key) ? `${key}=${value}` : value;
  }

  function createSubGridColumnLabels(groupIndex: number) {
    columnPropValues_subGrid.forEach((value, i) => {
      const label = createText(getLabelText(parameters['col'], value));
      labelsParentFrame.appendChild(label);
      label.x = dx_subGrid * i + dx_group * groupIndex + subGrid;
      label.y = -subGrid - label.height;
    });
  }

  function createSubGridRowLabels(groupIndex: number) {
    rowPropValues_subGrid.forEach((value, i) => {
      const label = createText(getLabelText(parameters['row'], value));
      labelsParentFrame.appendChild(label);
      labels_subGridRows.push(label);
      label.y = dy_subGrid * i + dy_group * groupIndex + subGrid;
    });
  }

  // column labels
  if (columnPropValues_group) {
    columnPropValues_group.forEach((value, i) => {
      const label = createText(
        getLabelText(parameters['hGroup'] ?? '', value),
        20,
        'Bold'
      );
      labelsParentFrame.appendChild(label);
      label.x = dx_group * i + subGrid;
      label.y = -groups - subGrid - label.height - 24; // allow 24 for height of sub-grid labels
      createSubGridColumnLabels(i);
    });
  } else {
    createSubGridColumnLabels(0);
  }
  // row labels
  if (uniqueGroups.length > 1) {
    uniqueGroups.forEach((json, i) => {
      const labelText = Object.entries(JSON.parse(json))
        .map(([key, value]) => getLabelText(key, value as string))
        .join(', ');
      const label = createText(labelText, 20, 'Bold');
      labelsParentFrame.appendChild(label);
      label.y = dy_group * i + subGrid;
      labels_rowGroups.push(label);
      createSubGridRowLabels(i);
    });
  } else {
    createSubGridRowLabels(0);
  }
  const labelMaxWidth_rowGroups = Math.max(
    ...labels_rowGroups.map((element) => element.width)
  );
  const labelMaxWidth_subGridRows = Math.max(
    ...labels_subGridRows.map((element) => element.width)
  );

  labels_rowGroups.forEach((label) => {
    label.x =
      label.x -
      labelMaxWidth_rowGroups -
      labelMaxWidth_subGridRows -
      subGrid -
      groups;
  });
  labels_subGridRows.forEach((label) => {
    label.x = label.x - labelMaxWidth_subGridRows - subGrid;
  });
}
export async function arrangeGridDocumentationMode(
  parameters: GridParameters,
  variants: InstanceNode[],
  variantProperties: Record<string, IPropertyDefinition>,
  outputFrame: FrameNode
) {
  await loadFonts();
  if (!parameters['hGroup']) {
    parameters['hGroup'] = '';
  }

  // Determine columns and rows in both sub-grid and horizontal groups
  const columnPropValues_subGrid =
    variantProperties[parameters['col']]?.variantOptions ?? [];
  const rowPropValues_subGrid =
    variantProperties[parameters['row']]?.variantOptions ?? [];
  const columnPropValues_group =
    parameters['hGroup'] &&
    (variantProperties[parameters['hGroup']]?.variantOptions ?? []);

  // Calculate grid sizing based on largest variant sizes (rounded up to sit on 8px grid)
  const maxWidth =
    Math.ceil(Math.max(...variants.map((element) => element.width)) / 8) * 8;
  const maxHeight =
    Math.ceil(Math.max(...variants.map((element) => element.height)) / 8) * 8;

  const dx_subGrid = maxWidth + subGrid;
  const dy_subGrid = maxHeight + subGrid;
  const dx_group =
    dx_subGrid * columnPropValues_subGrid.length - subGrid + groups;
  const dy_group = dy_subGrid * rowPropValues_subGrid.length - subGrid + groups;
  // Seperate out properties used for vertical grouping

  function getGroupProps(variant: InstanceNode) {
    const props = variantProps(variant.name);
    if (!props) throw Error('One or more variants are named incorrectly');

    const {
      [parameters['col']]: columnProp,
      [parameters['row']]: rowProp,
      ...groupProps
    } = props;
    if (parameters['hGroup']) {
      delete groupProps[parameters['hGroup']];
    }
    return groupProps;
  }

  const groupPropsOfEveryVariant = variants.map((variant: InstanceNode) =>
    getGroupProps(variant)
  );
  // Calculate group numbers and sort according to order of props and values in Component Set
  function getPropIdentifier([key, value]: [string, string]) {
    const index = key.lastIndexOf('/');
    if (index !== -1) {
      key = key.slice(index + 1); // Extract substring after the last "/"
    }
    // No delimiter found, return the original string

    const keyIndex = getPaddedIndex(key, Object.keys(variantProperties));
    const valueIndex = getPaddedIndex(
      value,
      variantProperties[key].variantOptions ?? []
    );
    return `${keyIndex}${valueIndex}`;
  }

  function getObjectIdentifier(json: string) {
    const obj: Object = JSON.parse(json);
    return Object.entries(obj)
      .map((prop) => getPropIdentifier(prop))
      .sort()
      .toString();
  }

  const uniqueGroups = [
    ...new Map(
      groupPropsOfEveryVariant.map((obj) => [serialize(obj), obj])
    ).keys(),
  ].sort((a, b) => {
    const idA = getObjectIdentifier(a);
    const idB = getObjectIdentifier(b);

    if (idA < idB) {
      return -1;
    }
    if (idA > idB) {
      return 1;
    }

    // identifiers must be equal
    return 0;
  });
  outputFrame.layoutMode = 'NONE';
  variants.forEach((variant: InstanceNode) => {
    const columnIndex_subGrid = columnPropValues_subGrid.indexOf(
      ValuePropertyByName(variant.name, parameters['col'])
    );

    const rowIndex_subGrid = rowPropValues_subGrid.indexOf(
      ValuePropertyByName(variant.name, parameters['row'])
    );
    const columnIndex_group = parameters['hGroup']
      ? columnPropValues_group.indexOf(
          ValuePropertyByName(variant.name, parameters['hGroup'])
        )
      : 0;
    const rowIndex_group = uniqueGroups.indexOf(
      serialize(getGroupProps(variant))
    );
    variant.x =
      columnIndex_subGrid * dx_subGrid + columnIndex_group * dx_group + subGrid;
    variant.y =
      rowIndex_subGrid * dy_subGrid + rowIndex_group * dy_group + subGrid;
  });

  // Resize
  const bottomRigthX = Math.max(
    ...variants.map((child) => Math.abs(child.x) + child.width)
  );
  const bottomRigthY = Math.max(
    ...variants.map((child) => child.y + child.height)
  );
  outputFrame.resizeWithoutConstraints(
    bottomRigthX + subGrid,
    bottomRigthY + subGrid
  );

  const componentSetIndex = outputFrame.parent?.children.indexOf(outputFrame);
  if (componentSetIndex == undefined)
    throw Error('Your componentSet is not in the variants output frame');
  const labelsParentFrame = figma.createFrame();
  outputFrame.parent?.insertChild(componentSetIndex, labelsParentFrame);

  labelsParentFrame.x = outputFrame.x;
  labelsParentFrame.y = outputFrame.y;
  labelsParentFrame.resize(outputFrame.width, outputFrame.height);
  labelsParentFrame.fills = [];
  labelsParentFrame.name = `${outputFrame.name} - labels`;
  labelsParentFrame.expanded = false;
  labelsParentFrame.clipsContent = false;

  // labels
  const labels_rowGroups: TextNode[] = [];
  const labels_subGridRows: TextNode[] = [];

  // list of boolean properties
  const booleanPropNames = Object.entries(variantProperties)
    .filter((arr) => {
      const values =
        arr[1]['type'] == 'BOOLEAN'
          ? String(arr[1].defaultValue).toLowerCase()
          : false;
      if (values == false) return false;
      return (
        values === 'off' ||
        values === 'on' ||
        values === 'no' ||
        values === 'yes' ||
        values === 'false' ||
        values === 'true'
      );
    })
    .map((arr) => arr[0]);

  // Include property names with boolean values to make labels clearer
  function getLabelText(key: string, value: string) {
    return booleanPropNames.includes(key) ? `${key}=${value}` : value;
  }

  function createSubGridColumnLabels(groupIndex: number) {
    columnPropValues_subGrid.forEach((value, i) => {
      const label = createText(getLabelText(parameters['col'], value));
      labelsParentFrame.appendChild(label);
      label.x = dx_subGrid * i + dx_group * groupIndex + subGrid;
      label.y = -subGrid - label.height;
    });
  }

  function createSubGridRowLabels(groupIndex: number) {
    rowPropValues_subGrid.forEach((value, i) => {
      const label = createText(getLabelText(parameters['row'], value));
      labelsParentFrame.appendChild(label);
      labels_subGridRows.push(label);
      label.y = dy_subGrid * i + dy_group * groupIndex + subGrid;
    });
  }

  // column labels
  if (columnPropValues_group) {
    columnPropValues_group.forEach((value, i) => {
      const label = createText(
        getLabelText(parameters['hGroup'] ?? '', value),
        20,
        'Bold'
      );
      labelsParentFrame.appendChild(label);
      label.x = dx_group * i + subGrid;
      label.y = -groups - subGrid - label.height - 24; // allow 24 for height of sub-grid labels
      createSubGridColumnLabels(i);
    });
  } else {
    createSubGridColumnLabels(0);
  }
  // row labels
  if (uniqueGroups.length > 1) {
    uniqueGroups.forEach((json, i) => {
      const labelText = Object.entries(JSON.parse(json))
        .map(([key, value]) => getLabelText(key, value as string))
        .join(', ');
      const label = createText(labelText, 20, 'Bold');
      labelsParentFrame.appendChild(label);
      label.y = dy_group * i + subGrid;
      labels_rowGroups.push(label);
      createSubGridRowLabels(i);
    });
  } else {
    createSubGridRowLabels(0);
  }
  const labelMaxWidth_rowGroups = Math.max(
    ...labels_rowGroups.map((element) => element.width)
  );
  const labelMaxWidth_subGridRows = Math.max(
    ...labels_subGridRows.map((element) => element.width)
  );

  labels_rowGroups.forEach((label) => {
    label.x =
      label.x -
      labelMaxWidth_rowGroups -
      labelMaxWidth_subGridRows -
      subGrid -
      groups;
  });
  labels_subGridRows.forEach((label) => {
    label.x = label.x - labelMaxWidth_subGridRows - subGrid;
  });
}
function ValuePropertyByName(name: string, parameter: string) {
  const prop = variantProps(name);
  if (prop[parameter]) {
    return prop[parameter];
  }
  return '';
}
export function variantProps(propName: string): VariantValues {
  let variantOptions: VariantValues = {};
  propName.split(',').map((names) => {
    const value = names.split('=');
    variantOptions[value[0].replace(/\s/g, '')] = value[1].replace(/\s/g, '');
  });
  return variantOptions;
}

function zeroPaddedNumber(num: number, max: number) {
  const countLength = max.toString().length;
  return num.toString().padStart(countLength, '0');
}

function getPaddedIndex(item: string, arr: string[]) {
  return zeroPaddedNumber(arr.indexOf(item), arr.length);
}

function createText(
  characters: string,
  size: number = 16,
  style: string = 'Regular'
) {
  const text = figma.createText();
  text.fontName = { family: 'Space Mono', style: style };
  text.characters = characters;
  text.fontSize = size;
  text.fills = [
    {
      type: 'SOLID',
      color: { r: 123 / 255, g: 97 / 255, b: 255 / 255 },
    },
  ];
  return text;
}

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: 'Space Mono', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Space Mono', style: 'Bold' }),
  ]);
}
