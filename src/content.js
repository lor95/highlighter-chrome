var storage = {};
var _map = {};
var _elems = [];
var _keys = [];
var _temp_ids = [];
var timer;
var timer_s;
var color_std;
var color_0;
var color_1;
var color_2;
var color_3;
const def_class = 'hightlighter_highlighter_chrome-ext';
const x_id = (new Date().valueOf()).toString();
const c_id = (new Date().valueOf()).toString() + '_c_';
const s_id = (new Date().valueOf()).toString() + '_s';

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
    node.style.backgroundColor = color_std;
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
    if (storage.can_exec && sel.toString().length > 0) {
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

var enter = function (id) {
    if (storage.can_exec) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            var elem = document.getElementById(x_id);
            var del_elem = document.getElementById(id);
            var bounding = del_elem.getBoundingClientRect();
            document.getElementById(x_id + '_btn').setAttribute('referral', del_elem.getAttribute('ref-elem'));
            elem.style.left = (Math.round(bounding.left) + Math.round(bounding.width) + window.scrollX - 120) + 'px';
            elem.style.top = (Math.round(bounding.top) + window.scrollY - 26) + 'px';
            elem.hidden = false;
        }, 600);
    }
};

var leave = function () {
    if (storage.can_exec) {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            document.getElementById(x_id).hidden = true;
        }, 800);
    }
};

var stopTimer = function () {
    if (storage.can_exec) {
        window.clearTimeout(timer);
    }
}

var colorChange = function (id) {
    if (storage.can_exec) {
        id = 'c_' + id.slice(-1);
        var colors = {};
        chrome.storage.sync.get(function (data) {
            data.colors['c_std'] = data.colors[id];
            data.colors[id] = color_std;
            colors = data.colors;
            chrome.storage.sync.set({ 'colors': colors });
            for (var element of document.querySelectorAll('[ref-elem="' + document.getElementById(x_id + '_btn').getAttribute('referral') + '"]')) {
                element.style.backgroundColor = data.colors['c_std'];
            }
            reloadColors();
        });
    }
}

function reloadColors() {
    chrome.storage.sync.get('colors', (data) => {
        color_std = data.colors.c_std;
        color_0 = data.colors.c_0;
        color_1 = data.colors.c_1;
        color_2 = data.colors.c_2;
        color_3 = data.colors.c_3;
        document.getElementById(c_id + '0').style.backgroundColor = color_0;
        document.getElementById(c_id + '1').style.backgroundColor = color_1;
        document.getElementById(c_id + '2').style.backgroundColor = color_2;
        document.getElementById(c_id + '3').style.backgroundColor = color_3;
    });
}

var closeDiv = function (ref_id) {
    if (storage.can_exec) {
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
    if (storage.can_exec) {
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
        closeDiv('last');
    } else if (event.ctrlKey && event.key === 'r') { // reload (debug)
        var colors = { 'c_std': '#ff6', 'c_0': '#7d7', 'c_1': '#80cee1', 'c_2': '#ffb347', 'c_3': '#b19cd9' };
        chrome.storage.sync.set({ 'colors': colors });
        reloadColors();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case 'copy_clp':
            copyToClipBoard();
            break;
        case 'popup_open':
            storage = message.cache;
            break;
    }
    return true;
});

var node_x = document.createElement('div');
node_x.id = x_id;
node_x.className = 'floatdiv_highlighter_chrome-ext';
node_x.innerHTML = '<span id="' + c_id + '0" class="colorspan_highlighter_chrome-ext"></span>' +
    '<span id="' + c_id + '1" class="colorspan_highlighter_chrome-ext"></span>' +
    '<span id="' + c_id + '2" class="colorspan_highlighter_chrome-ext"></span>' +
    '<span id="' + c_id + '3" class="colorspan_highlighter_chrome-ext"></span>' +
    '<span><i id="' + x_id + '_btn" class="fas fa-times"></i></span>';
node_x.hidden = true;
node_x.addEventListener('mouseenter', function () { stopTimer() }, false);
node_x.addEventListener('mouseleave', function () { leave() }, false);
document.body.appendChild(node_x);
for (var color_elem of document.getElementsByClassName('colorspan_highlighter_chrome-ext')) {
    color_elem.addEventListener('click', function () { colorChange(this.id) }, false);
}
document.getElementById(x_id + '_btn').addEventListener('click', function () { closeDiv(this.getAttribute('referral')) }, false);

var node_s = document.createElement('div');
node_s.id = s_id;
node_s.className = 'cop_lines_highlighter_chrome-ext';
node_s.innerHTML = 'Lines successfully copied to clipboard!';
node_s.hidden = true;
var animation_s = node_s.animate({ bottom: 0, opacity: 0 }, 3500);
animation_s.finish();
document.body.appendChild(node_s);

chrome.storage.sync.get(function (data) {
    if (data.can_exec === undefined || data.colors === undefined) {
        let colors = { 'c_std': '#ff6', 'c_0': '#7d7', 'c_1': '#80cee1', 'c_2': '#ffb347', 'c_3': '#b19cd9' };
        chrome.storage.sync.set({ 'can_exec': true, 'colors': colors });
    }
    reloadColors();
});
