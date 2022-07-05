import { EditorView } from "prosemirror-view";
import embedPlaceholder, { findPlaceholder } from "../lib/embedPlaceholder";
import { ToastType } from "../types";
import baseDictionary from "../dictionary";
import { NodeSelection } from "prosemirror-state";

let embedId = 0;

const insertEmbed = function(
  view: EditorView,
  pos: number,
  link: string,
  options: {
    dictionary: typeof baseDictionary;
    getEmbedLink: (link: string) => Promise<string | null>;
    onShowToast?: (message: string, code: string) => void;
  }
): void {
  const { dictionary, onShowToast, getEmbedLink } = options;

  const { schema, tr } = view.state;

  const id = `embed-${embedId++}`;

  // insert a placeholder at this position, or mark an existing image as being
  // replaced
  tr.setMeta(embedPlaceholder, {
    add: {
      id,
      pos,
    },
  });
  view.dispatch(tr);

  // start uploading the image file to the server. Using "then" syntax
  // to allow all placeholders to be entered at once with the uploads
  // happening in the background in parallel.

  getEmbedLink(link)
    .then(embedLink => {
      const result = findPlaceholder(view.state, id);

      // if the content around the placeholder has been deleted
      // then forget about inserting this image
      if (result === null) {
        return;
      }
      if (embedLink === null) {
        view.dispatch(
          view.state.tr.setMeta(embedPlaceholder, { remove: { id } })
        );
        return;
      }

      const [from] = result;
      view.dispatch(
        view.state.tr
          .setMeta(embedPlaceholder, { remove: { id } })
          .insertText(embedLink, from)
          .addMark(
            from,
            from + embedLink.length + 1,
            schema.marks.link.create({ href: embedLink })
          )
      );

      // If the users selection is still at the image then make sure to select
      // the entire node once done. Otherwise, if the selection has moved
      // elsewhere then we don't want to modify it
      if (view.state.selection.from === from) {
        view.dispatch(
          view.state.tr.setSelection(
            new NodeSelection(view.state.doc.resolve(from))
          )
        );
      }
    })
    .catch(error => {
      console.error(error);

      // cleanup the placeholder if there is a failure
      const transaction = view.state.tr.setMeta(embedPlaceholder, {
        remove: { id },
      });
      view.dispatch(transaction);

      // let the user know
      //TODO: fix?
      if (onShowToast) {
        onShowToast(dictionary.imageUploadError, ToastType.Error);
      }
    });
};

export default insertEmbed;
