<script lang="ts">
  type Position = { x: number; y: number }
  let lastDot: Position = { x: 0, y: 0 }
  let lastTime = new Date().getTime()

  let thisEl: HTMLDivElement

  function getDistance(a: Position, b: Position) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  }

  function handleMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e
    const now = new Date().getTime()
    const distance = getDistance(lastDot, { x: clientX, y: clientY })
    const time = now - lastTime

    if (distance < 100 && time < 100) {
      return
    }

    lastDot = { x: clientX, y: clientY }
    lastTime = now

    const dot = document.createElement('div')
    dot.classList.add('w-2', 'h-2', 'bg-accent-blue', 'absolute', 'rounded-full')

    dot.style.left = `${clientX}px`
    dot.style.top = `${clientY}px`

    thisEl.appendChild(dot)

    setTimeout(() => {
      dot.remove()
    }, 1000)
  }
</script>

<div
  bind:this={thisEl}
  on:mousemove={handleMouseMove}
  on:click={() => console.log('click')}
  role="none"
  class="w-full h-10 bg-accent-red bg-opacity-20 overflow-hidden relative"
></div>
