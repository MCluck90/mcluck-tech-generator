---
title: Abusing Proxies for DSLs
date: 2018-04-05
keywords: ['javascript', 'proxies', 'proxy', 'dsl', 'interpreter']
---

<small>**Disclaimer:** Writing code like this can lead to both the browser and your coworkers hating you. Code like this can be very difficult to test and is going to be slower than just writing code with good old-fashioned functions and sweat. Older browsers will not run this code at all. Consider yourself warned.</small>

<!-- more -->

---

*Spoiler alert: At the end of this article, we'll be able to solve FizzBuzz by writing this*
<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Spoiler</button>

```javascript
dsl.
  set.i(1).
  set.isFizz(x => x % 3 === 0).
  set.isBuzz(x => x % 5 === 0).
  loop(() => dsl.i <= 100, () =>
    dsl.
      iff(
        () => dsl.isFizz(dsl.i) && dsl.isBuzz(dsl.i), () =>
          dsl.fizz.buzz,
        () => dsl.isFizz(dsl.i), () =>
          dsl.fizzz,
        () => dsl.isBuzz(dsl.i), () =>
          dsl.buzzz,
        () => dsl.log(dsl.i)
      ).
      set.i(dsl.i + 1)
  );
```

</div>

---

One of my favorite past-times is stretching the edges of JavaScript. Writing inane things just because you can is a great way to ensure job security through obscurity. So put on your apron because the *Plat du jour* is Proxies.

Proxies are a tool used for metaprogramming. They allow you to reach into common object operations, such as getting and setting properties, and make them do whatever you want. All it takes is wrapping an object in a call to `new Proxy` to open up a magical realm. You can read more at [MDN][1].

```javascript
let novice = {
  name: 'Magnifico the Magician'
};
let magician = new Proxy(novice, {
  get(wizard, prop) {
    if (prop === 'hat') {
      return 'rabbit';
    }
    return wizard[prop];
  }
});

magician.name; // 'Magnifico the Magician'
magician.hat;  // 'rabbit'
```

Et voilà! That's real, working code. What we've done here is added a handler or "trap" for the `get` operation on an object. The handler is passed the object it's acting on (in this case, `novice` which we renamed to `wizard`) and the name of the property you're accessing. There's a lot more that you can hook into with proxies but today we're only going to use this part of them. However, using just this small part, we're going to make our own DSL or domain-specific language.

Before we get too deep into it, we need a goal for our little language. As any programmer worth their salt knows, FizzBuzz is one of the great challenges of our era. While some "scientists" are wasting time optimizing door-to-door sales, we're going to design a language which allows us to solve the problem that has perplexed interviewers since the beginning of (Unix) time.

## Write the chains that bind

No self-respecting DSL would require you to reference it all of the time. It doesn't need that kind of validation. That's why the first thing we need to do is allow our "interpreter" to chain. That means that every property access will return the original "interpreter". Access the DSL once, always have access to it.

```javascript
let dsl = new Proxy({}, {
  get(_, prop) {
    return dsl;
  }
});

dsl.
  it.just.keeps.going.
  and.going.
  and.going;
```

But we don't always have to return `dsl`. We could also return other values, such as functions. Normally, this would lead to a break in the chain and everything would come crashing down. However, as long as those functions return `dsl` then we can keep our chain going. With that, we've setup our little world so let's go say hi.

```javascript
let dsl = new Proxy({}, {
  get(_, prop) {
    const rule = grammar[prop];
    if (rule) {
      // Pass along the DSL so we can continue chaining.
      // We're passing an object because we intend to extend
      // this later down the line.
      return rule({ dsl });
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

// I'm moving the different grammar rules into a separate object.
// Helps keep things nice and clean
const grammar = {
  log({ dsl }) {
    // Check this out, we can return a function
    // instead of the usual chaining
    return (...args) => {
      console.log(...args);
      // Now we reapply the chain after the function call
      return dsl;
    };
  }
};

dsl.
  log('hello world').   // 'hello world'
  log('goodbye world'); // 'goodbye world'
```

## Take a token or two

