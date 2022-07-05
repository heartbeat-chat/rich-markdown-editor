"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const embedPlaceholder_1 = __importStar(require("../lib/embedPlaceholder"));
const types_1 = require("../types");
const prosemirror_state_1 = require("prosemirror-state");
let embedId = 0;
const insertEmbed = function (view, pos, link, options) {
    const { dictionary, onShowToast, getEmbedLink } = options;
    const { schema, tr } = view.state;
    const id = `embed-${embedId++}`;
    tr.setMeta(embedPlaceholder_1.default, {
        add: {
            id,
            pos,
        },
    });
    view.dispatch(tr);
    getEmbedLink(link)
        .then(embedLink => {
        const result = embedPlaceholder_1.findPlaceholder(view.state, id);
        if (result === null) {
            return;
        }
        if (embedLink === null) {
            view.dispatch(view.state.tr.setMeta(embedPlaceholder_1.default, { remove: { id } }));
            return;
        }
        const [from] = result;
        view.dispatch(view.state.tr
            .setMeta(embedPlaceholder_1.default, { remove: { id } })
            .insertText(embedLink, from)
            .addMark(from, from + embedLink.length + 1, schema.marks.link.create({ href: embedLink })));
        if (view.state.selection.from === from) {
            view.dispatch(view.state.tr.setSelection(new prosemirror_state_1.NodeSelection(view.state.doc.resolve(from))));
        }
    })
        .catch(error => {
        console.error(error);
        const transaction = view.state.tr.setMeta(embedPlaceholder_1.default, {
            remove: { id },
        });
        view.dispatch(transaction);
        if (onShowToast) {
            onShowToast(dictionary.imageUploadError, types_1.ToastType.Error);
        }
    });
};
exports.default = insertEmbed;
//# sourceMappingURL=insertEmbed.js.map