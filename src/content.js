var storageCache = {}
const def_class = "highlighter_chrome-ext"
document.addEventListener('mouseup', function () {
    if (storageCache.can_exec) {
        sel = window.getSelection();
        if (sel.toString().length > 0) {
            var sel_r = sel.getRangeAt(0)
            try {
                var elements = sel_r.commonAncestorContainer.getElementsByTagName("*");
                debugger
            } catch {
                var e = sel_r.startContainer;
                for (var elem of e.parentElement.childNodes) {
                    if (e.isSameNode(elem)) {
                        if (!Array.from(e.parentElement.classList).includes(def_class)) {
                            var bef_node = e.textContent.slice(0, sel_r.startOffset);
                            var end_node = e.textContent.slice(sel_r.endOffset);
                            var node = document.createElement('span')
                            node.innerHTML = bef_node + '<span class="' + def_class + '" style="background-color:yellow">' + sel.toString() + '</span>' + end_node
                            e.parentElement.replaceChild(node, elem)
                        }
                    }
                }
            }
        }
    }
})

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.storage?.newValue) {
        storageCache = changes.storage.newValue;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    storageCache = message.storage
    return true
});