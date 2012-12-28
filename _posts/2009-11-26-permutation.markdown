---
layout: post
title: Permutations and Combinations
keywords: python, programming, bruteforce
---
Quite often while programming I find my self going through all possible
*k*-combinations of a list. That is, all possible unordered sets of size *k*
made up of elements of a list. A few times I have needed to iterate through all
possible permutations of a list. Getting tired of writing nested for-loops, I
wrote a small (~40 SLOC) [Python module to handle combinations (and
permutations)][repo]. It defines two simple iterators, **combinations** and
**permutations** to iterate through *k*-combinations and permutations of lists.

### Combinations

If you’ve taken an intro to programming course, you’ve probably coded something
similar to this:

```python
def sort(lst, cmp=cmp):
    """Sort the list lst."""
    for i in xrange(len(lst)):
        for j in xrange(i + 1, len(lst)):
            if lst[j] &lt; lst[i]:
                lst[j], lst[i] = lst[i], lst[j]
```

This will sort, in-place, the list lst in $T(n) = \binom{n}{2} =
\frac{n(n-1)}{2} = O(n^2)$ comparisons (ie. not very efficient). However, it
illustrates the concepts of combinations. We are actually iterating over all
2-combinations of the set $\{0,1,..,n-1\}$ (albeit, in a particular order). In
this case, we are using the combinations as indices into the list. Now,
obviously there are better ways to sort a list, but, though I hate to admit it,
I will sometimes brute-force my way to a solution using similar methods (mostly
for prototyping or testing more efficient methods for accuracy). For
2-combinations you can just use a loop as above, but what happens when you
are going 3 or 4 nested loops deep? Hiding ugly code is never a good thing,
but if you gotta do it, you might as well not waste several levels of
indentation.

Using the module, we can rewrite the above sorting function as a single
for-loop (obviously this still does not change the $O(n^2)$ time complexity).

```python
from permute import combinations
def sort(lst, cmp=cmp):
    """Sort list lst."""
    for i,j in combinations(range(len(lst)), 2):
        if cmp(a[j], a[i]) &lt; 0:
            a[i], a[j] = a[j], a[i]
```

The function has a couple guarantees. First, the type returned by the
iterator’s next function is the same as the type of the list. Second, the
function combinations guarantees the order passed to the type constructor will
be the same as if you had written *k* nested for-loops as above… In other
words:

```python
x = range(k)
t = type(lst)
for x[0] in xrange(n):
    for x[1] in xrange(x[0] + 1, n):
        ...
        for x[k-1] in xrange(x[k-2] + 1, n):
            v = t(lst[x[i]] for i in xrange(k))
            ...
```

Is equivalent to:

```python
from permute import combinations
for v in combinations(lst, k):
    ...
```

### Permutations

The permutations iterator, as you may have guessed, iterates over all
permutations of a list (in lexicographical order). Using this, we can solve the
[Travelling Salesman Problem][tsp]:

```python
from permute import *

def solve_tsp(weights):
    nodes = list(reduce(lambda s, e: s.update(e) or s, weights.keys(), set()))
    for i,j in combinations(nodes, 2):
        if (i,j) not in weights and (j,i) not in weights:
            weights[(i,j)] = -1
    path, min = [], -1
    for cand in permutations(nodes):
        dist = 0
        for e in ((cand[i-1], cand[i]) for i in xrange(1, len(nodes))):
            d = e in weights and weights[e] or weights[(e[1], e[0])]
            if d &lt; 0:
                dist = -1
                break
            else:
                dist += d
            if dist &gt;= 0 and (min &lt; 0 or dist &lt; min):
                path, min = cand, dist
    return path, min
```

`solve_tsp` takes 1 argument, a map of edges to their corresponding weights and
returns a 2-tuple of the shortest path and its total distance. The “graph” (the
weight map) is assumed to be undirected. For example,

```python
print(solve_tsp({(1,2): 1, (1,3): 2, (1,4): 3, (2,3): 3, (3,4):1}))
```

Gives us the shortest path and its total distance: `([2, 1, 3, 4], 4)`. Going
through all permutations ($n!$) isn’t very practical. Once $n$ gets larger then
you can count on your hands it is really too slow to be of use.

You can [grab the permute module from its github repository][repo].

[tsp]: http://en.wikipedia.org/wiki/Traveling_salesman_problem "Travelling salesman problem on Wikipedia"
[repo]: http://github.com/tixxit/permute "Source code of library"
