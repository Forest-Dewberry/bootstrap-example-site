<script setup lang="ts">
import { onBeforeMount } from 'vue'
import MyWorker from './my-worker?worker'

import ReloadPrompt from './ReloadPrompt.vue'
import event from './lib/event';
const worker = new MyWorker()

const sync = async (data) => {
  data=data||{};
  let oid = data.oid||localStorage.getItem('oid');
  console.debug('sync postingMessage',oid);
  worker.postMessage({event:"sync",oid,module:data.module})
}
const messageFromWorker = async ({ data: { msg, data } }) => {
  console.debug('messageFromWorker sync message',{ msg, data });
  event.emit(msg,data)
}

onBeforeMount(() => {
  event.on('sync',"app", sync);
  worker.addEventListener('message', messageFromWorker)
})
</script>

<template>
  <div>
  <router-view></router-view>
  <ReloadPrompt />
  </div>
</template>

