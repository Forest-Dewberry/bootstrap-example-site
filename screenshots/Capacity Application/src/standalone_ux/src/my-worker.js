import { mode, msg } from '../src/workerImport'
import axios from "axios";
import { db } from './lib/db';

const endpoint = import.meta.env.VITE_TARGET;

const getSync = async function (oid) {
  let sync = null;
  try {
    await db.sync.where({"oid":oid,"typ":"sync"}).each((item) => {
      if(item.oid===oid)
        sync=JSON.parse(item.sync);
    });
  } catch {
  }
  return sync;
};

const setSync = async function (oid,sync) {
  try {
    await db.sync
      .where({"oid":oid,"typ":"sync"})
      .delete();
    await db.sync.add({oid: oid, typ:"sync", sync: JSON.stringify(sync)});
  } catch {
  }
};

async function syncModule(module, oid) {
  return axios.get(endpoint + '/' + module + (module !== 'org' ? "/" + oid : "")).then(async (response) => {
    await db[module].clear();
    await db[module].bulkAdd(response.data);
    self.postMessage({msg: 'refreshed', data: module});
    console.log('refreshed', module);
  });
}

function onSync(oid, module) {
  axios.get(endpoint + '/sync/' + oid).then(async (response) => {
    let sync = await getSync(oid);
      sync=sync||{};
      let modules = ["org", "project", "sprint", "holiday", "member"];
      for (let i = 0; i < modules.length; i++) {
        module=modules[i];
        if(sync[module] !== response.data[module]) {
          await syncModule(modules[i], oid).then(async () => {
            sync[module] = response.data[module];
            await setSync(oid, sync);
          });
        }
      }
  });
}

self.onmessage = (e) => {
  let event = e.data.event;
  console.log("worker onmessage",e.data);
  if (event === 'sync') {
    onSync(e.data.oid, e.data.module);
  }
}
