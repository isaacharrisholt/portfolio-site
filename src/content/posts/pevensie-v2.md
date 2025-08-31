---
title: 'Pevensie V2 will be a monopackage'
subtitle: "Learnings from V1, and the future of Gleam's premiere application framework"
date: 2025-08-31
image: '../../../public/images/pevensie-v2/lamppost.jpg'
tags:
  - gleam
---

A little while ago, I created [Pevensie](https://github.com/Pevensie/pevensie), a
backend application framework for the [Gleam](https://gleam.run/) programming language.
Gleam is a relatively new language, and while there are a host of good libraries for
creating web applications, there are still a number of gaps in the ecosystem.

In particular, when I first created Pevensie, there was no good way of handling user
authentication in Gleam-based apps. Auth is a tricky thing to get right, and often
not something you want to be building from scratch yourself. Personally, when
assessing whether to build vs. buy, I look at decisions through the lens of
'core vs context'. Basically, if it's something that's core to your business and
sets you apart from your competitors, you should 'build' it yourself. Anything
else is a good candidate for 'buy'.

Often, 'buying' auth involves using a third party auth provider like
[Clerk](https://clerk.com) or [WorkOS](https://workos.com). Alternatively, you
can use a more comprehensive platform like [Supabase](https://supabase.com)
or [Firebase](https://firebase.google.com), though you that leaves you locked-in
and unable to easily migrate to another provider.

For this reason, authentication libraries have been growing in popularity. These
allow you to store all your user data in your own database, but manage the tables,
API routes, 'forgotten password' flows and everything else for you. This is the
route I decided to go with Pevensie.

## The architecture

One of my big inspirations for creating Pevensie was the PHP framework
[Laravel](https://laravel.com). When Laravel raised their Series A round in late
2024, the developer community was suddenly flooded with a slew of Laravel hype
and content, and I got caught up in the excitement. I looked into the framework for the
first time and was impressed by how quickly you could get something up and running.
I wanted that for Gleam.

In fact, Pevensie's name comes from Lucy Pevensie, a character from C.S. Lewis'
Narnia series. For those who don't know, Cair Paravel - the castle where the Pevensies
live - was also the inspiration for Laravel's name.

In particular, I liked how Laravel was made up from a number of different pieces that
each slotted around a central core to add new functionality to your app with minimal
effort. I liked this a lot, so I wanted to replicate that for Pevensie.

Pevensie's original architecture consisted of a number of 'modules' that exposed
interfaces that would be implemented by a number of 'drivers'. Modules would be
application features like auth, user management, caching, email sending, background
jobs, etc. etc., and drivers would be implementations of those features for different
providers. For example, the auth module might have a driver for Postgres, a driver for
Auth0, and a driver for Google Cloud Identity Platform. The idea was that people could
choose just the modules they needed for their app, and slot in the drivers that suited
their architecture.

It sounds great in theory, but this approach comes with its own problems.

## The problems

First off, I'm a solo developer, and taking all of this on alone would be a monumental
task. I wasn't particularly concerned about that, as I could focus on the core features
first (namely auth) and work my way up from there.

The key downfall was the driver-based approach. I found that, while it wasn't
technically difficult to design the app in such a way as to make this possible, it
wasn't an easy system to organise. Sure, figuring out the minimal interface that each
driver needed to implement was fine - I basically wrote everything for one driver and
just stripped back to just the bits doing I/O - but introducing new features was a
nightmare.

Not only did I have to figure out how to implement the feature across multiple
providers and data storage layers (and there were more of these than were made
public), but because the driver API was public, adding any new required
functionality to a driver interface was a breaking change and would have required a
major version bump.

This made Pevensie V1 _incredibly_ difficult to iterate on as a single person, so...
nothing really got iterated on. Sure, the project still _works_, and there's a
production-ready Postgres driver for Pevensie Auth and Pevensie Cache, but both modules
are honestly a little underbaked, and the user experience isn't up to my usual high
standards.

Pevensie also isn't that trivial to develop with. At the moment, it's just a
collection of functions that, yes, technically allow you to add auth to your app,
but still require a lot of boilerplate around them to create anything resembling
a finished product.

Lastly, the Gleam community has generally settled on Postgres as their database of
choice, helped along by fantastic libraries like [pog](https://github.com/lpil/pog)
and [Squirrel](https://github.com/giacomocavalieri/squirrel). As such, building
drivers outside of Postgres, while useful, is serving a small minority of users, and
given the fact Gleam currently has nothing solving the same problems as Pevensie, it's
more important to have something that works well for the majority than something that
works mediocrely for everyone.

## Pevensie V2

Pevensie V2 is currently but a glint in my eye, but I have a number of ideas for it
that I'm writing down here so that a) I don't forget and b) I can gather community
feedback and suggestions. The main focus of Pevensie V2 will be on operational
simplicity. Ideally, I want Pevensie to be something you can set up in under 10
minutes and then forget about until you need to update it. This will be achieved in a
few different ways.

### No drivers

As mentioned in the title of this article, Pevensie V2 will be a 'monopackage'.
Basically, that means it's just going to be `gleam add pevensie`, and there won't be
any faffing about with drivers or different modules or anything like that (with one
small exception that we'll get into later).

As such, Pevensie will be highly opinionated, at least for now. If you want to use
Pevensie, you'll be using Postgres as your database (at least for now). This is
mostly because, as I said, Postgres is the database of choice for Gleamlins, but it's
also because it's the database I know the best. Also, Postgres can take you
[pretty far](https://www.amazingcto.com/postgres-for-everything/).

It's possible I'll reintroduce Redis if Pevensie Cache comes up again, but recreating
that won't be at the top of my priority list. I'd recommend using my Redis-compatible
client, [Valkyrie](https://github.com/Pevensie/valkyrie) for the time being.

It's possible that Pevensie will support other databases in the future once the core
featureset is better defined.

> But what if I want to use Firebase?

Tough.

> But what if I **_really_** want to use Firebase?

Go see a doctor.

### Auth focus

Pevensie V1 only really supported email and password authentication. While that is the
most basic form of authentication, it comes with its own problems. Implementers have
to manage additional flows like password resets and changes, which can be a pain in
the backside, and password reset flows are common attack vectors. Typically, you'd also
want to include some form of two-factor authentication, too, which adds additional
maintenance burden (even if a library like Pevensie is handling the bulk of it).

As such, while Pevensie V2 will handle email/password authentication, it will also
support OAuth2, which allows application developers to offload the aforementioned
authentication flows to a third-party provider, such as Google, Facebook, or Twitter.
It also simplifies development of apps that rely on these services. For example, many
developer-facing apps have a GitHub integration, so it makes sense to authenticate
with GitHub.

By keeping Pevensie restricted to just Postgres, I'll be able to iterate on these
features much quicker, and ultimately Pevensie will be able to support passkeys,
2FA, magic links, and other authentication methods.

A lot of inspiration will be taken from [The Copenhagen
Book](https://thecopenhagenbook.com/) (formerly Lucia Auth) and other relevant
literature.

### Easier onboarding

One of the biggest problems I personally found when developing applications with
Pevensie was how long it took me to get something up and running. Having to create
individual API endpoints for basic auth actions like signup, login and logout was
unnecessary overhead that will likely be the same for many apps. I would like to
solve this with V2, and I'm currently considering two options.

#### `pevensie/handlers`

Option one takes inspiration from the Better Auth library from the TypeScript
ecosystem. Better Auth provides [a pre-built request handler
function](https://www.better-auth.com/docs/installation#mount-handler) that provides
API endpoints for common operations like those described above. While this does remove
some flexibility from the framework, it provides two key benefits:

1. It's super easy to set up and get running.
2. Pevensie routes are standardised

Point 2. may sound a little strange, but it opens the door to a second Pevensie
library - `pevensie_client`. This would be a small library that provides a type-safe
API for each of the endpoints provided by the Pevensie handlers, constructing
standard [`gleam/http/request.Request`](https://hexdocs.pm/gleam_http/gleam/http/request.html#Request)
values that can be used with any of the Gleam HTTP client libraries, such as
[`gleam_httpc`](https://hexdocs.pm/gleam_httpc/) on the backend (if you wanted to have a
dedicated auth service) or [`gleam_fetch`](https://hexdocs.pm/gleam_fetch/) or
[`rsvp`](https://hexdocs.pm/rsvp/) on the frontend.

#### Handler snippet library

The second option would be to provide these handlers as copy-pastable code snippets
on a documentation site. This provides greater flexibility at the cost of integration
speed. `pevensie_client` could still exist, but developers would have to provide their
own endpoints every time. This isn't a major issue, but it would require more
maintenance effort during major version upgrades, too.

At the moment I'm leaning towards the pre-made handlers. Again, it's a case of solving
the problem in the best way for the majority of users. Users who probably won't need to
customise these routes heavily.

---

There are plenty of other things I would like to bring into the Pevensie ecosystem
too, like email, authenticated background jobs with [`m25`](https://hexdocs.pm/m25/),
object storage, and more, but I haven't put too much time into thinking about those
things just yet. The core focus for the time being will be auth, and other pieces
will be developed as I or other community members need them.

In terms of development, I'll be developing Pevensie V2 internally while I build out
a project that's been on my todo list for a while. Hopefully, by building the library
alongside a real project, and not in isolation, I'll spot problems and edge cases
sooner.

I would greatly value any feedback. I've opened [a discussion on
GitHub](https://github.com/Pevensie/pevensie/discussions/9) for that purpose. Please
let me know your thoughts there!

For now, I hope you have a Gleamin' great day!

Isaac