This is great and all but at this point, we just have a chained function. We could have done that without all of the song and dance surrounding proxies. What we want to do is create our own special statements and for that we need to process tokens. For those of you who don't know, a token is not just something you use to represent yourself in a board game or trade for a ride on a ferry. Tokens, in compiler vernacular, refer to the tiny bits that make up a language. Things like `if`, `i`, and `+`. Each individual "word" in a programming language (including operators, numbers, etc.) is a token. For our language, we want to be able to print out "FizzBuzz" so let's combine a few tokens to generate a statement which will do this for us.

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(_, token) { // <-- Bam! No longer a property but a token
    tokens.push(token);
    // Minor deviation: we swapped `token` for `tokens[0]`
    // We want to use the first token in the stream to match
    // different rules since individual rules may require
    // multiple tokens
    const rule = grammar[tokens[0]];
    if (rule) {
      // Here's a cool trick: we can tell it to only
      // call the rule function if enough tokens
      // have been added to the stream
      if (tokens.length !== rule.length) {
        return dsl;
      }
      // Pass along the tokens so we can modify them as needed
      return rule({ dsl, tokens }, ...tokens.slice(1));
    }

    return dsl;
  }
});

const grammar = {
  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    // Matched a statement, clear the token stream
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');

    return dsl;
  },

  log({ dsl, tokens }) { ... }
};

