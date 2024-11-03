---
title: 'Is Python the new JavaScript?'
subtitle: "Writing the world's software in Python"
date: 2024-02-12
image: '../../../public/images/is-python-the-new-javascript/snake-with-laptop.webp'
tags:
  - sidetracks
---

> Anything that can be written in JavaScript, will eventually be written in JavaScript.

This quote, from Stack Overflow co-founder Jeff Atwood, is something we've been seeing become more and more true over the past few years.

Originally developed for use in the browser, JavaScript has since moved to the server, into CLI tooling, and is now even used, somehow, in game development and mobile applications through wrappers around native libraries.

That sounds great, surely? We're getting closer to the 'Write once, run anywhere' dream that many software engineers have had over the years.

Well yes, but also no? JavaScript was (mistakenly) created in just a few days, and many of the poor decisions that were made at the time are still prevalent in the language today. The language's inconsistent behaviours and lack of structure make it almost impossible to accurately predict what any given program is going to do. In reality, it's often more of a 'Write once, debug everywhere' scenario.

So yes, JavaScript does everything. Just badly.

But that's not really what this article is about. I might go into all of JavaScript's problems (read: most of the language) in the future, but today is not the right time. Still, it's always fun to laugh. so look at this code:

```js
> '2' + '2'
'22'
> '2' + '2' - '2'
20
> [2] + [2] - [2]
20
```

Say what now?

Anyway, let's talk about Python.

## Where does Python run?

Python has been around for over 30 years at this point, and has grown from a basic scripting language to a tool used for everything from data science to web applications. And that's what it's good at. In particular, its shallow learning curve and expressive syntax make it ubiquitous in data and scientific computing.

Couple that with excellent web frameworks like Django and FastAPI, and you have an incredibly powerful tool that belongs in any self-respecting engineer's toolbox.

But why am I bringing this up?

Well, recent trends have indicated that Python is going in the direction that JavaScript has been going since the invention of Node.js in 2009. We're starting to see it being used for more than we ever imagined possible.

### Game development

Though not usually a game developer's first choice, Python has become reasonably popular for creating 2D games using the [Pygame](pygame.org) game engine (though Pygame itself is written primarily in C). While you probably won't be building the next Cyberpunk in Python, you could definitely use it to create a simple Mario or Terraria clone.

### Hardware programming

Even though it's not what you'd typically consider an "efficient", "low-level" or even remotely "fast" language, Python is also a common choice for hobbyist hardware programmers. A lot of Python's popularity in the hardware space was driven by the Raspberry Pi Foundation's choice to make it the main language for programming their consumer-grade single-board computers.

That being said, initiatives such as [MicroPython](https://micropython.org/) have also been taking the language in an interesting direction, opting to create an entirely new compiler for Python that optimises the language for running in constrained environments.

### Mobile apps

Python has been a server-side language for a long time. You can't go a week without seeing an open source project whose REST API is Flask or FastAPI, and Instagram is built on Django. But Python on the client? That's a relatively new invention. Still, we're starting to see the rise of Python not only for creating user interfaces on the desktop, but also in our app stores.

Cross-platform Python GUI libraries like [BeeWare](https://beeware.org) and [Kivy](kivy.org) are under rapid development, and adoption is growing daily. Can they compete with native apps? No, not really. The feature set is limited and it's often difficult to achieve exactly the result you want, but it's not impossible to get something working and on the app store.

It's also unlikely that these tools will ever be able to compete with the cross-platform giants that are Flutter and React Native, either, but they're giving the humble Python developer a chance to throw a prototype together without too much hassle.

### Reactive web frontends

Finally, we should talk about [PyScript](pyscript.net). This is a recent advancement thanks to Web Assembly that allows developers to ship a Python interpreter to the browser and manipulate the DOM using Python code. Thanks to the incredible work of the folks at Anaconda, we can now run Python libraries like `pandas` and `numpy` on the client-side, avoiding some expensive computation on our own servers.

The biggest win is in code sharing. Sensitive data could now be processed in a sandboxed environment that doesn't have to leave the user's computer, all by sharing a single HTML file that doesn't need a special program to run.

I can imagine a (not too distant) future where a declarative Python frontend framework both exists and is in production, with no JavaScript needed. Think Django on steroids.

## But is it too far?

I mentioned earlier that I think JavaScript has become a little _too_ widespread. While yes, you _can_ use JavaScript on the server, you'd probably be better served by Go or Python. And yes you _can_ use it for game development, but C++ is probably a better choice.

Don't get me wrong, JavaScript excels at creating interactive UIs and standing up new projects really quickly. But I don't think it's the silver bullet everyone thinks it is. There are so many developers these days who go their whole lives only knowing JavaScript and the JavaScript ecosystem, and that can have a really negative impact on the community as a whole.

We build better things by understanding more things, and JS takes people down the wrong path.

I do think Python is a little different, though. For starters, Python is a _much_ more sensible language than JavaScript. It's a heck of a lot more predictable, even if it does have a few quirks.

Furthermore, most JavaScript users are software engineers. A good portion of Python users are data scientists and data analysts. Since they specialise in a different area, they're less likely to know other languages. Having Python do everything makes things easy, especially if it allows them to share the results of their experiments with the wider business.

The Python community will eventually reach a crossroads and we will have to make a decision. Do we focus on making Python as great as it can be at the few things it excels at, or do we allow things to go too far?

I'm hoping we don't get there, but in case we do, I want to be the one famous for saying this:

> Everything that can be written in Python, will eventually be written in Python.

Always a pleasure chatting,

Isaac
