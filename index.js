const canvas = document.querySelector(".screen")
const ctx = canvas.getContext("2d")
const matrixDisplay = document.querySelector(".matrix")

const n = 1250
const dt = 0.02
const frictionHalfLife = 0.04;
const rMax = 0.1
const m = 6
let matrix = makeRandomMatrix()
let matrixInt = matrix.map(row => row.map(value => Math.floor(value * 1000) / 1000))
let matrixAsString = JSON.stringify(matrixInt) // Stolen code from https://stackoverflow.com/questions/48287178/nested-array-to-string-javascript
  .replace(/(\]\]\,)\[/g, "]\n")
  .replace(/(\[\[|\]\]|\")/g,"")
  .replace(/\]\,/g, "],<br>")
  .replace(/\-/g, "<span style='color: #F44'>-</span>")
  .replace(/\,/g, "<span style='color: #334'>,</span>")
matrixDisplay.innerHTML = "<span style='color: #DDF'>matrix</span> = [<br><br>[" + matrixAsString + "]<br><br>]<span style='color: #DDF'>;</span>"
const forceFactor = 10

const frictionFactor = Math.pow(0.5, dt / frictionHalfLife)

function makeRandomMatrix() {
  const rows = []
  for (let i = 0; i < m; i++) {
    const row = []
    for (let j = 0; j < m; j++) {
      row.push(Math.random() * 2 - 1)
    }
    rows.push(row)
  }
  return rows
}

const colors = new Int32Array(n)
const positionsX = new Float32Array(n)
const positionsY = new Float32Array(n)
const velocitiesX = new Float32Array(n)
const velocitiesY = new Float32Array(n)
for (let i = 0; i < n; i++) {
  colors[i] = Math.floor(Math.random() * m)
  positionsX[i] = Math.random()
  positionsY[i] = Math.random()
  velocitiesX[i] = 0
  velocitiesY[i] = 0
}

function loop() {
  updateParticles()

  ctx.fillStyle = "#112"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < n; i++) {
    ctx.beginPath()
    const screenX = positionsX[i] * canvas.width
    const screenY = positionsY[i] * canvas.height
    ctx.arc(screenX, screenY, 2, 0, 2 * Math.PI)
    ctx.fillStyle = `hsl(${360 * (colors[i] / m)}, 100%, 50%)`
    ctx.fill()
  }

  requestAnimationFrame(loop)
}

function updateParticles() {
  for (let i = 0; i < n; i++) {
    let totalForceX = 0
    let totalForceY = 0

    for (let j = 0; j < n; j++) {
      if (j === 1) continue
      const rx = positionsX[j] - positionsX[i]
      const ry = positionsY[j] - positionsY[i]
      const r = Math.hypot(rx, ry)
      if (r > 0 && r < rMax) {
        const f = force(r / rMax, matrix[colors[i]][colors[j]])
        totalForceX += rx / r * f
        totalForceY += ry / r * f
      }
    }

    totalForceX *= rMax * forceFactor
    totalForceY *= rMax * forceFactor

    velocitiesX[i] *= frictionFactor
    velocitiesY[i] *= frictionFactor

    velocitiesX[i] += totalForceX * dt
    velocitiesY[i] += totalForceY * dt
  }

  for (let i = 0; i < n; i++) {
    positionsX[i] += velocitiesX[i] * dt
    positionsY[i] += velocitiesY[i] * dt
  }

  for (let i = 0; i < n; i++) {
    if (positionsX[i] < 0) positionsX[i] += 1
    if (positionsX[i] > 1) positionsX[i] -= 1
    if (positionsY[i] < 0) positionsY[i] += 1
    if (positionsY[i] > 1) positionsY[i] -= 1
  }
}

function force(r, a) {
  const beta = 0.3
  if (r < beta) {
    return r / beta - 1
  } else if (beta < r && r < 1) {
    return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
  } else {
    return 0
  }
}

function saveWorld() {
  const popup = document.createElement("div")
  const html = `
  <h1>SAVE WORLD</h1>
  <p>Enter a name for your world</p>
  <input type="text" id="worldName" placeholder="World Name">`
  popup.classList.add("popup", "stay")
  popup.innerHTML = html + "<button onclick='save(document.getElementById(\"worldName\").value || \"World\"); closePopup()'>Save</button><button onclick='closePopup()'>Cancel</button>"
  document.body.appendChild(popup)
}

function save(worldName) {
  localStorage.setItem(worldName, JSON.stringify(matrix))
  const popup = document.createElement("div")
  popup.classList.add("popup")
  popup.innerHTML = `Saved ${worldName}!`
  document.body.appendChild(popup)
}

function loadWorld() {
  const popup = document.createElement("div")
  const html = `
  <h1>LOAD WORLD</h1>
  <p>Enter the name of the world you want to load</p>
  <input type="text" id="worldName" placeholder="World Name">`
  popup.classList.add("popup", "stay")
  popup.innerHTML = html + "<button onclick='load(document.getElementById(\"worldName\").value || \"World\"); closePopup()'>Load</button><button onclick='closePopup()'>Cancel</button>"
  document.body.appendChild(popup)
}

function load(worldName) {
  const matrixDataSave = localStorage.getItem(worldName)
  if (matrixDataSave) {
    const matrixData = JSON.parse(matrixDataSave)
    if (matrixData.length === m && matrixData.every(row => row.length === m)) {
      matrix = matrixData
      matrixInt = matrix.map(row => row.map(value => Math.floor(value * 1000) / 1000))
      matrixAsString = JSON.stringify(matrixInt) // Stolen code from https://stackoverflow.com/questions/48287178/nested-array-to-string-javascript
        .replace(/(\]\]\,)\[/g, "]\n")
        .replace(/(\[\[|\]\]|\")/g,"")
        .replace(/\]\,/g, "],<br>")
        .replace(/\-/g, "<span style='color: #F44'>-</span>")
        .replace(/\,/g, "<span style='color: #334'>,</span>")
      matrixDisplay.innerHTML = "<span style='color: #DDF'>matrix</span> = [<br><br>[" + matrixAsString + "]<br><br>]<span style='color: #DDF'>;</span>"
    }
  }
  const popup = document.createElement("div")
  popup.classList.add("popup")
  popup.innerHTML = "Loaded!"
  document.body.appendChild(popup)
}

function help() {
  const popup = document.createElement("div")
  const html = `
  <h1>HELP</h1>
  <p>Particles is a particle life simulator... A very simple one</p>
  <p>It uses a matrix to determine how particles interact with each other</p>
  <p>Each particle has a color, and each color has a row and columns in the matrix</p>
  <p>The value in the matrix is the force between the two colors</p>
  <p>This simulator can:</p>
  <p>  - Create New Worlds</p>
  <p>  - Save Worlds</p>
  <p>  - Load Worlds</p>
  
  <h1>UPCOMMING FOR 1.2</h1>
  <p>  (X) Multiple World Saving</p>
  <p>  - Set Matrix Variable (like change the world)</p>
  <p>  - Pause Simulation</p>
  <p>  - And I guess more?</p>
  
  <h1>WARNINGS</h1>
  <p>  - The matrix cannot have undefined numbers</p>
  <p>  - This program is prone to computer bugs :P</p>
  `
  popup.classList.add("popup", "stay")
  popup.innerHTML = html + "<button onclick='closePopup()'>Close</button>"
  document.body.appendChild(popup)
}

function closePopup() {
  const popup = document.querySelector(".popup")
  popup.classList.remove("stay")
  popup.remove()
}

loop()