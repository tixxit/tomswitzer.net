---
layout: post
title: "2D Convex Hulls: Jarvis March"
keywords: python, programming, computational geometry, algorithms
description: "The simple approach to computing the convex hull in 2D."
---
I’ve found myself coding [convex hull][ch] algorithms on a few occasions now,
so I decided to implement a few and talk about them here, in case someone new
to the subject wants to get the quick ‘n’ dirty. The algorithms I will talk
about are the [Jarvis March][jarvis] ([code][jarvis code]), the [Graham
Scan][graham scan] ([code][graham scan code]) and [Chan’s algorithm][chan]
([code][chan code]). I feel they are all different enough that each is worth
looking at, but similar enough that they are worth looking at together. I will
try and focus more on the actual implementation of the algorithms (all in
Python), looking at potential pit falls as well as the niceties, rather then
just rehashing what can be found on Wikipedia. This first post looks at the
Jarvis March.

### Jarvis March

The Jarvis March is probably the simplest convex hull algorithm conceptually.
You start with an [extreme point][extreme] *p* (a vertex of the convex hull) of
a point set. You then find the next point on the convex hull of the point set
in CCW order. This is done by finding the “furthest right” point, relative to
*p*. The furthest right point *q*, relative to *p*, is the point such all other
points in the point set lie to the left of the directed line through *p, q*
(this line lies on the hull boundary). We can then update *p* to *q* and repeat
the process until we end up with the point we started at.

![p, q, r forming a left turn](/img/posts/left-turn.png)

The heart of the algorithm really lies in finding the furthest right point *q*,
relative to an extreme point *p*. Say you have 3 points *p*, *q* and *r*. We
say *p*, *q*, *r* form a left (respectively right) turn if *r* lies to the left
(right) of the directed line through *p* and *q*. We can write a simple
function to determine the turn of 3 points:

```python
TURN_LEFT, TURN_RIGHT, TURN_NONE = (1, -1, 0)

def turn(p, q, r):
    """Returns -1, 0, 1 if p,q,r forms a right, straight, or left turn."""
    return cmp((q[0] - p[0])*(r[1] - p[1]) - (r[0] - p[0])*(q[1] - p[1]), 0)
```

Finding the furthest right point relative to *p* just reduces to simply finding
the minimum point *q* using *turn* with a fixed parameter *p* as our comparison
function. This can is done in $O(n)$ time:

```python
def _next_hull_pt(points, p):
    """Returns the next point on the convex hull in CCW from p."""
    q = points[0] != p and points[0] or points[1]
    for r in (x for x in points if x != p):
        if turn(p, q, r) == TURN_RIGHT:
            q = r
    return q
```

![p in between p & q](/img/posts/degenerate-problem.png)

The above function is simple, but it assumes the points are in general
position; that there are no 3 collinear points. The first problem arises if
there are 2 furthest right points, then we could chose the one that is closer
to *p*, which is not an extreme point (ie. it lies on the hull boundary, but is
not a vertex). This becomes a bigger problem if our first comparison relative
to this “mid-point” is with the 2 vertices on either side of it. We could
possibly “skip” over the furthest right point, since it is not to the right of
the furthest left, but collinear and would end up with the incorrect furthest
right point. Luckily, handling this is rather simple; we insist that if there
is more than 1 furthest right point, we choose the one furthest from p. We can
then rewrite our function, handling this case:

```python
def _dist(p, q):
    """Returns the squared Euclidean distance between p and q."""
    dx, dy = q[0] - p[0], q[1] - p[1]
    return dx * dx + dy * dy

def _next_hull_pt(points, p):
    """Returns the next point on the convex hull in CCW from p."""
    q = p
    for r in points:
        t = turn(p, q, r)
        if t == TURN_RIGHT or t == TURN_NONE and _dist(p, r) > _dist(p, q):
            q = r
    return q
```

The only problem now is finding the first extreme point. This can be done
rather simply by choosing the minimum point in [lexicographical
order][lexi-order]. We can then put this together and simply loop until we end
up where we started:

```python
def convex_hull(points):
    """Returns the points on the convex hull of points in CCW order."""
    hull = [min(points)]
    for p in hull:
        q = _next_hull_pt(points, p)
        if q != hull[0]:
            hull.append(q)
    return hull
```

We will end up going through *h* iterations of the loop, where *h* is the
number of points on the convex hull. Each iteration takes $O(n)$ time to find
the furthest right point, so the total time required is $O(nh)$, which is
suboptimal. However, it is important to remember that suboptimal does not mean
it is useless. The Jarvis March can easily handle very large datasets in memory
constrained environments. The only information you need to maintain between
iterations is the first and last point found. Finding the next point scans
through all points only once; order does not matter. These points could come
from a database cursor, for instance. In this case, your function would return
an iterator of the hull edges (or points) that generates them *on demand*, each
time `next()` is called.

You can also [download the complete version of the code][jarvis code]. Next post I’ll cover the Graham Scan.

[jarvis post]: /2009/12/jarvis-march/ "Discussion of the Jarvis march"
[graham scan post]: /2010/03/graham-scan/ "Discussion of the Graham-Andrews scan"
[chan post]: /2010/12/2d-convex-hulls-chans-algorithm/ "Discussion of Chan's algorithm"
[ch]: http://en.wikipedia.org/wiki/Convex_hull "Convex hulls on Wikipedia"
[jarvis]: http://en.wikipedia.org/wiki/Jarvis_march "Jarvis March (Gift Wrapping)"
[jarvis code]: http://gist.github.com/252222 "Source code for the Jarvis March"
[graham scan]: http://en.wikipedia.org/wiki/Graham_scan "Graham (Andrews) Scan"
[graham scan code]: http://gist.github.com/242402 "Source code for the Graham Scan"
[chan]: http://www.cs.uwaterloo.ca/~tmchan/conv23d.ps.gz "Chan's Algorithm (original paper)"
[chan code]: http://gist.github.com/252229 "Source code for Chan's algorithm"
[extreme]: http://en.wikipedia.org/wiki/Extreme_point "Extreme point on Wikipedia"
[lexi-order]: http://en.wikipedia.org/wiki/Lexicographical_order "Lexicographical order on Wikipedia"
