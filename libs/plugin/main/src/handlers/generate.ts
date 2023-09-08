import { ErrorMessages, MissingRequirementForGeneration } from '@code/errors';
import { VariantFactory } from '@code/generation';
import { Command, type MessageData, Settings } from '@cva/shared';
import { VarianceTree } from '@code/metadata';
import { logger } from '@shared/logger';

/**
 * Shows a confirmation dialog to the user before generating variants.
 *
 * ! TODO: We need to reimplement this on the UI
 */
function showConfirmVariantGenerationDialog(amount: number): Promise<boolean> {
  return new Promise((resolve) => {
    figma.notify(
      `You are about to generate ${amount} variants.\n
      That can take some time. Are you sure you want to continue?`,
      {
        onDequeue: (reason: NotifyDequeueReason) => {
          if (reason == 'timeout' || reason == 'dismiss') {
            resolve(false);
          }

          resolve(true);
        },
        button: {
          text: 'Continue',
          action: () => {
            resolve(true);
            return true;
          },
        },
      }
    );
  });
}

export function generateVariants({
  blueprintId,
  outputFrameId,
  documentationMode,
  filters,
}: MessageData<Command.Generate>) {
  const blueprint = figma.currentPage.selection.find(
    (n) => n.id === blueprintId
  );

  if (!blueprint) {
    throw new MissingRequirementForGeneration(
      ErrorMessages.no_blueprint_component_selected()
    );
  }

  if (blueprint.type !== 'COMPONENT') {
    throw new MissingRequirementForGeneration(
      ErrorMessages.selected_blueprint_is_not_a_component()
    );
  }

  if (!outputFrameId) {
    throw new MissingRequirementForGeneration(
      ErrorMessages.no_output_frame_selected()
    );
  }

  const outputFrame = figma.getNodeById(outputFrameId);

  if (!outputFrame) {
    throw new MissingRequirementForGeneration(
      ErrorMessages.could_not_find_frame_with_id(outputFrameId)
    );
  }

  if (outputFrame.type !== 'FRAME') {
    throw new MissingRequirementForGeneration(
      ErrorMessages.selected_output_is_not_a_frame()
    );
  }

  const tree = new VarianceTree(blueprint, filters);
  const count = tree.countVariants();

  logger.generation(`Generating ${count} variants from`, blueprint);

  let confirmed = false;

  if (count > Settings.generation.warnThreshold) {
    confirmed = true; //await showConfirmVariantGenerationDialog(count);
  }

  figma.commitUndo();

  if (confirmed || count <= Settings.generation.warnThreshold) {
    const generate = documentationMode
      ? VariantFactory.generateDocumentationModeVariants(tree, outputFrame)
      : VariantFactory.generateVariants(tree, outputFrame);
    generate
      .then(() => {
        figma.closePlugin('Variants generated!');
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

export default generateVariants;
