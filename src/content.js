var storageCache = {};
var _map = {};
var _elems = [];
var _keys = [];
const def_class = 'hightlighter_highlighter_chrome-ext';

function defineNodes(bef, end, content, val) {
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
    return [bef_node, end_node, node];
}

function getHtmlTree(HTMLcoll, old) {
    var m_k = '';
    if (!Array.isArray(HTMLcoll)) {
        HTMLcoll = [HTMLcoll];
    }
    for (var i = 0; i < HTMLcoll.length; i++) {
        if (Array.from(HTMLcoll[i].childNodes).length >= 1) {
            if (old === undefined) {
                m_k = i;
                _keys.unshift(m_k.toString());
            } else {
                m_k = old.toString() + '|' + i.toString();
                var idx = _keys.indexOf(old.toString());
                if (idx > -1) {
                    _keys.splice(idx, 1);
                }
                _keys.unshift(m_k.toString());
            }
            _map[m_k] = HTMLcoll[i];
            HTMLcoll[i] = Array.from(HTMLcoll[i].childNodes);
        }
        if (Array.isArray(HTMLcoll[i]) && HTMLcoll[i].length > 1) {
            HTMLcoll[i] = getHtmlTree(HTMLcoll[i], m_k);
        }
    }
    return HTMLcoll;
}

function recursiveMapEval(elem) {
    if (!Array.isArray(elem)) {
        elem = [elem];
    }
    for (var i = 0; i < elem.length; i++) {
        if (Array.isArray(elem[i])) {
            elem[i] = recursiveMapEval(elem[i])[0];
        }
        var val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
        var nodes = defineNodes(null, null, elem[i].textContent, val);
        if (elem[i].nodeType === 3) {
            elem[i] = nodes[2];
        } else {
            while (elem[i].firstChild) {
                elem[i].removeChild(elem[i].firstChild);
            }
            elem[i].appendChild(nodes[2]);
        }
        _elems.push(val);
    }
    return elem;
}

