<template>
  <div>
    <v-row>
      <v-col>
        <v-label class="pl-2 pt-2 text-subtitle-2" @click="resetCurrent">PTO
          <v-icon class="ml-2" icon="$reload" v-if="!form.show" title="Refresh" aria-label="Refresh"></v-icon>
        </v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="form.show">/</v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="current[id]!==undefined && form.show">{{current.name}}</v-label>
        <v-select
        :items="sprints"
        id="sprint-select"
        density="compact"
        name="spid"
        item-title="name"
        item-value="spid"
        v-model="form.spid"
        @update:modelValue="onSprintChange"
        hide-details
        :single-line="true"
        aria-label="Sprint"
        label="Sprint"
      ></v-select>
      </v-col>
    </v-row>
    <v-divider class="mt-2"></v-divider>
    <v-row class="d-sm-none" no-gutters>
      <v-col class="pr-0 pl-0" v-if="!form.show">
        <v-form v-model="form.valid">
          <v-container class="pr-0">
            <user-list-item v-for="(user, index) in members" :theme="props.theme" :model-value="user" :index="index" @click="onSelect">
            </user-list-item>
          </v-container>
        </v-form>
      </v-col>
      <v-col class="bg-grey-darken-3" v-if="form.show">
        <pto-input-form :member="current"></pto-input-form>
      </v-col>
    </v-row>
    <v-row class="d-none d-sm-flex" no-gutters>
      <v-col class="pr-0 pl-0">
        <v-form>
          <user-list-item v-for="(user, index) in members" :theme="props.theme" :model-value="user" :index="index" :selected="user[id]===current[id]" @click="onSelect">
          </user-list-item>
        </v-form>
      </v-col>
      <v-col class="bg-grey-darken-3">
        <pto-input-form :member="current"></pto-input-form>
      </v-col>
    </v-row>
    <v-btn v-if="form.show" class="w-100 mt-2 d-sm-none" @click="resetCurrent">Cancel</v-btn>
  </div>
</template>

<script setup>
import UserListItem from "./userListItem";
import { ref, reactive, onMounted, defineProps, watch } from 'vue'
import u from '@/lib/util';
import axios from "axios";
import {v4 as uuid4} from "uuid";
import { db } from '@/lib/db';
import PtoInputForm from "@/components/ptoInputForm";
import event from '@/lib/event';

const props=defineProps({
  oid:String,
  pid:String,
  mid:String,
  theme:String
})

const module = "pto";
const id = "mid";
const list = reactive([]);
const sprints = reactive([]);
const members = reactive([]);

const endpoint = import.meta.env.VITE_TARGET;
const current  = reactive({name:'Chris Doty'});
const mobile  = reactive({name:'Chris Doty'});
const form = reactive({valid:false,show:false,spid:null});
const $form = ref(null);

function required (v) {
  return !!v || 'Field is required'
}

function resetCurrent() {
  u.clearExtend(current,mobile);
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
  u.clearExtend(mobile,item);
  console.info('selected '+item[id]);
  form.show=true;
}

function onDelete(item) {
  axios.delete(endpoint+"/pto/"+item.oid+"/"+item.id).then((response)=>{
    if(current[id]===item[id]) resetCurrent();
    rebuild(response.data);
  })
}

function onAdd() {
  current.id = uuid4();
  current.oid = props.oid;
  current.pid = props.pid;

  if (current.name=="") return;
  axios.post(endpoint+"/pto",current).then((response)=>{
    rebuild(response.data);
    resetCurrent();
  });
}

function onUpdate() {
  if (current.name=="") return;
  axios.put(endpoint+"/pto/"+current.oid+"/"+current.id,current).then((response)=>{
    rebuild(response.data);
    resetCurrent();
  });
}

function onSprintChange(spid) {
  form.spid = spid;
  localStorage.setItem('spid',spid);
}

function sortList(sortedList,sortBy){
  let list = u.clearExtend([],sortedList);
  list.sort((p1,p2) => {
    let modifier = 1;
    //if(this.sortDirection === 'desc') modifier = -1;
    sortBy = sortBy || "name";
    if(p1[sortBy] < p2[sortBy]) return -1 * modifier; if(p1[sortBy] > p2[sortBy]) return 1 * modifier;
    return 0;
  });
  u.clearExtend(sortedList,list);
}

function refresh() {
  list.length=0;
  list.push({
    name: "Loading..."
  });
  event.emit('loading',module);
  let oid=props.oid;
  event.emit('sync',{oid,module});
}
async function reload(fill,mod) {
  fill.length = 0;
  if (db[mod] !== undefined) {
    await db[mod].each((item) => {
      fill.push(item);
    });
  }
  if(mod==='member') {
    sortList(fill,'name')
  }
  if(mod==='sprint') {
    sortList(fill,'firstDay')
  }  
  return fill;
}
async function refreshed(mod) {
  u.clearExtend(sprints,await reload([],'sprint'));
  u.clearExtend(members,await reload([],'member'));
  u.clearExtend(list,await reload([],'pto'));
}

onMounted(async ()=>{
  event.on('refreshed', "panel", refreshed);
  //refresh();
  await refreshed();

  // make sure we have a sprint selected
  form.spid = localStorage.getItem('spid');
  if(!form.spid && sprints.length>0) {
    onSprintChange(sprints[0].spid);
  }

  // now force currently selected to current user if we can
  for(let i=0;i<members.length;i++) {
    if(members[i].mid===props.mid) {
      onSelect(members[i]);
      return;
    }
  }
});
</script>

<style lang="scss" scoped>
.v-row.selectable:hover {
  background-color: #333333;
  cursor: pointer;
}
</style>
