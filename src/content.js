var storageCache = {};
var _elems = [];
const def_class = 'hightlighter_highlighter_chrome-ext';

function defineNodes(bef, end, content, ct) {
    var val = (new Date().valueOf()).toString() + '_' + ct;
    var bef_node = '';
    var end_node = '';
    if (bef !== null) {
        bef_node = document.createTextNode(bef);
    }
    if (end !== null) {
        end_node = document.createTextNode(end);
    }
    var node = document.createElement('span');
    node.id = val;
    node.className = def_class;
    node.style.backgroundColor = "#ffff66";
    node.textContent = content;
    node.addEventListener('mouseenter', function () { enter(val) }, false);
    node.addEventListener('mouseleave', function () { leave() }, false);
    _elems.push(val);
    return [bef_node, end_node, node];
}

document.addEventListener('mouseup', function () {
    var sel = window.getSelection();
    if (storageCache.can_exec && sel.toString().length > 0) {
        var sel_r = sel.getRangeAt(0);
        try {
            var elements = sel_r.commonAncestorContainer.getElementsByTagName('*');
            var start = sel_r.startContainer.parentElement;
            var end = sel_r.endContainer.parentElement;
            if (!Array.from(elements).includes(start) || !Array.from(elements).includes(end)) {
                elements = sel_r.commonAncestorContainer.parentElement.getElementsByTagName('*');
            }
            var flag = false;
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].isSameNode(start) && !Array.from(start.classList).includes(def_class)) { /////// first node
                    if (Array.from(start.childNodes).length > 1) {
                        for (var elem of start.childNodes) {
                            if (sel_r.startContainer.isSameNode(elem)) {
                                var nodes = defineNodes(elem.textContent.slice(0, sel_r.startOffset), null, elem.textContent.substring(sel_r.startOffset), i);
                                start.insertBefore(nodes[0], elem);
                                start.insertBefore(nodes[2], elem);
                                start.removeChild(elem);
                            }
                        }
                    } else {
                        var nodes = defineNodes(start.textContent.slice(0, sel_r.startOffset), null, start.textContent.substring(sel_r.startOffset), i);
                        while (start.firstChild) {
                            start.removeChild(start.firstChild);
                        }
                        start.appendChild(nodes[0]);
                        start.appendChild(nodes[2]);
                    }
                    flag = true
                } else if (elements[i].isSameNode(end) && !Array.from(end.classList).includes(def_class)) { /////// last node
                    if (Array.from(end.childNodes).length > 1) {
                        for (var elem of end.childNodes) {
                            if (sel_r.endContainer.isSameNode(elem)) {
                                var nodes = defineNodes(null, elem.textContent.slice(sel_r.endOffset), elem.textContent.substring(0, sel_r.endOffset), i);
                                end.insertBefore(nodes[2], elem);
                                end.insertBefore(nodes[1], elem);
                                end.removeChild(elem);
                            }
                        }
                    } else {
                        var nodes = defineNodes(null, end.textContent.slice(sel_r.endOffset), end.textContent.substring(0, sel_r.endOffset), i);
                        while (end.firstChild) {
                            end.removeChild(end.firstChild);
                        }
                        end.appendChild(nodes[2]);
                        end.appendChild(nodes[1]);
                    }
                    flag = false;
                } else if (flag) {
                    console.log(elements[i].textContent)
                }
            }
        } catch (er) {
            console.log(er)
            var e = sel_r.startContainer;
            for (var elem of e.parentElement.childNodes) {
                if (e.isSameNode(elem) && !Array.from(e.parentElement.classList).includes(def_class)) {
                    var nodes = defineNodes(e.textContent.slice(0, sel_r.startOffset), e.textContent.slice(sel_r.endOffset), sel.toString(), 0)
                    e.parentElement.replaceChild(nodes[2], elem);
                    nodes[2].parentNode.insertBefore(nodes[0], nodes[2]);
                    nodes[2].parentNode.insertBefore(nodes[1], nodes[2].nextSibling);
                }
            }
        }
        sel_r.setStart(document, 0);
        sel_r.setEnd(document, 0);
    }
});

const x_id = (new Date().valueOf()).toString();
var timer;

var enter = function (id) {
    if (storageCache.can_exec) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            var elem = document.getElementById(x_id);
            var bounding = document.getElementById(id).getBoundingClientRect();
            elem.setAttribute('referral', id);
            elem.style.left = (Math.round(bounding.left) + Math.round(bounding.width) + window.scrollX - 20) + 'px';
            elem.style.top = (Math.round(bounding.top) + window.scrollY - 15) + 'px';
            elem.hidden = false;
        }, 600);
    }
};

var leave = function () {
    if (storageCache.can_exec) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            document.getElementById(x_id).hidden = true;
        }, 800);
    }
};

var stopTimer = function () {
    if (storageCache.can_exec) {
        window.clearTimeout(timer);
    }
}

var deleteHighlight = function (id) {
    if (storageCache.can_exec) {
        if (id === 'last') {
            id = _elems.pop();
        } else {
            var idx = _elems.indexOf(id);
            if (idx >= 0) {
                _elems.splice(idx, 1);
            }
        }
        var element = document.getElementById(id);
        var parent = element.parentElement;
        parent.replaceChild(document.createTextNode(element.textContent), element);
        parent.normalize();
        document.getElementById(x_id).hidden = true;
    }
}

function copyToClipBoard() {
    if (storageCache.can_exec) {
        var content = '';
        var elements = document.getElementsByClassName(def_class);
        for (var element of elements) {
            content += element.innerText;
        }
        if (content != '') {
            var temp = document.createElement('textarea');
            document.body.appendChild(temp);
            temp.value = content;
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            alert('Lines successfully copied to clipboard!');
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'c') {
        copyToClipBoard();
    } else if (event.ctrlKey && event.key === 'z') {
        deleteHighlight('last');
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.storage?.newValue) {
        storageCache = changes.storage.newValue;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'copy_clp':
            copyToClipBoard();
            break;
        case 'storage_cache':
            storageCache = message.mem_cache.storage;
            break;
    }
    return true;
});

var node = document.createElement('div');
node.id = x_id;
node.className = 'close_highlighter_chrome-ext';
node.hidden = true;
node.addEventListener('click', function () { deleteHighlight(this.getAttribute('referral')) }, false);
node.addEventListener('mouseenter', function () { stopTimer() }, false);
node.addEventListener('mouseleave', function () { leave() }, false);
document.body.appendChild(node);