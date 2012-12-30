---
layout: post
title: "2D Convex Hulls: Chan's Algorithm"
keywords: python, programming, computational geometry, algorithms
description: "Discussion of Timothy Chan's optimal output-sensitive convex hull algorithm."
---
This is the last in a series of 3 posts on 2D convex hull algorithms. Chan’s
algorithm is interesting. It runs in $O(n \log h)$ time, where h is the number
of points on the hull. It was not the first optimal output-sensitive convex
hull algorithm, but it is the simplest. The algorithm uses the idea of the
[Jarvis March][jarvis post], but in a novel way, even mixing in the [Graham
Scan][graham scan post]. You can [grab the source code from github][chan code].

### Chan’s Algorithm in a Nutshell

Chan’s paper is very clearly written and most students/enthusiasts shouldn’t
have any problems with it. However, I will reiterate the basic idea of the
algorithm here.

Essentially, the idea is this. You know there are $m$ points on the hull, so
you partition your point set into $n/m$ chunks, each with approximately
~$m$ points. You find the convex hull of each of these chunks in time
$O((n/m) \cdot (m \log m)) = O(n \log m)$ time. We now find the convex hull
of these convex hulls using an approach much like the Jarvis March. We start
with some initial extreme point. Then, to find the next point on the convex
hull (the furthest right point), we first find the point of tangency (on the
“right” side) from this extreme point to each of the convex hulls separately.
The next point is simply the furthest right point amongst the $O(n/m)$ points
of tangency. Finding a single tangent requires only $O(\log m)$ time (as it
is just a bimodal search). Finding all of the tangents requires $O((n/m) \cdot
(\log m))$ time and since we are only doing this for the m points on the hull,
the total running time is $O(n \log m)$.

Of course, the obvious problem here is that we don’t know $m$ ahead of time!

### Finding $m$

It turns out we can find m rather quickly; enough that we don’t ruin our
time-bound of $O(n \log m)$. The main idea is that if we assume the hull has,
at most, $m$ points, then we only need to try to wrap the hull until we reach
$m$ points. If we haven’t ended up where we started by this point, then we
can just give up and guess higher while only wasting $O(n \log m)$ time. To
keep the total number of guesses low enough, we set a parameter $t = 1$ and
set $m = 2^{2^t}$. After each guess that we are wrong, we increment $t$ by
1, and recalculate $m$ (eg. $m = 4, 16, 256, 65536, ...$). Yes, $m$ grows
VERY fast. However, if you analyze the runing time, you can see the reason why.
We can define the time complexity with the following recurrence,

$T(n,t) = O(n \log 2^{2^t}) + T(n, t-1)$.

Since $n \log 2^{2^{t-k}} = n 2^{t-k} \log 2 = O(n (log m) / 2^k)$,

-------- --- -------------------------------------------------------------------------
$T(n,t)$ $=$ $O(n \log 2^{2^t}) + T(n, t-1)$
         $=$ $O(n \log 2^{2^t}) + O(n \log 2^{2^{t-1}}) + ... + O(n \log 2^{2^{t-t}})$
         $=$ $(1 + 1/2 + 1/4 + 1/8 + ... + 1/2^t) * O(n \log m)$
         $<$ $2 * O(n \log m)$
         $=$ $O(n \log m)$.
-------- --- -------------------------------------------------------------------------

### The Implementation

The main loop is pretty straightforward. We simply have to keep updating our
guess for the hull size ($m$). We then split the points into chunks of
(roughly) size $m$ and find the convex hull of these chunks using the Graham
Scan.

```python
def convex_hull(pts):
    """Returns the points on the convex hull of pts in CCW order."""
    for m in (2 ** (2 ** t) for t in xrange(len(pts))):
        hulls = [_graham_scan(pts[i:i + m]) for i in xrange(0, len(pts), m)]
        # more code goes here...
```

The [Graham Scan is just a copy from my previous post][graham scan post].

```python
TURN_LEFT, TURN_RIGHT, TURN_NONE = (1, -1, 0)

def turn(p, q, r):
    """Returns -1, 0, 1 if p,q,r forms a right, straight, or left turn."""
    return cmp((q[0] - p[0])*(r[1] - p[1]) - (r[0] - p[0])*(q[1] - p[1]), 0)

def _keep_left(hull, r):
    while len(hull) > 1 and turn(hull[-2], hull[-1], r) != TURN_LEFT:
            hull.pop()
    return (not len(hull) or hull[-1] != r) and hull.append(r) or hull

def _graham_scan(points):
    """Returns points on convex hull of an array of points in CCW order."""
    points.sort()
    lh = reduce(_keep_left, points, [])
    uh = reduce(_keep_left, reversed(points), [])
    return lh.extend(uh[i] for i in xrange(1, len(uh) - 1)) or lh
```

The next major step is finding an extreme point. We can’t just use `min(pts)`,
since, while this will give us an extreme point, we need to know which of the
chunks this point is in. So, we create a function to return the hull, along
with the point (actually, we return the indices instead). This is pretty much
as you’d expect.

```python
def _min_hull_pt_pair(hulls):
    """Returns the hull, point index pair that is minimal."""
    h, p = 0, 0
    for i in xrange(len(hulls)):
        j = min(xrange(len(hulls[i])), key=lambda j: hulls[i][j])
        if hulls[i][j] < hulls[h][p]:
            h, p = i, j
    return (h, p)
```

