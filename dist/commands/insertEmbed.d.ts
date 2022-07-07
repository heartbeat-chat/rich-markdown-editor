import { EditorView } from "prosemirror-view";
import baseDictionary from "../dictionary";
declare const insertEmbed: (view: EditorView, pos: number, link: string, options: {
    dictionary: typeof baseDictionary;
    getEmbedLink: (link: string) => Promise<string | null>;
}) => void;
export default insertEmbed;
//# sourceMappingURL=insertEmbed.d.ts.map