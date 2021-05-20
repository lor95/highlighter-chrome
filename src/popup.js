const storage = {};
const storageCache = {};

chrome.storage.sync.get('storage', (data) => {
  Object.assign(storage, data.storage);
  sw_elem.checked = Boolean(storage.can_exec);
  if(!sw_elem.checked) {
    span_sw_elem_icon.className = 'fas fa-ban';
  } else {
    span_sw_elem_icon.className = 'fas fa-highlighter';
  }
});

sw_elem.addEventListener('change', (event) => {
  storage.can_exec = event.target.checked;
  if(!event.target.checked) {
    span_sw_elem_icon.className = 'fas fa-ban';
  } else {
    span_sw_elem_icon.className = 'fas fa-highlighter';
  }
  chrome.storage.sync.set({ storage });
});

copy_clp.addEventListener('click', (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'copy_clp' });
  });
});

const initStorageCache = getAllStorageSyncData().then(items => {
  Object.assign(storageCache, items);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'storage_cache', 'mem_cache': storageCache });
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
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}