// Styles
import 'vuetify/styles'

// Composable
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { mdiWeatherNight, mdiWeatherSunny, mdiDelete, mdiPlus, mdiChevronRight, mdiSend, mdiContentSave, mdiMenu, mdiClockOut, mdiRunFast, mdiFinance, mdiReload, mdiClose } from '@mdi/js'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      chart:mdiFinance,
      menu: mdiMenu,
      clock: mdiClockOut,
      dark:mdiWeatherNight,
      delete:mdiDelete,
      cancel:mdiClose,
      light:mdiWeatherSunny,
      add:mdiPlus,
      reload:mdiReload,
      run:mdiRunFast,
      right:mdiChevronRight,
      send:mdiSend,
      save:mdiContentSave
    },
    sets: {
      mdi,
    },
  },
})
