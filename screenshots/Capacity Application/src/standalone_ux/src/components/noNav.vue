<template>
  <v-app :theme="theme">
      <slot></slot>
  </v-app>
</template>

<script>
export default {
  name: "noNav",
  props: {
    theme:String
  },
  methods: {
    onClick: function () {
      this.$emit('theme', this.theme === 'light' ? 'dark' : 'light');
    }
  }
}
</script>

<style lang="scss">
.themeButton {
  bottom: 0;
  position: fixed;
  background-color: transparent;
  min-width: 55px;
  padding: 0;
  .v-btn__prepend {
    margin-left: 8px;
  }
}
.v-navigation-drawer--rail .v-list .v-avatar {
  --v-avatar-height: 24px;
}
</style>
