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
                            var node = document.createElement('span');
                            var val = (new Date().valueOf()).toString();
                            node.innerHTML = bef_node + '<span id="' + val
                                            + '" class="' + def_class 
                                            + '" style="background-color:yellow">' + sel.toString() 
                                            + '</span>' + end_node;
                            e.parentElement.replaceChild(node, elem);
                            document.getElementById(val).addEventListener('mouseenter', function(event) {enter(event, this.id)}, false);
                            document.getElementById(val).addEventListener('mouseleave', function(event) {leave(event, this.id)}, false);
                        }
                    }
                }
            }
        }
    }
})

const x_id = (new Date().valueOf()).toString();
var timer;

var enter = function(event, id) {
    /*
    window.clearTimeout(timer)
    timer = window.setTimeout(function() {
        var elem = document.getElementById(x_id)
        var bounding = document.getElementById(id).getBoundingClientRect();
        elem.setAttribute("referral",id);
        elem.style.left = (Math.round(bounding.left) + Math.round(bounding.width) + window.scrollX - 20) + "px";
        elem.style.top = (bounding.top + window.scrollY - 15) + "px";
        elem.hidden = false;
    }, 700)
    */
};
var leave = function(event, id) {
    /*
    window.clearTimeout(timer)
    timer = window.setTimeout(function() {
        document.getElementById(x_id).hidden = true;
    }, 700)
    */
};

function copyToClipBoard() {
    var content = '';
    var elements = document.getElementsByClassName(def_class);
    for(var element of elements) {
        content += element.innerText;
    }
    var temp = document.createElement("textarea");
    document.body.appendChild(temp);
    temp.value = content;
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.storage?.newValue) {
        storageCache = changes.storage.newValue;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'copy_clp':
            copyToClipBoard()
            break;
        case 'storage_cache':
            storageCache = message.mem_cache.storage
            break;
    }
    return true
});

var node = document.createElement('div');
node.id = x_id;
node.className = "close";
node.hidden = true;
/*
node.addEventListener('click', function() {  }, false);
node.addEventListener('mouseenter', function() {  }, false);
node.addEventListener('mouseleave', function(event) { leave(event, this.getAttribute("referral")) }, false);
*/
document.body.appendChild(node);