---
layout: post
title: Super Simple JavaScript Queue
keywords: javascript, programming, algorithms, size matters
description: "A simple queue implementation, optimized for minified source size."
---
One of the things I like about JavaScript is that it rewards funky coding
techniques. Good JavaScript is short and sweet. Simple to use and fast to
download. The search for simplicity lead me to create this simple
implementation of a queue in Javascript.

```javascript
function q() {
    var head, tail, undefined, f;
    return f = function(x) {
        if (x != undefined) {
            tail = tail ? tail.n = {v: x} : head = {v: x};
            x = f;
        } else {
            x = head ? head.v : undefined;
            head = head == tail ? (tail = undefined) : head.n;
        }
        return x;
    };
}
```

Calling the function `q()` gives you a function. Called without parameters and
it dequeues an item from the queue. Call it with a single parameter and that is
enqueued. When the queue is empty it returns `undefined`. For example,

```javascript
function fail(s) { throw new Error(s) }
var a = q();
a() == undefined || fail();
a(1); a(2); a(3);
a() == 1 && a() == 2 && a() == 3 || fail();
a() == undefined || fail();
// Or...
a = q()(1)(2)(3);
a() == 1 && a() == 2 && a() == 3 && a() == undefined || fail();
```

Of course, being simple means it has a few problems. There is no way to peek at
the value and no way to know the size of the queue. It also can’t store
`undefined` as a value.

Here is a minified version (using [UglifyJS][ughlify]):

```javascript
function q(){var a,b,c,d;return d=function(e){e!=c?(b=b?b.n={v:e}:a={v:e},e=d):(e=a?a.v:c,a=a==b?b=c:a.n);return e}}
```

*In case anyone mentions it, Array’s `push()` and `shift()` is not a
replacement for a proper a queue, since `shift()` is an $O(n)$ operation.*

[uglify]: https://github.com/mishoo/UglifyJS [Uglify JS]
