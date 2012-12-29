---
layout: post
title: Suffix Arrays in JavaScript
keywords: javascript, programming, algorithms
description: "An implementation of Kärkkäinen’s and Sanders’s suffix array algorithm in Javascript."
---
[Suffix arrays are a memory efficient data structure][Wikipedia] for storing
the sorted order of the suffixes of a string. There is really nothing fancy;
they are literally just an array of indexes into the string, where each index
represents the start of a suffix.

I recently wrote an implementation (JavaScript) of [Kärkkäinen’s and
Sanders’s linear time algorithm to construct a suffix array][paper] as part of
larger project and [have made it available][repo].

Using it is straightforward. If you have a string, then it works much as expected.

```javascript
var s = "... put some stuff in here ...",
    a = suffixArray(s);
```

If you have anything more complicated, then you can instead pass a function
that takes an index (integer >= 0) and returns a symbol (an integer) along
with its length. For example,

```javascript
var s = [ 0xBEEFCAB, ..., 0xFEEDF00B ],
    a = suffixArray(function(i) {
        return (s[i >> 2] >> ((i & 3) << 3)) & 255;
    }, s.length * 4);
```

[Grab the code and use it, please.][repo]

[Wikipedia]: http://en.wikipedia.org/wiki/Suffix_array "Suffix arrays on wikipedia"
[paper]: http://portal.acm.org/citation.cfm?id=1217856.1217858 "Linear time algorithm to construct a suffix array"
[repo]: http://github.com/tixxit/suffixarray "Source code for the implementation"
