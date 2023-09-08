import type {
  FilterConfig,
  LinkedPropertyFilterConfig,
} from '@shared/interfaces';
import { type BlueprintNode, type SomeObject } from '@shared/types';

// @code/commands.ts and @ui/commands.ts
export enum Command {
  Generate = 'code:command/generate',
  ToggleVariance = 'code:command/toggle-variance',
  LinkProperties = 'code:command/link-properties',
  ConnectPropertyToValue = 'code:command/connect-property-to-value',
  EditCustomRule = 'code:command/edit-custom-rule',
  UpdateTree = 'code:command/update-tree',
  ResizeWindow = 'code:command/resize-window',
  DisableNodeVariance = 'code:command/disable-node-variance',
  EnableNodeVariance = 'code:command/enable-node-variance',
  WaitingListRegistration = 'ui:command/waiting-list-registration',
  VerifyLicense = 'ui:command/verify-license',
  AskForBlueprint = 'ui:command/ask-for-blueprint',
  ShowMessage = 'ui:command/show-message',
  //Tests
  Test1 = 'test:command/test1',
  RunTests = 'test:command/run-tests',
}

export interface RunTestsCommand extends SomeObject {
  pattern: string;
}

export type AckResult<T = unknown> = T &
  ({ success: true } | { success: false; error: string });

export interface CommandDefinition<
  Id extends Command,
  Message = undefined,
  Result = void
> {
  $id: Id;
  $type: 'command';
  message: Message;
  result: Result;
}

export interface CommandRegistry
  extends Record<Command, CommandDefinition<Command, SomeObject | undefined>> {
  [Command.Generate]: CommandDefinition<
    Command.Generate,
    {
      blueprintId: string;
      outputFrameId: string;
      documentationMode: boolean;
      filters?: FilterConfig[];
    }
  >;

  [Command.ToggleVariance]: CommandDefinition<
    Command.ToggleVariance,
    { nodeId: string }
  >;

  [Command.Test1]: CommandDefinition<Command.Test1, {}>;

  [Command.LinkProperties]: CommandDefinition<
    Command.LinkProperties,
    LinkedPropertyFilterConfig
  >;

  [Command.ConnectPropertyToValue]: CommandDefinition<
    Command.ConnectPropertyToValue,
    { nodeId: string; value: string }
  >;

  [Command.EditCustomRule]: CommandDefinition<
    Command.EditCustomRule,
    { nodeId: string; customRule: string }
  >;

  [Command.UpdateTree]: CommandDefinition<
    Command.UpdateTree,
    {
      blueprint: BlueprintNode;
    }
  >;
  [Command.WaitingListRegistration]: CommandDefinition<
    Command.WaitingListRegistration,
    { email: string }
  >;
  [Command.ShowMessage]: CommandDefinition<
    Command.ShowMessage,
    { message: string; error?: boolean }
  >;

  [Command.VerifyLicense]: CommandDefinition<
    Command.VerifyLicense,
    { license: string }
  >;

  [Command.ResizeWindow]: CommandDefinition<
    Command.ResizeWindow,
    {
      width: number;
      height: number;
    }
  >;

  [Command.EnableNodeVariance]: CommandDefinition<
    Command.EnableNodeVariance,
    {
      nodeId: string;
    }
  >;

  [Command.DisableNodeVariance]: CommandDefinition<
    Command.DisableNodeVariance,
    {
      nodeId: string;
    }
  >;

  [Command.AskForBlueprint]: CommandDefinition<Command.AskForBlueprint>;

  [Command.RunTests]: CommandDefinition<Command.RunTests, RunTestsCommand>;
}
