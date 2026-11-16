import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () =>
        h('div', { class: 'ga-brandbar' }, [
          h('a', { class: 'ga-brandbar__home', href: 'https://www.govassured.com/' }, [
            h('img', { src: '/ga-logo.png', width: 95, height: 30, alt: 'GOV Assured home' }),
          ]),
        ]),
    })
  },
}
