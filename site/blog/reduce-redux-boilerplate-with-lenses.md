---
title: Reduce Redux Boilerplate with Lenses
description: Redux comes with a lot of boilerplate. Read about one approach to reducing how much you have to write.
date: 2019-11-05
keywords: ['react', 'redux', 'lens', 'lenses', 'functional programming', 'typescript']
---

I've been speaking with [my coworkers][6] a lot lately about all of the boilerplate necessary with a Redux-based app. Usually these conversations break down to "we need yet another framework" vs. "frameworks got us here". Some people have made some very interesting projects as a way of reducing boilerplate for restricted use cases (see: [dva][1], [Kea][2]). My coworker told me about something entirely different though: lenses.

Before this I had never heard of lenses so I am far from an expert. My understanding of lenses is they provide an abstraction over getters and setters in an immutable way. [I recommend this article if you aren't familiar with lenses.][3]. Let me tell you why we think they can be used to significantly simplify a Redux application.

## Immutable Reducers

When working with Redux, it's in our best interest to keep everything immutable. Having an immutable state is what allows for things like time-travel debugging and helps make the app more predictable. To keep everything immutable, we frequently end up writing reducers that look like this:

```ts
const gameReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_PLAYER_SCORE':
      return {
        ...state,
        playerScore: action.payload
      }
    default:
      return state;
  }
}
```

That little `{ ...state, playerScore: action.payload }` is essentially what a lens does when setting a value. The difference is that it works all the way down. Where as before you might write either a series of reducers:

```ts
const stateReducer = combineReducers({
  player: combineReducers({
    position: playerPositionReducer,
    score: playerScoreReducer
  })
})
```

or a single reducer with a bunch of nested spread operations:

```ts
const stateReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_PLAYER_SCORE':
      return {
        ...state,
        player: {
          ...state.player,
          score: action.payload
        }
      }
    default:
      return state;
  }
}
```

you can perform that entire operation with a single lens:

```js
const stateReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_PLAYER_SCORE':
      return playerScoreLens.set(action.payload)
    default:
      return state;
  }
}
```

and it's all still immutable! Now you might be thinking "but now I have to write all of these lenses!" You're right but it's easier than you might think.

## Composability

If you've ever used [`reselect`][5] before you'll know how nice it is to compose together selectors. You write one selector to get a section of the state tree then compose smaller selectors based off of that one. With lenses, you can get the same kind of composability.

```ts
const playerLens = Lens.fromProp<State>()('player')
const playerPositionLens = playerLens
  .compose(Lens.fromProp<State['player']>()('position'))
const playerScoreLens = playerLens
  .compose(Lens.fromProp<State['player']>()('score'))
```

## No More Reducers?

Each of the lenses we write that are composed together from the root of the state produce a new state value whenever a setter is called. That means that every lens you write is a self-contained reducer. If each of these lenses is a reducer then how do we handle actions? Quite simply, by only having a single action.

With one action and one reducer you can hook up your entire Redux store. The One True Action will send out an entire state transformation.

```ts
// The One True Action
const updateState = (state: State) => ({
  type: 'UPDATE_STATE',
  payload: state
})

...

// The One True Reducer
const stateReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return action.payload;
    default:
      return state;
  }
}

...

// How to use them
dispatch(updateState(playerScoreLens.set(10)));
```

## Considerations

We haven't launched this in a production application but we may be experimenting with it now. Here's some of the questions I had as [@tmonte][6] was explaining this to me.

> What if you have cross-functional teams and another team isn't using this approach? How do they respond to your state changes?

Doing this does not stop you from emitting events in the same way as you were before. It just means you need an extra function call when you want to share information.

```ts
dispatch(updateState(playerScoreLens.set(10)));
dispatch(updatePlayerScore(10));
```

> Are lenses memoized? Will this lead to performance problems?

[monocle-ts][4] is not memoized so you would have to provide your own memoization on top of it. In other ways, performance may actually improve since you won't have to call a bunch of different reducers just in case they handle the action you emitted. This isn't a blanket statement though; you'll have to perform your own measurements with your situation.

## Conclusion

Lenses seem like a really cool abstraction that could help a lot with deep state immutability. Really, this idea just fascinated me and I wanted to spew my thoughts on the matter. I'd love to get feedback from you! I'm actively trying to find all of the pros and cons of this approach and would love to hear from people with different experiences than me.

  [1]: https://github.com/dvajs/dva
  [2]: https://kea.js.org/
  [3]: https://medium.com/javascript-scene/lenses-b85976cb0534
  [4]: https://github.com/gcanti/monocle-ts
  [5]: https://github.com/reduxjs/reselect
  [6]: https://github.com/tmonte
