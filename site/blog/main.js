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

// Setup light theme, if necessary
if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  const lightCodeStyleSheet = document.createElement('link')
  lightCodeStyleSheet.href = '/highlight.js.light.css'
  lightCodeStyleSheet.rel = 'stylesheet'
  document.head.appendChild(lightCodeStyleSheet)
}
