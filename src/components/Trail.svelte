<script lang="ts">
  type Position = { x: number; y: number }

  export let secondsVisible = 1

  let lastDot: Position = { x: 0, y: 0 }
  let lastTime = new Date().getTime()

  let thisEl: HTMLDivElement

  function getDistance(a: Position, b: Position) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  }

  function handleMouseMove(e: MouseEvent, window: boolean) {
    if ($$slots.default && window) {
      return
    }
    let x, y: number
    if (!$$slots.default) {
      ;({ pageX: x, pageY: y } = e)
    } else {
      ;({ clientX: x, clientY: y } = e)
      const { left, top } = thisEl.getBoundingClientRect()
      x -= left
      y -= top
    }
    console.log('mousemove', { x, y })
    const now = new Date().getTime()
    const distance = getDistance(lastDot, { x, y })
    const time = now - lastTime

    if (distance < 100 && time < 100) {
      return
    }

    lastDot = { x, y }
    lastTime = now

    const dot = document.createElement('div')
    dot.classList.add(
      'w-2',
      'h-2',
      'bg-accent-blue',
      'absolute',
      'rounded-full',
      'z-50',
      'pointer-events-none'
    )

    dot.style.left = `${x}px`
    dot.style.top = `${y}px`

    if (!$$slots.default) {
      document.body.classList.add('relative')
      document.body.appendChild(dot)
    } else {
      thisEl.appendChild(dot)
    }

    setTimeout(() => {
      dot.remove()
    }, secondsVisible * 1000)
  }
</script>

<svelte:window on:mousemove={(e) => handleMouseMove(e, true)} />

<div
  bind:this={thisEl}
  on:mousemove={(e) => handleMouseMove(e, false)}
  on:click={() => console.log('click')}
  role="none"
  class="relative w-fit h-fit overflow-hidden"
>
  <slot />
</div>
