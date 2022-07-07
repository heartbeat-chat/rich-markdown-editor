"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPlaceholder = void 0;
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const embedPlaceholder = new prosemirror_state_1.Plugin({
    state: {
        init() {
            return prosemirror_view_1.DecorationSet.empty;
        },
        apply(tr, set) {
            set = set.map(tr.mapping, tr.doc);
            const action = tr.getMeta(this);
            if (action === null || action === void 0 ? void 0 : action.add) {
                const element = document.createElement("div");
                element.className = "embed-placeholder";
                const text = document.createElement("p");
                text.innerHTML = "✨ Embed loading...";
                element.appendChild(text);
                const deco = prosemirror_view_1.Decoration.widget(action.add.pos, element, {
                    id: action.add.id,
                });
                set = set.add(tr.doc, [deco]);
            }
            if (action === null || action === void 0 ? void 0 : action.remove) {
                set = set.remove(set.find(null, null, spec => spec.id === action.remove.id));
            }
            return set;
        },
    },
    props: {
        decorations(state) {
            return this.getState(state);
        },
    },
});
exports.default = embedPlaceholder;
function findPlaceholder(state, id) {
    const decos = embedPlaceholder.getState(state);
    const found = decos.find(null, null, spec => spec.id === id);
    return found.length ? [found[0].from, found[0].to] : null;
}
exports.findPlaceholder = findPlaceholder;
//# sourceMappingURL=embedPlaceholder.js.map