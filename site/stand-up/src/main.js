const thingsEl = document.getElementById('things')

const loadData = name => fetch(`./data/${name}.json`).then(resp => resp.json())

const shuffle = function (rng, array) {
  let currentIndex = array.length
  let temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(rng() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const main = async () => {
  const now = new Date()
  const seed = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`
  const rng = new Math.seedrandom(seed)
  const data = await loadData('ps-stand-up')
  shuffle(rng, data)

  for (const thing of data) {
    const el = document.createElement('div')
    el.innerText = thing
    thingsEl.appendChild(el)
  }
}

main()