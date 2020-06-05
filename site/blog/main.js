// Toggle code snippets
document.addEventListener('click', function (event) {
  var target = event.target
  if (!target.classList.contains('toggle-codeblock')) {
    return
  }

  var container = target.closest('.hidden-codeblock')
  if (container.classList.contains('visible')) {
    container.classList.remove('visible')
  } else {
    container.classList.add('visible')
  }
})

document.querySelector('.toggle-theme').addEventListener('click', () => {
  const html = document.querySelector('html')
  const isDarkTheme = html.classList.contains('dark')
  if (isDarkTheme) {
    html.classList.replace('dark', 'light')
    document.head.querySelector('.dark-theme-css').disabled = true
    document.head.querySelector('.light-theme-css').disabled = false
    localStorage.setItem('theme-preference', 'light')
  } else {
    html.classList.replace('light', 'dark')
    document.head.querySelector('.dark-theme-css').disabled = false
    document.head.querySelector('.light-theme-css').disabled = true
    localStorage.setItem('theme-preference', 'dark')
  }
})
