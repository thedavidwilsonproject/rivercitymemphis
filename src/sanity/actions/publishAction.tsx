import { PublishIcon } from "@sanity/icons";
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from "sanity";

/**
 * Custom Publish action.
 *
 * Sanity v5's default publish action gets hidden on the free tier because the
 * new Studio routes publishing through Content Releases (a paid feature).
 * This re-implements the publish flow as an always-visible, always-clickable
 * action so non-technical editors have a working button.
 *
 * Uses Sanity's own `useDocumentOperation` under the hood, so it behaves
 * identically to the original publish — it just renders the button reliably.
 */
export const customPublishAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const { id, type, draft, onComplete } = props;
  const { publish } = useDocumentOperation(id, type);

  return {
    label: "Publish",
    icon: PublishIcon,
    shortcut: "Ctrl+Alt+P",
    tone: "positive",
    // Disabled when there's no draft to publish, or when Sanity's
    // operation API says publish isn't currently allowed (e.g. mid-save).
    disabled: !draft || Boolean(publish.disabled),
    onHandle: () => {
      publish.execute();
      onComplete();
    },
  };
};