dsl.
  fizz.buzz. // "FizzBuzz"
  fizz.buzz; // "FizzBuzz"
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(_, token) { // <-- Bam! No longer a property but a token
    tokens.push(token);
    // Minor deviation: we swapped `token` for `tokens[0]`
    // We want to use the first token in the stream to match
    // different rules since individual rules may require
    // multiple tokens
    const rule = grammar[tokens[0]];
    if (rule) {
      // Here's a cool trick: we can tell it to only
      // call the rule function if enough tokens
      // have been added to the stream
      if (tokens.length !== rule.length) {
        return dsl;
      }
      // Pass along the tokens so we can modify them as needed
      return rule({ dsl, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    // Matched a statement, clear the token stream
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');

    return dsl;
  },

  log({ dsl, tokens }) {
    // Matched a statement, clear the token stream
    tokens.splice(0, tokens.length);

    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  fizz.buzz. // "FizzBuzz"
  fizz.buzz; // "FizzBuzz"
```

</div>

## Data is only a state of mind

We've got some essential groundwork taken care of so let's start actually building up a language. First things first, we need to be able to get and set values. No data means no program. We could just store all of our data using `let` or `const` (not `var`, fight me) but where's the fun in that? Instead, we're going to use that dummy object we've been wrapping up in a proxy as our state object. This also makes it easier to refer to values by name.

I'll warn you in advance: I lied a little bit earlier. I said we'd only need to access `dsl` once to run our whole language. The reality is that we'll need to access it again for sub-expressions. I hope you'll forgive me.

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) { // <-- Now we're wrapping around the state
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }

      // Need to pass along the state now
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    return dsl;
  }
});

const grammar = {
  // Here's how we're going to assign values
  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    // `identifier` will give us the name of the variable
    return (value) => {
      // Now we use a function so we can assign any value at all
      // to our variable
      state[identifier] = value;
      return dsl;
    };
  },
  ...
};

dsl.
  set.mind('empty').
  log(dsl.mind). // 'empty'
  set.mind('full').
  log(dsl.mind); // 'full'
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) { // <-- Now we're wrapping around the state
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }
      // Need to pass along the state now
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  // Here's how we're going to assign values
  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    // `identifier` will give us the name of the variable
    return (value) => {
      // Now we use a function so we can assign any value at all
      // to our variable
      state[identifier] = value;
      return dsl;
    };
  },

  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');
    return dsl;
  },

  log({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  set.mind('empty').
  log(dsl.mind). // 'empty'
  set.mind('full').
  log(dsl.mind); // 'full'
```

</div>

Fun fact: we're done working on the `get` handler. Everything we need to build up and process our language is there. 20 lines of code is enough to process simple statements and expressions. Now we just have to write the actual rules of our language.

## If and only if

`if`. The great fork in the road. Used quadrillions of times (citation needed) and the only thing used in advanced artificial intelligence. If you're going to make a language, you need some way to change course based on the whims of the data. This is surprisingly easy to build into our language. We really just need a single statement that takes in two functions: one as the predicate (the thing which produces a boolean value) and one as the body (the thing that runs when the condition is true).

```javascript
const grammar = {
  // iff -> "if and only if"
  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (predicate, body) => {
      if (predicate()) {
        body();
      }
      return dsl;
    };
  },
  ...
};

dsl.
  set.isSkynet(true).
  iff(() => dsl.isSkynet, () =>
    dsl.log('take over the world') // 'take over the world'
  ).
  iff(() => !dsl.isSkynet, () =>
    dsl.log('not gonna happen')
  );
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) {
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  // iff -> "if and only if"
  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (predicate, body) => {
      if (predicate()) {
        body();
      }
      return dsl;
    };
  },

  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    return (value) => {
      state[identifier] = value;
      return dsl;
    };
  },

  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');
    return dsl;
  },

  log({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  set.isSkynet(true).
  iff(() => dsl.isSkynet, () =>
    dsl.log('take over the world') // 'take over the world'
  ).
  iff(() => !dsl.isSkynet, () =>
    dsl.log('not gonna happen')
  );
```

</div>

But hey, we're computer scientists. We can make this a little smarter. Put on your brain pants because we're going to allow--wait for it--`else`. Not only that, but we're going to allow `else if` and it will all work in the same statement.

```javascript
const grammar = {
  // iff -> "if and only if"
  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      for (let i = 0; i < args.length; i += 2) {
        let predicate = args[i];
        let body = args[i + 1];

        // If there's no body, this must be the `else` clause
        if (!body) {
          predicate();
          return dsl;
        }

        if (predicate()) {
          body();
          return dsl;
        }
      }
      return dsl;
    };
  },
  ...
};

dsl.
  set.isSkynet(false).
  set.isTerminator(false).
  set.isSarahConnor(!dsl.isSkynet && !dsl.isTerminator).
  // else-if
  iff(
    () => dsl.isSkynet, () =>
      dsl.log('take over the world'),
    () => dsl.isSarahConnor, () =>
      dsl.log('destroy the Terminator')
  ). // 'destroy the Terminator'
  // else
  iff(
    () => dsl.isSkynet, () =>
      dsl.log('take over the world'),
    () => dsl.isTerminator, () =>
      dsl.log('destroy Sarah Connor'),
    () => dsl.log('the world is safe')
  ); // 'the world is safe'
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) {
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  // iff -> "if and only if"
  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      for (let i = 0; i < args.length; i += 2) {
        let predicate = args[i];
        let body = args[i + 1];

        // If there's no body, this must be the `else` clause
        if (!body) {
          predicate();
          return dsl;
        }

        if (predicate()) {
          body();
          return dsl;
        }
      }
      return dsl;
    };
  },

  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    return (value) => {
      state[identifier] = value;
      return dsl;
    };
  },

  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');
    return dsl;
  },

  log({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  set.isSkynet(false).
  set.isTerminator(false).
  set.isSarahConnor(!dsl.isSkynet && !dsl.isTerminator).
  // else-if
  iff(
    () => dsl.isSkynet, () =>
      dsl.log('take over the world'),
    () => dsl.isSarahConnor, () =>
      dsl.log('destroy the Terminator')
  ). // 'destroy the Terminator'
  // else
  iff(
    () => dsl.isSkynet, () =>
      dsl.log('take over the world'),
    () => dsl.isTerminator, () =>
      dsl.log('destroy Sarah Connor'),
    () => dsl.log('the world is safe')
  ); // 'the world is safe'
```

</div>

## Here we go loop-de-loop

A key component of the *FizzBuzz Conundrum*<sup>1</sup> is the need to iterate over many values. For this I think, now stay with me here, we should use a loop. It seems impossible but I'm going to blow your mind a little bit. We're going to add looping and it's going to be super easy. You could write it yourself. Go ahead and think on it for a second.

---

Yup, just like an `if` statement. It's pretty easy once you've got the essentials written.

```javascript
const grammar = {
  loop({ dsl, tokens }) {
    tokens.splice(0, tokens.length);

    return (predicate, body) => {
      while (predicate()) {
        body();
      }
      return dsl;
    };
  },
  ...
};

dsl.
  set.i(1).
  loop(() => dsl.i <= 10, () =>
    dsl.
      log(dsl.i). // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      set.i(dsl.i + 1)
  );
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) {
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  loop({ dsl, tokens }) {
    tokens.splice(0, tokens.length);

    return (predicate, body) => {
      while (predicate()) {
        body();
      }
      return dsl;
    };
  },

  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      for (let i = 0; i < args.length; i += 2) {
        let predicate = args[i];
        let body = args[i + 1];

        // If there's no body, this must be the `else` clause
        if (!body) {
          predicate();
          return dsl;
        }

        if (predicate()) {
          body();
          return dsl;
        }
      }
      return dsl;
    };
  },

  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    return (value) => {
      state[identifier] = value;
      return dsl;
    };
  },

  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');
    return dsl;
  },

  log({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  set.i(1).
  loop(() => dsl.i <= 10, () =>
    dsl.
      log(dsl.i). // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      set.i(dsl.i + 1)
  );
```

</div>

## The Grand Finale

This is the moment you've all been waiting for. We have all of the tools we need to write a solution to the insurmountable FizzBuzz problem. You've ascended this mountain with me, now it's time to place our flag. Just for `A E S T H E T I C` reasons, we're going to add a couple more statements to our language.

```javascript
const grammar = {
  fizzz({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    dsl.log('Fizz');
    return dsl;
  },

  buzzz({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    dsl.log('Buzz');
    return dsl;
  },
  ...
};

dsl.
  set.i(1).
  set.isFizz(x => x % 3 === 0).
  set.isBuzz(x => x % 5 === 0).
  loop(() => dsl.i <= 100, () =>
    dsl.
      iff(
        () => dsl.isFizz(dsl.i) && dsl.isBuzz(dsl.i), () =>
          dsl.fizz.buzz,
        () => dsl.isFizz(dsl.i), () =>
          dsl.fizzz,
        () => dsl.isBuzz(dsl.i), () =>
          dsl.buzzz,
        () => dsl.log(dsl.i)
      ).
      set.i(dsl.i + 1)
  );
```

<div class="hidden-codeblock">

<button class="toggle-codeblock">Show/Hide Full Code</button>

```javascript
let tokens = [];
let dsl = new Proxy({}, {
  get(state, token) {
    // Before anything, we're going to try and access a variable
    if (tokens.length === 0 && state[token] !== undefined) {
      return state[token];
    }

    tokens.push(token);
    const rule = grammar[tokens[0]];
    if (rule) {
      if (tokens.length !== rule.length) {
        return dsl;
      }
      return rule({ dsl, state, tokens }, ...tokens.slice(1));
    }

    // No matching rule, just keep on chugging along
    return dsl;
  }
});

const grammar = {
  fizzz({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    dsl.log('Fizz');
    return dsl;
  },

  buzzz({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    dsl.log('Buzz');
    return dsl;
  },

  loop({ dsl, tokens }) {
    tokens.splice(0, tokens.length);

    return (predicate, body) => {
      while (predicate()) {
        body();
      }
      return dsl;
    };
  },

  iff({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      for (let i = 0; i < args.length; i += 2) {
        let predicate = args[i];
        let body = args[i + 1];

        // If there's no body, this must be the `else` clause
        if (!body) {
          predicate();
          return dsl;
        }

        if (predicate()) {
          body();
          return dsl;
        }
      }
      return dsl;
    };
  },

  set({ dsl, state, tokens }, identifier) {
    tokens.splice(0, tokens.length);

    return (value) => {
      state[identifier] = value;
      return dsl;
    };
  },

  fizz({ dsl, tokens }, buzz) {
    if (buzz !== 'buzz') {
      throw new SyntaxError(`Expected "buzz", got "${buzz}"`);
    }
    tokens.splice(0, tokens.length);

    dsl.log('FizzBuzz');
    return dsl;
  },

  log({ dsl, tokens }) {
    tokens.splice(0, tokens.length);
    return (...args) => {
      console.log(...args);
      return dsl;
    };
  }
};

dsl.
  set.i(1).
  set.isFizz(x => x % 3 === 0).
  set.isBuzz(x => x % 5 === 0).
  loop(() => dsl.i <= 100, () =>
    dsl.
      iff(
        () => dsl.isFizz(dsl.i) && dsl.isBuzz(dsl.i), () =>
          dsl.fizz.buzz,
        () => dsl.isFizz(dsl.i), () =>
          dsl.fizzz,
        () => dsl.isBuzz(dsl.i), () =>
          dsl.buzzz,
        () => dsl.log(dsl.i)
      ).
      set.i(dsl.i + 1)
  );
```

</div>

## Conclusion

And there we have it! Much to the joy of interviewers and computer scientists alike, we've successfully solved the elusive FizzBuzz problem. I'll be sure to include you as a contributor on the academic paper which will follow. You're ready to storm the doors of Apple, Microsoft, or Google and demand whatever salary you want.

Oh yeah, we also learned a thing or two about proxies.

---

Real talk: Why would you want to use this? I'm not sure. I could imagine proxies being useful for polyfills and perhaps for, exactly this, various DSLs. Could be a nice way of writing a SQL query generator or as a way of documenting business needs. If nothing else, it adds another tool to your belt and maybe you will find a much more useful application for this interesting bit of tech.

---

<small>
References:

1: Cluck, Mike. *Fizzle and Buzz: The Problem of a Century*. Dijkstra & Knuth, 20XX BC (Before Computing)
</small>

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
