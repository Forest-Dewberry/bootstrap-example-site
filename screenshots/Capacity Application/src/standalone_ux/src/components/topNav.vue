<template>
  <v-app :theme="props.theme">
    <v-layout>
      <v-app-bar
        permanent
        density="compact"
        class="w-100"
      >
        <v-app-bar-nav-icon icon="$menu" @click.stop="values.drawer = !values.drawer" title="Menu" aria-label="menu"></v-app-bar-nav-icon>
        <v-select class="v-col v-col-sm-3"
          :items="orgs"
          id="top-org-select"
          name="org"
          item-title="name"
          item-value="id"
          v-model="props.oid"
          @update:modelValue="onOrgChange"
          hide-details
          :single-line="true"
          aria-label="Organization"
          label="Organization"
        ></v-select>
        <v-select class="v-col v-col-sm-3"
          :items="projects"
          name="project"
          id="top-project-select"
          item-title="name"
          item-value="pid"
          v-model="props.pid"
          @update:modelValue="onProjectChange"
          hide-details
          :single-line="true"
          aria-label="Project"
          label="Project"
        ></v-select>
        <v-app-bar-title></v-app-bar-title>
        <v-app-bar-nav-icon icon="$clock" @click="onSectionChange('pto')" title="PTO" aria-label="PTO" :class="iconClass('pto')"></v-app-bar-nav-icon>
        <v-app-bar-nav-icon icon="$chart" @click="onSectionChange('cap')" title="Capacity" aria-label="Capacity" :class="iconClass('cap')"></v-app-bar-nav-icon>
        <v-app-bar-nav-icon :icon="themeIcon()" title="Change Theme" aria-label="Change Theme" @click="onChangeTheme" class="d-none d-sm-inline-block ml-12"></v-app-bar-nav-icon>
      </v-app-bar>

      <v-main style="width:100%">
        <v-navigation-drawer
        v-model="values.drawer"
        temporary
        >
        <v-list
          :lines="false"
          density="compact"
          role="list"
          nav
        >
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            active-color="primary"
            :active="item.value===props.module"
            role="listitem"
            @click="onSectionChange(item.value)"
          >
            <v-divider v-if="item.type==='divider'"></v-divider>
            <v-list-item-title v-text="item.title" v-if="item.type!=='divider'"></v-list-item-title>
          </v-list-item>
        </v-list>

        </v-navigation-drawer>
        <slot></slot>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, watch } from 'vue'
import { db } from '@/lib/db';
import axios from "axios";
import ev from '@/lib/event';

const endpoint = import.meta.env.VITE_TARGET;

const props=defineProps({
    theme:String,
    module:String, // what module is highlighted
    oid:String, // org id
    pid:String, // project id
});
const emit = defineEmits(['theme','oidChange','pidChange','moduleChange'])
const orgs = reactive([]);
const projects = reactive([]);
const values = reactive({drawer:false});
const items = [
  {value:'org', title:'Organizations',props:{active:true,activeColor:'primary'}},
  {value:'member', title:'Team Members'},
  {value:'project', title:'Projects'},
  {value:'sprint', title:'Sprints'},
  {value:'holiday', title:'Holidays'},
  {type: 'divider' },
  {value:'pto', title:'PTO'},
  {value:'cap', title:'Capacity'}
];

function menuItems() {
  let active = {active:true,activeColor:'primary'};
  for(let i=0;i<items.length;i++) {
    delete items[i].props;
    if(items[i].value===props.module) {
      items[i].props = active;
    }
  }
  return items;
}

function onChangeTheme() {
  emit('theme', props.theme === 'light' ? 'dark' : 'light');
}
function onOrgChange(id) {
  ev.emit('sync');
  emit('oidChange', id);
}
function onProjectChange(id) {
  emit('pidChange', id);
}
function onSectionChange(module) {
  values.drawer=false;
  if(!module) return;
  emit('moduleChange', module);
}
async function onRefresh() {
  console.debug("onRefresh");
  ev.emit('sync',{oid:props.oid,module:props.module});
}


function iconClass(s) {
  return props.module===s ? "d-none d-sm-inline text-primary":"d-none d-sm-inline";
}
function themeIcon() {
  return props.theme==='dark'?'$light':'$dark';
}


async function setOrg() {
  orgs.length=0;
  await db.org.each((item)=>{
    orgs.push(item);
  });
  console.log("setOrg",props.oid);
  if((props.oid==='' || props.oid===null || props.pid===undefined) && orgs.length===1) {
    emit('oidChange', orgs[0].oid);
  }
}

async function setProjects() {
  projects.length=0;
  await db.project.each((item)=>{
    projects.push(item);
  });
  console.log("setProjects",props.pid);
  if((props.pid==='' || props.pid===null || props.pid===undefined) && projects.length===1) {
    emit('pidChange', projects[0].pid);
  }
}

async function refreshDropDowns(module) {
  if(module==='all' || module==='org') await setOrg();
  if(module==='all' || module==='project') await setProjects();
}

onMounted(async ()=>{
  ev.on("refreshed","top",refreshDropDowns);
  await setOrg();
  await setProjects();

  if(orgs.length===0) {
    axios.get(endpoint+'/org').then(async (response)=>{
      await db.org.clear();
      await db.org.bulkAdd(response.data);
      await setOrg();
    });
  }
  if(projects.length===0) {
    axios.get(endpoint+'/project').then(async (response)=>{
      await db.project.clear();
      await db.project.bulkAdd(response.data);
      await setProjects();
    });
  }
});

</script>

<style lang="scss">
</style>
