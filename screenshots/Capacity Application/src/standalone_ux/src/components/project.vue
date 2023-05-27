<template>
  <div>
    <v-row>
      <v-col>
        <v-label class="pl-2 pt-2 text-subtitle-2" @click="resetCurrent">Projects
          <v-icon class="ml-2" icon="$reload" @click.stop="refresh" v-if="!form.show" title="Refresh" aria-label="Refresh"></v-icon>
        </v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="form.show">/</v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="current[id]!==undefined && form.show">{{form.name}}</v-label>
        <v-label class="pl-2 pt-2 text-subtitle-2" v-if="current[id]===undefined && form.show">New Project</v-label>
      </v-col>
    </v-row>
    <v-divider class="mt-2"></v-divider>
    <v-container v-if="form.show">
      <v-form v-model="form.valid" ref="$form">
        <v-text-field density="compact" label="Name" v-model="current.name" :rules="[required]"></v-text-field>
        <v-row>
          <v-col class="v-col-12 v-col-md-4">
            <v-btn prepend-icon="$add" color="indigo" @click="onAdd" v-if="current[id]===undefined" :disabled="!form.valid || form.sending" class="w-100">Add Project</v-btn>
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
      <v-btn prepend-icon="$add" color="indigo" @click="onNew" class="w-100 mt-16">New Project</v-btn>
    </v-container>

    <v-container v-if="form.show && current[id]!==undefined">

      <v-tabs v-model="form.tab" align-tabs="title" class="mb-6">
        <v-tab value="member">
          Members
        </v-tab>
        <v-tab value="sprint">
          Sprints
        </v-tab>
      </v-tabs>

      <v-row v-if="form.tab==='member'" >
        <v-col>
          <v-combobox
            :items="filteredMembers()"
            v-model="selectedMember"
            searh="form.memberSearch"
            clearable
            item-title="name"
            item-value="mid"
            density="comfortable"
            label="Add Team Member"
            @update:modelValue="onSelectMember"
          ></v-combobox>
          <v-row :class="selectedColor(item,'selectable')" v-for="item in projectMembers">
            <v-col @click="onSelect(item)" class="pl-2">{{item.name}}</v-col>
            <v-col cols="1"><v-icon :icon="'$delete'" @click="onRemoveMember(item)" :title="'Select '+item.name" :aria-label="'Remove '+item.name+' from project'"></v-icon></v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="form.tab==='sprint'" >
        <v-col>
          <sprint :oid="props.oid" :pid="current.pid"></sprint>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog
      v-model="form.confirm"
      width="auto"
    >
      <v-card>
        <v-card-text>
          Are you sure you wish to delete this project?
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
import { ref, reactive, onMounted, defineProps, nextTick, watch } from 'vue'
import u from '@/lib/util';
import axios from "axios";
import {v4 as uuid4} from "uuid";
import { db } from '@/lib/db';
import event from '@/lib/event';
import sprint from './sprint';

const props=defineProps({
  oid:String
});

const module = "project"
const id = "pid";
const list = reactive([{
  name: "Loading.."
}]);

const endpoint = import.meta.env.VITE_TARGET;
const projectMembers = reactive([]);
const current = reactive({name:'',oid:'',pid:'',members:projectMembers});
const selectedMember = reactive([]);
const members = reactive([]);
const sprints = reactive([]);
const form = reactive({valid:false,show:false,confirm:false,sending:false,name:"",memberSearch:"",tab:"member",lastMember:{}});

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
  item.members=item.members||[];
  let itemMembers = item.members;           // save members if it has them
  delete item.members;                      // remove before copy
  u.clearExtend(current,item);              // copy in project
  current.members=projectMembers;           // restore the watched array
  u.clearExtend(projectMembers,itemMembers);// finally restore any members attached to project

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
  current[id] = uuid4();
  current.oid = props.oid;
  if (current.name=="") return;
  form.sending=true;
  axios.post(endpoint+"/"+module,current).then((response)=>{
    rebuild(response.data);
    resetCurrent();
  });
}

function onUpdate(reset) {
  if (current.name=="") return;
  form.sending=true;
  axios.put(endpoint+"/"+module+"/"+current.oid+"/"+current[id],current).then((response)=>{
    rebuild(response.data);
    if(reset || reset===undefined) resetCurrent();
  });
}

function resetMemberSearch() {
  form.memberSearch="";
  selectedMember.length=0;
}

function filteredMembers() {
  let filtered = [];
  let list = current.members;
  for(let j=0;j<members.length;j++) {
    let found = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].mid === members[j].mid && list[i].oid === members[j].oid) {
        found=true;
        break;
      }
    }
    if(!found) filtered.push(members[j]);
  }
  return filtered;
}

async function onSelectMember(member) {
  if(!member) {
    if(form.lastMember.mid) {
      onRemoveMember(form.lastMember);
    }
    return;
  }
  projectMembers.push({mid:member.mid,name:member.name,oid:member.oid});
  u.clearExtend(form.lastMember,member);
  resetMemberSearch();
  onUpdate(false);
}

function onRemoveMember(member) {
  u.clear(form.lastMember);
  resetMemberSearch();

  let list = current.members;
  for(let i=0;i<list.length;i++) {
    if(list[i].mid===member.mid && list[i].oid===member.oid) {
      list.splice(i,1);
      onUpdate(false);
      return;
    }
  }
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
  u.clearExtend(list,await reload([],module));
}

onMounted(async ()=>{
  event.on('refreshed', "panel", refreshed);
  refresh();
  await refreshed(module);
});
</script>

<style lang="scss" scoped>
.v-row.selectable:hover {
  background-color: #333333;
  cursor: pointer;
}
</style>
