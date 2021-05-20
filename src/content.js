var storageCache = {};
var _map = {};
var _elems = [];
var _keys = [];
var _temp_ids = [];
const def_class = 'hightlighter_highlighter_chrome-ext';

function defineNodes(bef, end, content, val) {
    var id = 'hightlighter-elem-id_' + Math.floor(Math.random() * 100000000);
    var bef_node = '';
    var end_node = '';
    if (bef !== null) {
        bef_node = document.createTextNode(bef);
    }
    if (end !== null) {
        end_node = document.createTextNode(end);
    }
    var node = document.createElement('span');
    node.id = id;
    node.setAttribute('ref-elem', val);
    node.className = def_class;
    node.style.backgroundColor = '#ffff66';
    node.textContent = content;
    return [bef_node, end_node, node, id];
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

function recursiveMapEval(elem, val) {
    if (!Array.isArray(elem)) {
        elem = [elem];
    }
    for (var i = 0; i < elem.length; i++) {
        if (Array.isArray(elem[i])) {
            elem[i] = recursiveMapEval(elem[i], val)[0];
        }
        var nodes = defineNodes(null, null, elem[i].textContent, val);
        if (elem[i].nodeType === 3) {
            elem[i] = nodes[2];
        } else {
            while (elem[i].firstChild) {
                elem[i].removeChild(elem[i].firstChild);
            }
            elem[i].appendChild(nodes[2]);
        }
    }
    return elem;
}

document.addEventListener('mouseup', function () {
    var sel = window.getSelection();
    if (storageCache.can_exec && sel.toString().length > 0) {
        var sel_r = sel.getRangeAt(0);
        var _x_val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
        _elems.push(_x_val);
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
            _map = {}
            _keys = [];
            _temp_ids = [];
            for (var i = Math.max(idxs, idxe); i >= Math.min(idxs, idxe); i--) {
                if (elements[i].isSameNode(start)/* && !Array.from(start.classList).includes(def_class)*/) { /////// first node
                    if (Array.from(start.childNodes).length > 1) {
                        for (var elem of start.childNodes) {
                            if (sel_r.startContainer.isSameNode(elem)) {
                                var nodes = defineNodes(elem.textContent.slice(0, sel_r.startOffset), null, elem.textContent.substring(sel_r.startOffset), _x_val);
                                start.insertBefore(nodes[0], elem);
                                start.insertBefore(nodes[2], elem);
                                start.removeChild(elem);
                                _temp_ids.unshift(nodes[3]);
                            }
                        }
                    } else {
                        var nodes = defineNodes(start.textContent.slice(0, sel_r.startOffset), null, start.textContent.substring(sel_r.startOffset), _x_val);
                        while (start.firstChild) {
                            start.removeChild(start.firstChild);
                        }
                        start.appendChild(nodes[0]);
                        start.appendChild(nodes[2]);
                        _temp_ids.unshift(nodes[3]);
                    }
                }
                if (elements[i].isSameNode(end)/* && !Array.from(end.classList).includes(def_class)*/) { /////// last node
                    if (Array.from(end.childNodes).length > 1) {
                        for (var elem of end.childNodes) {
                            if (sel_r.endContainer.isSameNode(elem)) {
                                var nodes = defineNodes(null, elem.textContent.slice(sel_r.endOffset), elem.textContent.substring(0, sel_r.endOffset), _x_val);
                                end.insertBefore(nodes[2], elem);
                                end.insertBefore(nodes[1], elem);
                                end.removeChild(elem);
                                _temp_ids.push(nodes[3]);
                            }
                        }
                    } else {
                        var nodes = defineNodes(null, end.textContent.slice(sel_r.endOffset), end.textContent.substring(0, sel_r.endOffset), _x_val);
                        while (end.firstChild) {
                            end.removeChild(end.firstChild);
                        }
                        end.appendChild(nodes[2]);
                        end.appendChild(nodes[1]);
                        _temp_ids.push(nodes[3]);
                    }
                }
            }
            sel_r.setStartAfter(document.getElementById(_temp_ids[0]));
            sel_r.setEndBefore(document.getElementById(_temp_ids[1]));
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
                    elem = recursiveMapEval(elem, _x_val)[0];
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
                    var nodes = defineNodes(null, null, between[i].textContent, _x_val);
                    between[i] = nodes[2];
                } else if (between[i].hasChildNodes()) {
                    for (var elem of between[i].childNodes) {
                        var nodes = defineNodes(null, null, elem.textContent, _x_val);
                        if (elem.nodeType === 3) {
                            between[i].replaceChild(nodes[2], elem);
                        }
                    }
                }
            }
            for (var i = between.length - 1; i >= 0; i--) {
                sel_r.insertNode(between[i].cloneNode(true))
            }
        } catch {
            var _x_val = (new Date().valueOf()).toString() + '_' + Math.floor(Math.random() * 1000000);
            var e = sel_r.startContainer;
            for (var elem of e.parentElement.childNodes) {
                if (e.isSameNode(elem) && !Array.from(e.parentElement.classList).includes(def_class)) {
                    var nodes = defineNodes(e.textContent.slice(0, sel_r.startOffset), e.textContent.slice(sel_r.endOffset), sel.toString(), _x_val)
                    e.parentElement.replaceChild(nodes[2], elem);
                    nodes[2].parentNode.insertBefore(nodes[0], nodes[2]);
                    nodes[2].parentNode.insertBefore(nodes[1], nodes[2].nextSibling);
                }
            }
        }
        sel_r.setStart(document, 0);
        sel_r.setEnd(document, 0);
        var elements = document.querySelectorAll('[ref-elem="' + _x_val + '"]');
        for (var element of elements) {
            element.addEventListener('mouseenter', function () { enter(this.id) }, false);
            element.addEventListener('mouseleave', function () { leave() }, false);
        }
    }
});

