<template>
  <v-row class="user-item" :style="selectedStyle()" @click.stop="">
    <v-col cols="1"><v-checkbox density="compact" v-model="hasCapacity" :aria-label="user.name+' Active'"></v-checkbox></v-col>
    <v-col @click="onClick"><v-label :class="textClass()" style="opacity:1" :id="'member_'+props.index+'-label'">{{ user.name }}</v-label></v-col>
    <v-col cols="2" class="v-number mr-2"><v-text-field :id="'member_'+props.index" :name="'capacity'+props.index" density="compact" type="number" single-line v-model="capacity" hide-details aria-describedby="'member_'+props.index+'-label'" :aria-label="user.name+' Capacity'"></v-text-field></v-col>
    <v-col cols="1" @click="onClick">
      <v-icon :icon="'$right'" :color="selectedColor()" style="margin-top: .5rem;"></v-icon>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'

const emit = defineEmits(['click']);

const props=defineProps({
  modelValue: {
    type: Object,
    required:true
  },
  selected: {
    type:Boolean,
    default:false
  },
  index: {
    type: Number
  },
  theme: {
    Type:String
  }
})

function selectedStyle() {
  return props.selected ? "background-color: #424242;color:white" :"";
}
function selectedColor() {
  return props.selected ? "" :"blue-grey-darken-2";
}
function onClick() {
  emit('click',props.modelValue);
}

const user = reactive(props.modelValue);
const hasCapacity = ref(props.modelValue.hasCapacity);
const capacity = ref(props.modelValue.capacity);
const textClass = function(){
  return props.theme==="dark"?"v-name-label text-white":"v-name-label";
}

</script>

<style lang="scss">
.v-label {
  opacity: 1;
}
.user-item {
  .v-input--density-compact {
    --v-input-control-height: 26px;
    --v-input-padding-top: 0;
  }
  .v-checkbox {
    --v-input-padding-top: 8px;
    padding-top: .4rem;
  }

  margin: 0;
  .v-col {
    padding: 0;
    height: 40px;
  }
  .v-name-label {
    padding-top: 0.5em;
    padding-left: 0.5em;
  }
  .v-number {
    .v-field__input {
      padding-right: 0;
      padding-bottom: 0;
    }
  }
}
</style>
