<template>
  <div>
    <v-row>
      <v-col>
        <v-label class="pl-2 pt-2 text-subtitle-2" @click="resetCurrent">Organizations
          <v-icon class="ml-2" icon="$reload" @click.stop="refresh" v-if="!form.show" title="Refresh" aria-label="Refresh"></v-icon>
        </v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="form.show">/</v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="current[id]!==undefined && form.show">{{form.name}}</v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="current[id]===undefined && form.show">New Organization</v-label>
      </v-col>
    </v-row>
    <v-divider class="mt-2"></v-divider>
    <v-container v-if="form.show">
       <v-form v-model="form.valid" ref="$form">
          <v-text-field density="compact" label="Name" v-model="current.name" :rules="[required]"></v-text-field>
          <v-row>
            <v-col class="v-col-12 v-col-md-4">
              <v-btn prepend-icon="$add" color="indigo" @click="onAdd" v-if="current[id]===undefined" :disabled="!form.valid || form.sending" class="w-100">Add Organization</v-btn>
              <v-btn prepend-icon="$save" color="indigo" @click="onUpdate" v-if="current[id]!==undefined" :disabled="!form.valid || form.sending" class="w-100">Save Changes</v-btn>
            </v-col>
            <v-col class="v-col-12 v-col-md-4">
              <v-btn @click="resetCurrent"  class="w-100">Cancel</v-btn>
            </v-col>
            <v-col class="v-col-12 v-col-md-4">
              <v-btn prepend-icon="$delete" color="error" @click="onConfirm" v-if="current[id]!==undefined" :disabled="form.sending" class="w-100">Delete</v-btn>
            </v-col>
          </v-row>
       </v-form>
    </v-container>
    <v-container v-if="!form.show">
      <v-row :class="selectedColor(item,'selectable')" v-for="item in sortedListed()">
        <v-col @click="onSelect(item)" class="pl-2">{{item.name}}</v-col>
        <v-col cols="1"><v-icon :icon="'$right'" @click="onSelect(item)" :title="'Select '+item.name" :aria-label="'Select '+item.name"></v-icon></v-col>
      </v-row>
      <v-btn prepend-icon="$add" color="indigo" @click="onNew" class="w-100 mt-16">New Organization</v-btn>
    </v-container>
    <v-dialog
      v-model="form.confirm"
      width="auto"
    >
      <v-card>
        <v-card-text>
          Are you sure you wish to delete the {{current.name}} organiztion?
        </v-card-text>
        <v-card-actions>
          <v-btn color="warning" @click="onDelete">Yes</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" @click="form.confirm = false" :disabled="form.sending">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, watch } from 'vue'
import u from '@/lib/util';
import axios from "axios";
import {v4 as uuid4} from "uuid";
import { db } from '@/lib/db';
import event from '@/lib/event';

const props=defineProps({
})

const module = "org"
const id = "id";
const list = reactive([{
  name: "Loading.."
}]);

const endpoint = import.meta.env.VITE_TARGET;
const current = reactive({name:''});
const form = reactive({valid:false,show:false,confirm:false,sending:false,name:""});
const $form = ref(null);

function selectedColor(item,base) {
  return base + (current[id]!=undefined && (current[id]===item[id] ? " bg-grey-darken-2" : ""));
}

function required (v) {
  return !!v || 'Field is required'
}

function resetCurrent() {
  u.clear(current);
  if($form && $form.reset) $form.reset();
  form.show=false;
  form.confirm=false;
  form.sending=false;
}

async function rebuild(data) {
  u.clearExtend(list,data);
  await db[module].clear();
  await db[module].bulkAdd(data);
  console.debug(data);
}

function onSelect(item) {
  u.clearExtend(current,item);
  console.info('selected '+item[id]);
  form.name=current.name;
  form.show=true;
}

function onDelete() {
  form.sending=true;
  axios.delete(endpoint+"/"+module+"/"+current.oid+"/"+current[id]).then((response)=>{
    resetCurrent();
    rebuild(response.data);
  })
}

function onNew() {
  resetCurrent();
  form.show=true;
}

function onConfirm() {
  form.confirm=true;
}

function onAdd() {
  current.id = uuid4();
  current.oid = uuid4();
  if (current.name=="") return;
  form.sending=true;
  axios.post(endpoint+"/"+module,current).then((response)=>{
    rebuild(response.data);
    resetCurrent();
  });
}

function onUpdate() {
  if (current.name=="") return;
  form.sending=true;
  axios.put(endpoint+"/"+module+"/"+current.oid+"/"+current[id],current).then((response)=>{
    rebuild(response.data);
    resetCurrent();
  });
}

function sortedListed(){
  return list.sort((p1,p2) => {
      let modifier = 1;
      //if(this.sortDirection === 'desc') modifier = -1;
      let sortBy = "name";
      if(p1[sortBy] < p2[sortBy]) return -1 * modifier; if(p1[sortBy] > p2[sortBy]) return 1 * modifier;
      return 0;
  });
}

function refresh() {
  list.length=0;
  list.push({
    name: "Loading..."
  });
  event.emit('loading',module);
  let oid=localStorage.getItem('oid') || "00000000-0000-0000-0000-000000000000";
  event.emit('sync',{oid,module});
}
async function refreshed(mod) {
  if(mod!=undefined && mod!=='all' && mod!==module) return;
  list.length = 0;
  if (db[module] !== undefined) {
    await db[module].each((item) => {
      list.push(item);
    });
  }
}

onMounted(async ()=>{
  event.on('refreshed', "panel", refreshed);
  refresh();
  await refreshed();
});
</script>

<style lang="scss" scoped>
.v-row.selectable:hover {
  background-color: #333333;
  cursor: pointer;
}
</style>
