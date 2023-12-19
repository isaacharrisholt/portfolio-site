<script lang="ts">
  import { onMount } from 'svelte'

  export let text = "Hi, I'm Isaac"

  // Wait a random interval between 2 and 5 seconds, then add the shaking class to a random div
  function startShakes() {
    setTimeout(
      () => {
        const randomIndex = Math.floor(Math.random() * squares.length)
        const randomSquare = squares[randomIndex]
        if (randomSquare) {
          randomSquare.classList.add('shaking')
          setTimeout(() => {
            randomSquare.classList.remove('shaking')
          }, 250)
        }
        startShakes()
      },
      Math.floor(Math.random() * 3000) + 2000
    )
  }

  type Square = {
    width: `w-${number}`
    translateX?: `${'-' | ''}translate-x-${number}`
    translateY?: `${'-' | ''}translate-y-${number}`
    rotate?: `${'-' | ''}rotate-${number}`
  }

  const squareDefinitions: [Square[], Square[]] = [
    [
      {
        width: 'w-10',
        translateX: '-translate-x-16',
        translateY: '-translate-y-8',
        rotate: '-rotate-6'
      },
      {
        width: 'w-16',
        translateX: '-translate-x-8',
        translateY: '-translate-y-6'
      },
      {
        width: 'w-12',
        translateX: 'translate-x-8',
        translateY: '-translate-y-6'
      },
      {
        width: 'w-24',
        translateX: 'translate-x-16',
        translateY: '-translate-y-6'
      }
    ],
    [
      {
        width: 'w-16',
        translateX: '-translate-x-16',
        translateY: 'translate-y-8',
        rotate: 'rotate-180'
      },
      {
        width: 'w-32',
        translateX: '-translate-x-16',
        translateY: 'translate-y-6'
      },
      {
        width: 'w-8',
        translateX: '-translate-x-16',
        translateY: 'translate-y-6'
      },
      {
        width: 'w-24',
        translateX: '-translate-x-16',
        translateY: 'translate-y-6'
      }
    ]
  ]

  const squares: Array<HTMLDivElement | undefined> = squareDefinitions
    .flat()
    .map(() => undefined)

  let anchor: HTMLAnchorElement

  onMount(startShakes)
</script>

<a href="/about" class="hidden" hidden bind:this={anchor}>.</a>
<div class="h-[80vh] grid place-items-center w-full">
  <button on:click={() => anchor.click()} class="grid max-w-screen-sm w-full group">
    <div class="row-start-1 col-start-1 z-10 flex flex-col gap-4 items-center">
      <div
        class="flex flex-row items-end gap-4 [&>div]:transition-all [&>div]:duration-300 [&>div]:transform [&>div]:aspect-square"
      >
        {#each squareDefinitions[0] as s, i}
          <div class="bg-yellow-500 {s.width}" bind:this={squares[i]} />
        {/each}
      </div>
      <div
        class="flex flex-row items-start gap-4 [&>div]:transition-all [&>div]:duration-300 [&>div]:transform [&>div]:aspect-square"
      >
        {#each squareDefinitions[1] as s, i}
          <div
            class="bg-yellow-500 {s.width}"
            bind:this={squares[i + squareDefinitions[0].length]}
          />
        {/each}
      </div>
    </div>
    <h1
      class="text-5xl xl:text-7xl font-bold row-start-1 col-start-1 place-self-center opacity-0"
    >
      {text}
    </h1>
  </button>
</div>

<style>
  .shaking {
    animation: shake 0.5s;
    animation-iteration-count: 1;
  }

  .group:hover .shaking {
    animation: none;
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 1px) rotate(0deg);
    }
    10% {
      transform: translate(-1px, -2px) rotate(-1deg);
    }
    20% {
      transform: translate(-3px, 0px) rotate(1deg);
    }
    30% {
      transform: translate(3px, 2px) rotate(0deg);
    }
    40% {
      transform: translate(1px, -1px) rotate(1deg);
    }
    50% {
      transform: translate(-1px, 2px) rotate(-1deg);
    }
    60% {
      transform: translate(-3px, 1px) rotate(0deg);
    }
    70% {
      transform: translate(3px, 1px) rotate(-1deg);
    }
    80% {
      transform: translate(-1px, -1px) rotate(1deg);
    }
    90% {
      transform: translate(1px, 2px) rotate(0deg);
    }
    100% {
      transform: translate(1px, -2px) rotate(-1deg);
    }
  }
</style>
