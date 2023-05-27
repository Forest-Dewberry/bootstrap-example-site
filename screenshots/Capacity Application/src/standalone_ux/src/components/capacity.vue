<template>
  <v-row class="pl-4 pt-3">
    <v-col cols="3">
      <v-btn density="compact" size="small" class="w-100" :color="chartBtnMode('cap')" @click="changeChartMode('cap')">Capacity</v-btn>
      <v-btn density="compact" size="small" class="w-100" :color="chartBtnMode('points')" @click="changeChartMode('points')">Points</v-btn>
      <v-btn density="compact" size="small" class="w-100" :color="chartBtnMode('data')" @click="changeChartMode('data')">Data</v-btn>

      <div v-if="form.chartMode==='cap'" class="mt-6">
        <div>Capacity<span class="float-right" style="color: blue">----</span></div>
      </div>
      <div v-if="form.chartMode==='points'" class="mt-6">
        <div>Points<span class="float-right" style="color: yellow">----</span></div>
        <div>Rollover<span class="float-right" style="color: red">----</span></div>
        <div>Actual<span class="float-right" style="color: green">----</span></div>
      </div>
    </v-col>
    <v-col v-if="form.chartMode==='cap'">
      <Chart
        :size="{ width: 500, height: 420 }"
        :data="data"
        :margin="margin"
        direction="horizontal"
      >
        <template #layers>
          <Grid strokeDasharray="2,2" />
          <Line :dataKeys="['name', 'cap']" :lineStyle="{ stroke: 'blue' }"/>
        </template>
        <template #widgets>
          <Tooltip
            borderColor="#48CAE4"
            :config="{
    name: { hide: false },
    cap: { label:'actual',color: 'blue' }
  }"
          />
        </template>
      </Chart>
    </v-col>
    <v-col v-if="form.chartMode==='points'">
      <Chart
        :size="{ width: 500, height: 420 }"
        :data="data"
        :margin="margin"
        direction="horizontal"
        >
        <template #layers>
          <Grid strokeDasharray="2,2" />
          <Line :dataKeys="['name', 'pts']" :lineStyle="{ stroke: 'yellow' }"/>
          <Line :dataKeys="['name', 'roll']" :lineStyle="{ stroke: 'red' }"/>
          <Line :dataKeys="['name', 'act']" :lineStyle="{ stroke: 'green' }" />
        </template>
        <template #widgets>
          <Tooltip
            borderColor="#48CAE4"
            :config="{
    name: { hide: false },
    pts: { label: 'points', color: 'yellow' },
    roll: { label: 'rollover', color: 'red' },
    act: { label:'actual',color: 'green' }
  }"
          />
        </template>
      </Chart>
    </v-col>
    <v-col v-if="form.chartMode==='data'">
      <v-container>
        <v-row>
          <v-col class="text-subtitle-2 bg-grey-darken-4 pa-1">Name</v-col>
          <v-col class="text-subtitle-2 bg-grey-darken-4 pa-1">Points</v-col>
          <v-col class="text-subtitle-2 bg-grey-darken-4 pa-1">Actual</v-col>
          <v-col class="text-subtitle-2 bg-grey-darken-4 pa-1">Roll Over</v-col>
          <v-col class="text-subtitle-2 bg-grey-darken-4 pa-1">Capacity</v-col>
        </v-row>
        <v-row v-for="sprint in data">
          <v-col>{{sprint.name}}</v-col>
          <v-col>{{sprint.pts}}</v-col>
          <v-col>{{sprint.act}}</v-col>
          <v-col>{{sprint.roll}}</v-col>
          <v-col>{{sprint.cap}}</v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-row>
</template>

<script setup>
import { Chart, Grid, Line,Tooltip } from 'vue3-charts'
import { ref, reactive, onMounted, defineProps, watch } from 'vue'
import u from '@/lib/util';
import axios from "axios";
import {v4 as uuid4} from "uuid";
import { db } from '@/lib/db';

const props=defineProps({
})

const id = "oid";
const data = reactive([
        { name: 'Sprint 1', pts: 60, act: 30, roll: 0, cap:300 },
        { name: 'Sprint 2', pts: 70, act: 60, roll: 30, cap:400 },
        { name: 'Sprint 3', pts: 70, act: 50, roll: 10, cap:500 },
        { name: 'Sprint 4', pts: 70, act: 60, roll: 20, cap:700 },
        { name: 'Sprint 5', pts: 80, act: 70, roll: 10, cap:700 },
        { name: 'Sprint 6', pts: 80, act: 80, roll: 10, cap:700 },
        { name: 'Sprint 7', pts: 70, act: 80, roll: 0, cap:700 }
      ]);
const margin = reactive({
        left: 0,
        top: 20,
        right: 20,
        bottom: 0
      });

const endpoint = import.meta.env.VITE_TARGET;
const current = reactive({name:''});
const form = reactive({valid:false,chartMode:'points'});
function selectedColor(item,base) {
  return base + (current[id]!=undefined && (current[id]===item[id] ? " bg-grey-darken-2" : ""));
}

function required (v) {
  return !!v || 'Field is required'
}

function chartBtnMode(btn) {
  return btn==form.chartMode?"primary":undefined
}

function changeChartMode(btn) {
  form.chartMode=btn;
}

onMounted(()=>{
});
</script>

<style lang="scss" scoped>
.v-row.selectable:hover {
  background-color: #333333;
  cursor: pointer;
}
</style>