// Setup light theme, if necessary
const themePreference = window.localStorage.getItem('theme-preference')
if (
  window.matchMedia('(prefers-color-scheme: light)').matches ||
  themePreference === 'light'
) {
  document.querySelector('html').classList.replace('dark', 'light')
  document.head.querySelector('.dark-theme-css').disabled = true
  document.head.querySelector('.light-theme-css').disabled = false
}
