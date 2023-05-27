<template>
  <top-nav :theme="data.theme" :module="data.sectionMode" :oid="data.oid" :pid="data.pid" @theme="onChangeTheme" @oidChange="onChangeOrgID" @pidChange="onChangeProjectID" @moduleChange="changeSectionMode">
    <v-responsive class="w-100 home">
      <div class="p-0">
        <organization v-if="data.sectionMode=='org'"></organization>
        <member v-if="data.sectionMode=='member'" :oid="data.oid"></member>
        <project v-if="data.sectionMode=='project'" :oid="data.oid"></project>
        <holiday v-if="data.sectionMode=='holiday'" :oid="data.oid"></holiday>
        <sprint v-if="data.sectionMode=='sprint'" :oid="data.oid" :pid="data.pid"></sprint>
        <pto v-if="data.sectionMode=='pto'" :oid="data.oid" :pid="data.pid" :mid="data.mid" :theme="data.theme"></pto>
        <capacity v-if="data.sectionMode=='cap'" :oid="data.oid" :pid="data.pid"></capacity>
      </div>
    </v-responsive>
  </top-nav>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, watch } from 'vue'
//import NoNav from "@/components/noNav";
import TopNav from "@/components/topNav";
import Organization from "@/components/organization";
import Project from "@/components/project";
import Sprint from "@/components/sprint";
import Member from "@/components/member";
import pto from "@/components/pto";
import Holiday from "@/components/holiday";
import Capacity from "@/components/capacity";

const data = reactive({
    oid:'',
    pid:'',
    mid:'',
    sectionMode:'pto',
    theme:'dark'
});

function sectionBtnMode(btn){
  return btn==data.sectionMode?"tonal":"plain"
}
function changeSectionMode(btn) {
  data.sectionMode=btn;
  localStorage.setItem('module',data.sectionMode);
}
function onChangeTheme() {
  data.theme=data.theme==="dark"?"light":"dark";
  localStorage.setItem('theme',data.theme);
}
function onChangeOrgID(id) {
  data.oid=id;
  localStorage.setItem('oid', id);
}
function onChangeProjectID(id) {
  data.pid=id;
  localStorage.setItem('pid', id);
}

onMounted(async ()=>{
   data.theme=localStorage.getItem('theme') || 'dark';
   data.sectionMode=localStorage.getItem('module') || 'pto';
   data.oid=localStorage.getItem('oid');
   data.pid=localStorage.getItem('pid');
   data.mid=localStorage.getItem('mid') || "00000000000000000000000000000000";
});
</script>

<style lang="scss">

</style>
