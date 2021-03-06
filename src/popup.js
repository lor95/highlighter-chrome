const storage = {};

sw_elem.addEventListener('change', (event) => {
    chrome.storage.sync.set({ 'can_exec': event.target.checked });
    if (!event.target.checked) {
        span_sw_elem_icon.className = 'fas fa-ban';
    } else {
        span_sw_elem_icon.className = 'fas fa-highlighter';
    }
    storage.can_exec = event.target.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'popup_open', 'cache': storage });
    });
});

copy_clp.addEventListener('click', (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'copy_clp' });
    });
});

const initStorageCache = getAllStorageSyncData().then(items => {
    Object.assign(storage, items);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'popup_open', 'cache': storage });
    });
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        await initStorageCache;
    } catch (e) {
    }
});

function getAllStorageSyncData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (items) => {
            sw_elem.checked = Boolean(items.can_exec);
            if (!sw_elem.checked) {
                span_sw_elem_icon.className = 'fas fa-ban';
            } else {
                span_sw_elem_icon.className = 'fas fa-highlighter';
            }
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(items);
        });
    });
}