const x_id = (new Date().valueOf()).toString();
const s_id = (new Date().valueOf()).toString() + '_s';
var timer;
var timer_s;

var enter = function (id) {
    if (storageCache.can_exec) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            var elem = document.getElementById(x_id);
            var del_elem = document.getElementById(id);
            var bounding = del_elem.getBoundingClientRect();
            elem.setAttribute('referral', del_elem.getAttribute('ref-elem'));
            elem.style.left = (Math.round(bounding.left) + Math.round(bounding.width) + window.scrollX - 20) + 'px';
            elem.style.top = (Math.round(bounding.top) + window.scrollY - 20) + 'px';
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

var deleteHighlight = function (ref_id) {
    if (storageCache.can_exec) {
        if (ref_id === 'last') {
            ref_id = _elems.pop();
        } else {
            var idx = _elems.indexOf(ref_id);
            if (idx >= 0) {
                _elems.splice(idx, 1);
            }
        }
        var elements = document.querySelectorAll('[ref-elem="' + ref_id + '"]');
        for (var element of elements) {
            var parent = element.parentElement;
            parent.replaceChild(document.createTextNode(element.textContent), element);
            parent.normalize();
        }
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
            window.clearTimeout(timer_s);
            if (animation_s.playState !== 'finished') {
                animation_s.finish();
            }
            var elem = document.getElementById(s_id);
            var temp = document.createElement('textarea');
            document.body.appendChild(temp);
            temp.value = content;
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            elem.hidden = false;
            animation_s.play();
            timer_s = window.setTimeout(function () {
                document.getElementById(s_id).hidden = true;
            }, 3200);
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

chrome.runtime.onMessage.addListener((message) => {
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

var node_x = document.createElement('div');
node_x.id = x_id;
node_x.className = 'close_highlighter_chrome-ext';
node_x.innerHTML = '<i class="fas fa-times"></i>';
node_x.hidden = true;
node_x.addEventListener('click', function () { deleteHighlight(this.getAttribute('referral')) }, false);
node_x.addEventListener('mouseenter', function () { stopTimer() }, false);
node_x.addEventListener('mouseleave', function () { leave() }, false);
document.body.appendChild(node_x);

var node_s = document.createElement('div');
node_s.id = s_id;
node_s.className = 'cop_lines_highlighter_chrome-ext';
node_s.innerHTML = 'Lines successfully copied to clipboard!';
node_s.hidden = true;
var animation_s = node_s.animate({ bottom: 0, opacity: 0 }, 3500);
animation_s.finish();
document.body.appendChild(node_s);