import { type FigmaNode, type INodeTreeNode } from '@shared/types';

export type ErrorTemplate = (...args: unknown[]) => string;

const nodeRefString = (node: INodeTreeNode | FigmaNode) =>
  `node ${node.name} (${node.id})`;

export const ErrorMessages = {
  no_name: () =>
    'Put your .base component inside a Frame named after your components name',
  cannot_find_property_host: (refComponent: INodeTreeNode | FigmaNode) =>
    `"Could not find the Component or ComponentSet that hosts the property definitions for ${nodeRefString(
      refComponent
    )}`,
  cannot_find_property_for_header: (
    header: string,
    refComponent: INodeTreeNode | FigmaNode
  ) =>
    `"Could not find the property for ${header} in the properties of Node ${nodeRefString(
      refComponent
    )}`,
  master_has_no_size: () =>
    'CVA cannot generate variants for components with no size',
  no_blueprint_component_selected: () =>
    'Please select a component or component set to serve a blueprint from',
  no_output_frame_selected: () =>
    'Please select the frame where the output should be generated',
  could_not_find_frame_with_id: (id: string) =>
    `Could not find the Frame with id ${id}. Please select a frame where the output should be generated`,
  selected_output_is_not_a_frame: () =>
    'Please select a frame where the output should be generated',
  node_not_found: (nodeId: string) => `Could not find node with id ${nodeId}`,
  selected_blueprint_is_not_a_component: () =>
    `The UI element currently selected cannot be used as a blueprint. Please select a component or component set`,
};

export type ErrorKey = keyof typeof ErrorMessages;

export class CvaException extends Error {}

export class CannotFindPropertiesHostException extends CvaException {
  constructor(public readonly refNode: INodeTreeNode | FigmaNode) {
    super(ErrorMessages.cannot_find_property_host(refNode));
  }
}

export class HeaderPropertyNotFoundException extends CvaException {
  constructor(
    public readonly header: string,
    public readonly refNode: INodeTreeNode | FigmaNode
  ) {
    super(ErrorMessages.cannot_find_property_for_header(header, refNode));
  }
}

export class MissingRequirementForGeneration extends CvaException {
  constructor(public override readonly message: string) {
    super(message);
  }
}
