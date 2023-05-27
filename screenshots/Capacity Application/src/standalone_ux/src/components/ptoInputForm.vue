<template>
  <v-form v-model="form.valid">
    <v-container>
      <v-row>
        <v-col>Mar 12 2023</v-col>
        <v-col>Appt</v-col>
        <v-col cols="1"><v-icon :icon="'$delete'" aria-label="delete"></v-icon></v-col>
      </v-row>
      <v-row>
        <v-col>Mar 14 2023</v-col>
        <v-col>PTO</v-col>
        <v-col cols="1"><v-icon :icon="'$delete'" aria-label="delete"></v-icon></v-col>
      </v-row>
    </v-container>
    <v-divider></v-divider>
    <v-container class="mb-0 pb-0">
      <v-row no-gutters>
        <v-col class="pr-2"><v-text-field type="date" density="compact" label="From" aria-label="From Date"></v-text-field></v-col>
        <v-col class="pl-1"><v-text-field type="date" density="compact" label="To" aria-label="To Date"></v-text-field></v-col>
        <v-col cols="2"></v-col>
      </v-row>
      <v-row no-gutters>
        <v-col><v-text-field density="compact" label="Reason" aria-label="Reason For PTO"></v-text-field></v-col>
        <v-col cols="2"></v-col>
      </v-row>
      <v-row no-gutters>
        <v-col><v-textarea density="compact" label="Message" model-value="I will be out of the office {range} {reason}" aria-label="Message to team">I will be out of the office {range} {reason}</v-textarea></v-col>
        <v-col cols="2" class="text-center"><div style="position: relative; height: calc(100% - 22px)">
          <div style="position: absolute; bottom: 0; padding-left: 1em">
            <v-btn icon="$send" color="indigo" aria-label="save and send"></v-btn>
          </div>
        </div></v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, watch } from 'vue'

const props=defineProps({
  member:Object
});

const current = reactive({name:props.member});
const form = reactive({valid:false,show:false});
const $form = ref(null);

function required (v) {
  return !!v || 'Field is required'
}

</script>