It takes a list of lists of points as a single parameter and returns a tuple of
2 indices (ints) into the list of lists of points.

After this we need a way to find the next point in the hull. This requires us
to find the tangents from the extreme point to each of the $n/m$ hulls. We’ll
delay discussion of the implementation of the tangent finding algorithm for
now, and instead use it as a blackbox in another function that simply returns
the next point on the hull.

```python
def _rtangent(hull, p):
    """
    Return the index of the point in hull that the right tangent line from p
    to hull touches.
    """
    # Code goes here...

def _next_hull_pt_pair(hulls, pair):
    """
    Returns the (hull, point) index pair of the next point in the convex
    hull.
    """
    p = hulls[pair[0]][pair[1]]
    # Finding the next point for current hull is a little easier.
    next = (pair[0], (pair[1] + 1) % len(hulls[pair[0]]))
    for h in (i for i in xrange(len(hulls)) if i != pair[0]):
        # Find the right tangent to hull h from the point p.
        s = _rtangent(hulls[h], p)
        # Now figure out if this is further right then our previous guess (next).
        q, r = hulls[next[0]][next[1]], hulls[h][s]
        t = turn(p, q, r)
        if t == TURN_RIGHT or t == TURN_NONE and _dist(p, r) > _dist(p, q):
            next = (h, s)
            # Notice that we are a little more careful with collinear points.
    return next
```

This function takes a list of lists of points and a pair of indices to the
previous hull point. It returns another pair of indices of the next hull point.
Now, with these, we can turn back to our original convex hull function and fill
it out.

```python
def convex_hull(pts):
    """Returns the points on the convex hull of pts in CCW order."""
    for m in (2 ** (2 ** t) for t in xrange(len(pts))):
        hulls = [_graham_scan(pts[i:i + m]) for i in xrange(0, len(pts), m)]
        # Here we find the extreme point and initialize our hull with it.
        hull = [_min_hull_pt_pair(hulls)]
        # We must ensure we stop after no more than m iterations.
        for _ in xrange(m):
            p = _next_hull_pt_pair(hulls, hull[-1])
            if p == hull[0]:
                return [hulls[h][i] for h, i in hull]
            hull.append(p)
```

### Finding Tangents

Now, of course we aren’t quite done yet. We skipped over the implementation of
the O(log n) tangent finding algorithm (n is the size hull). This is actually
the most difficult part of the implementation. It is skipped in the paper, but
is a good exercise to try on your own first.

*Note that this implementation relies heavily on the fact that we are working
with a convex hull that is wound counterclockwise.*

The general structure is similar to binary search on the convex hull. The
difficulty is deciding which half contains the right tangent after we split it.
So, start by breaking the problem down into cases. We have a sub-list of the
original hull and we set c to the median point of this list. Either the tangent
is the c, or it is in the left half, or it is in the right half.

![The 3 cases where the tangent is on the left chain.](/img/posts/cases.png)

Checking if it is c is easy, as both the points before and after c will be to
the left of the line defined by $p$ and $c$ ($p$ is the point we wish to
find the tangent from).

Checking if the tangent is in the the left side of the chain is a little
tougher. However, there are really only 3 cases we need to check for. I’ve
diddled this little drawing that helps illustrate these.

Putting this in code form isn’t too hard. Most importantly, we need to find the
orientation of points before and after c (l), relative to p, c (p, l).

```python
def _rtangent(hull, p):
    """Return the index of the point in hull that the right tangent line from p
    to hull touches.
    """
    l, r = 0, len(hull)
    l_prev = turn(p, hull[0], hull[-1])
    l_next = turn(p, hull[0], hull[(l + 1) % r])
    while l < r:
        c = (l + r) / 2
        c_prev = turn(p, hull[c], hull[(c - 1) % len(hull)])
        c_next = turn(p, hull[c], hull[(c + 1) % len(hull)])
        c_side = turn(p, hull[l], hull[c])
        if c_prev != TURN_RIGHT and c_next != TURN_RIGHT:
            return c
        elif c_side == TURN_LEFT and (l_next == TURN_RIGHT or
                                      l_prev == l_next) or \
                c_side == TURN_RIGHT and c_prev == TURN_RIGHT:
            r = c               # Tangent touches left chain
        else:
            l = c + 1           # Tangent touches right chain
            l_prev = -c_next    # Switch sides
            l_next = turn(p, hull[l], hull[(l + 1) % len(hull)])
    return l
```

And that’s basically it. You can [get the source code at github (as a gist)][chan code].

[jarvis post]: /2009/12/jarvis-march/ "Discussion of the Jarvis march"
[graham scan post]: /2010/03/graham-scan/ "Discussion of the Graham-Andrews scan"
[chan post]: /2010/12/2d-convex-hulls-chans-algorithm/ "Discussion of Chan's algorithm"
[jarvis]: http://en.wikipedia.org/wiki/Jarvis_march "Jarvis March (Gift Wrapping)"
[jarivs code]: http://gist.github.com/252222 "Source code for the Jarvis March"
[graham scan]: http://en.wikipedia.org/wiki/Graham_scan "Graham (Andrews) Scan"
[graham scan code]: http://gist.github.com/242402 "Source code for the Graham Scan"
[chan]: http://www.cs.uwaterloo.ca/~tmchan/conv23d.ps.gz "Chan's Algorithm (original paper)"
[chan code]: http://gist.github.com/252229 "Source code for Chan's algorithm"
