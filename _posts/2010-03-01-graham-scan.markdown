---
layout: post
title: "2D Convex Hulls: Graham Scan"
keywords: python, programming, computational geometry, algorithms
description: "Discussion of Ronald Graham's sorting-based approach to computing the convex hull."
---
This is the 2nd post in a series of 3 on 2D convex hull algorithms. The first
covered the [Jarvis March][jarvis post] and here I’ll be covering the [Graham
Scan][graham scan]. The [implementation of the Graham Scan][graham scan code]
is short, but sweet. It handles degenerate cases very well. The next post will
cover [Chan’s algorithm][chan code].

### Graham Scan

Although it may not look it at first glance, the Graham Scan is similar to the
Jarvis March. We start with an extreme point and then find the edges of the
hull iteratively, one at a time. The main difference is that by sorting the
points first, we remove the need to spend $O(n)$ time searching for the next
hull point (though at the cost of making some “mistakes”). Instead, we spend
our effort on updating the hull at each iteration, fixing previous mistakes. It
turns out that fixing the mistakes is pretty easy and we can find the entire
hull in only $O(n)$ comparisons (rather then the $O(nh)$ of the Jarvis
March). The time complexity of the algorithm actually comes from having to
first sort the points in $O(n \log n)$ time.

The original incantation of the Graham Scan sorted the points in angular order
relative to some initial extreme point (eg. sorted in CCW order around the
furthest left point). The convex hull is then constructed iteratively by going
through the sorted list of points, one by one, each time adding the point to
the previous hull. However, adding a point to the previous hull in the Graham
Scan is not as simple as it was in the Jarvis March. In the Jarvis March, we
knew our previous hull points were a subset of our final hull points, so to
“update” the previous hull, we simply add the point found at each iteration to
the end of our list of hull points. However, in the Graham Scan, things are not
so simple.

### Updating the Hull

The hull we have at the start of iteration $i$ is actually the complete
convex hull of the first $i-1$ points in our sorted list. Updating the hull
requires us to find the tangents between the previous hull and point $p_i$,
and replacing all hull edges between these 2 tangents with the tangents
themselves. This may seem hard at first, but because the points were sorted in
CCW order around the first point, $p_1$, it is actually quite simple.

We know the point $p_i$ lies to the left of $p_1 p_i-1$ and all other
points $p_k, 1 < k < i-1$, lie to the right of $p_1 p_{i-1}$, so one
of the tangents will have to be the edge $p_i p_1$. Knowing this, we can find
the other point of tangency by starting at $p_{i-1}$ (the last point in the
list of hull points) and working backwards. The point of tangency is the first
point $p_j, j < i$, where $p_{j-1}, p_j, p_i$ form a left (CCW) turn.
After finding the point $p_j$, we simply remove all points between this and
the other point of tangency, $p_1$ (ie. we simply remove all points after
$p_j$ in our hull list). The point $p_i$ is then appended to the end of our
list of hull points.

In Python, we can implement a function to perform this step (adding a point `r`
to the `hull`) fairly simply: we just keep popping the last item off our list
while `hull[-2]`, `hull[-1]`, `r` don’t form a left turn.

```python
TURN_LEFT, TURN_RIGHT, TURN_NONE = (1, -1, 0)

def turn(p, q, r):
    return cmp((q[0] - p[0])*(r[1] - p[1]) - (r[0] - p[0])*(q[1] - p[1]), 0)

def _keep_left(hull, r):
    while len(hull) > 1 and turn(hull[-2], hull[-1], r) != TURN_LEFT:
        hull.pop()
    hull.append(r)
    return hull
```

This function is incredibly simple. Also, since we insist on left turns only,
it also handles the degenerate case where you have collinear points (ie.
TURN_NONE). However, we run into problems if `r` already exists in the hull. If
you insist on using **sets** only, then each point can only appear once and you
can safely ignore this case, but handling **multisets** is incredibly easy.
Since the points will be added in sorted order, if a point is already in the
hull, then it will be at the very end. To ensure we don’t add a point to the
hull twice, we simply check the point at the end.

```python
def _keep_left(hull, r):
    while len(hull) > 1 and turn(hull[-2], hull[-1], r) != TURN_LEFT:
        hull.pop()
    # We check that hull[-1] != r to handle degenerate cases (ie. multisets)
    if not hull or hull[-1] != r:
    hull.append(r)
    return hull
```

### Sorting the Points

Putting it together, in Python, we could simply sort the list by angular order,
using `turn` (wrapped by `functools.partial()`) as the `cmp` function, then
iterate through this list adding points one at a time to the hull with
`_keep_left`. However, the Graham Scan can actually get away with sorting by
lexicographical order only, instead of angular order. This is not only easier
to implement, but it is also faster in a practical sense (though not
asymptotic). Pretend we added a point at $(0, \infty)$ to the point set. Then
sorting by angular order about this point is equivalent to simply sorting by
the x-coordinate. The convex hull of this modified point set is actually just
the lower hull of our original point set. We can use this idea to split the
algorithm into 3 parts. First we sort the points lexicographically (ie. first
by x-coordiante, then by the y-coordiante) and find the lower hull. Then we
reverse this sorted list and find the upper hull. Finally, we merge the upper
and lower hull together. Doing this in Python, using the `_keep_left` function,
is actually really straightforward. We simply have to keep in mind that the
first point of the lower hull is also the last point of the upper hull and vice
versa. To deal with this, we remove the first and last point from the upper
hull before we merge the 2.

```python
def convex_hull(points):
    """Returns points on convex hull of an array of points in CCW order."""
    points = sorted(points)
    l = reduce(_keep_left, points, [])
    u = reduce(_keep_left, reversed(points), [])
    # We don't include the first or last point when extending l.
    l.extend(u[i] for i in xrange(1, len(u) - 1))
    return l
```

What’s nice about this is that in each iteration we only backtrack through the
list, starting at the last point, by as many points as we will remove +1 more
point $p_j$ (which is where we stop). After we remove these points, they will
never be looked at again, since they are no longer in the hull. This means, if
we account for the +1 point we don’t remove, we can never look at more than
$2n$ hull points during the entire run of the Graham Scan to find the
tangents. Since we only go through the sorted list once, we require only
$O(n)$ time to find the convex hull, but $O(n \log n)$ time to sort the
list first.

I posted the [full source for the Graham Scan in Python (all 20 lines) as a Gist][graham scan code].

[jarvis]: http://en.wikipedia.org/wiki/Jarvis_march "Jarvis March (Gift Wrapping)"
[jarivs code]: http://gist.github.com/252222 "Source code for the Jarvis March"
[graham scan]: http://en.wikipedia.org/wiki/Graham_scan "Graham (Andrews) Scan"
[graham scan code]: http://gist.github.com/242402 "Source code for the Graham Scan"
[chan]: http://www.cs.uwaterloo.ca/~tmchan/conv23d.ps.gz "Chan's Algorithm (original paper)"
[chan code]: http://gist.github.com/252229 "Source code for Chan's algorithm"