document.addEventListener('mouseup', function () {
    var sel = window.getSelection();
    if (storageCache.can_exec && sel.toString().length > 0) {
        var sel_r = sel.getRangeAt(0);
        try {
            var elements = sel_r.commonAncestorContainer.getElementsByTagName('*');
            var start = sel_r.startContainer.parentElement;
            var end = sel_r.endContainer.parentElement;
            //var c_ca = sel_r.commonAncestorContainer.cloneNode(true);
            //var c_start = start.cloneNode(true);
            //var c_end = end.cloneNode(true);
            if (!Array.from(elements).includes(start) || !Array.from(elements).includes(end)) {
                elements = sel_r.commonAncestorContainer.parentElement.getElementsByTagName('*');
                //c_ca = sel_r.commonAncestorContainer.parentElement.cloneNode(true);
            }
            var idxs = Array.from(elements).indexOf(start);
            var idxe = Array.from(elements).indexOf(end);
            var temp = [];
            var val = 0;
            _map = {}
            _keys = [];
            for (var i = Math.max(idxs, idxe); i >= Math.min(idxs, idxe); i--) {
                if (elements[i].isSameNode(start)/* && !Array.from(start.classList).includes(def_class)*/) { /////// first node
                    if (Array.from(start.childNodes).length > 1) {
                        for (var elem of start.childNodes) {
                            if (sel_r.startContainer.isSameNode(elem)) {
                                val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                                var nodes = defineNodes(elem.textContent.slice(0, sel_r.startOffset), null, elem.textContent.substring(sel_r.startOffset), val);
                                start.insertBefore(nodes[0], elem);
                                start.insertBefore(nodes[2], elem);
                                start.removeChild(elem);
                                _elems.push(val);
                                temp.unshift(val);
                            }
                        }
                    } else {
                        val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                        var nodes = defineNodes(start.textContent.slice(0, sel_r.startOffset), null, start.textContent.substring(sel_r.startOffset), val);
                        while (start.firstChild) {
                            start.removeChild(start.firstChild);
                        }
                        start.appendChild(nodes[0]);
                        start.appendChild(nodes[2]);
                        _elems.push(val);
                        temp.unshift(val);
                    }
                }
                if (elements[i].isSameNode(end)/* && !Array.from(end.classList).includes(def_class)*/) { /////// last node
                    if (Array.from(end.childNodes).length > 1) {
                        for (var elem of end.childNodes) {
                            if (sel_r.endContainer.isSameNode(elem)) {
                                val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                                var nodes = defineNodes(null, elem.textContent.slice(sel_r.endOffset), elem.textContent.substring(0, sel_r.endOffset), val);
                                end.insertBefore(nodes[2], elem);
                                end.insertBefore(nodes[1], elem);
                                end.removeChild(elem);
                                _elems.push(val);
                                temp.push(val);
                            }
                        }
                    } else {
                        val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                        var nodes = defineNodes(null, end.textContent.slice(sel_r.endOffset), end.textContent.substring(0, sel_r.endOffset), val);
                        while (end.firstChild) {
                            end.removeChild(end.firstChild);
                        }
                        end.appendChild(nodes[2]);
                        end.appendChild(nodes[1]);
                        _elems.push(val);
                        temp.push(val);
                    }
                }
            }
            sel_r.setStartAfter(document.getElementById(temp[0]));
            sel_r.setEndBefore(document.getElementById(temp[1]));
            var between = Array.from(sel_r.extractContents().childNodes);
            between = getHtmlTree(between);
            /*
            var idx_s = [];
            var idx_e = [];
            for(var i = 0; i<between.length; i++) {
                var check = between[i];
                if(Array.isArray(check)) {
                    check = _map[i];
                }
                for (var elem of Array.from(c_start.childNodes)) {
                    if(elem.isEqualNode(check.firstChild)) {
                        idx_s.push(i);
                        break;
                    }
                }
                for (var elem of Array.from(c_end.childNodes)) {
                    if(elem.isEqualNode(check.firstChild)) {
                        idx_e.push(i);
                        break;
                    }
                }
            }*/
            for (var i = 0; i < _keys.length; i++) {
                var fullK = _keys[i].split('|');
                var ch = between[fullK[0]];
                for (var j = 1; j < fullK.length; j++) {
                    ch = ch[fullK[j]];
                }
                var par = _map[fullK.join('|')];
                while (par.firstChild) {
                    par.removeChild(par.firstChild);
                }
                for (var elem of ch) {
                    elem = recursiveMapEval(elem)[0];
                    par.appendChild(elem);
                }
                _map[fullK.join('|')] = par;
            }
            for (const entry of Object.entries(_map)) {
                if (entry[0].split('|').length === 1) {
                    between[entry[0]] = entry[1];
                }
            }
            for (var i = between.length - 1; i >= 0; i--) {
                if (between[i].nodeType === 3) {
                    val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                    var nodes = defineNodes(null, null, between[i].textContent, val);
                    between[i] = nodes[2];
                    _elems.push(val);
                } else if (between[i].hasChildNodes()) {
                    for (var elem of between[i].childNodes) {
                        val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                        var nodes = defineNodes(null, null, elem.textContent, val);
                        if (elem.nodeType === 3) {
                            between[i].replaceChild(nodes[2], elem);
                        }
                        _elems.push(val);
                    }
                }
            }
            for (var i = between.length - 1; i >= 0; i--) {
                sel_r.insertNode(between[i].cloneNode(true))
            }
        } catch {
            var val = 0;
            var e = sel_r.startContainer;
            for (var elem of e.parentElement.childNodes) {
                if (e.isSameNode(elem) && !Array.from(e.parentElement.classList).includes(def_class)) {
                    val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
                    var nodes = defineNodes(e.textContent.slice(0, sel_r.startOffset), e.textContent.slice(sel_r.endOffset), sel.toString(), val)
                    e.parentElement.replaceChild(nodes[2], elem);
                    nodes[2].parentNode.insertBefore(nodes[0], nodes[2]);
                    nodes[2].parentNode.insertBefore(nodes[1], nodes[2].nextSibling);
                    _elems.push(val);
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