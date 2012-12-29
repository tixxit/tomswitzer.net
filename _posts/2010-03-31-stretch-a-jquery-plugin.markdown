---
layout: post
title: "Stretch: A jQuery Plugin"
keywords: javascript, programming, jquery, text
description: "A jQuery plugin to stretch text to the full width of its container."
---
I created [a jQuery plugin to resize text so that it fills up the full width of
its container][repo]. It does this in a 2 step process:

1. It finds the largest font size (aligned on a pixel) that can be contained by the container without overflow;
2. It finds the maximum amount of word-spacing that can be added without overflow.

There is a similar plugin ([TextFill][TextFill]), however it doesn’t allow the
text to be taller than the initial height, requires a maximum font size to be
given and is non-optimal (performs a $O(n)$ search, $n$ is the font-size of
the final chosen size). My plug-in remedies these problems. It does not
consider the height during the resizing, always fills to the maximum width
(font will be whatever size gets to this width), and runs in $O(\log n)$
time.

Using it is simple. For example, to stretch the heading of this blog to the
full width of its container (*this is no longer true*), we can simply run:

```javascript
$("#header h1").contents().stretch();
```

I also use it to stretch the dates beside the blog posts so the year, month,
and day all have equal width (*I've since changed 'themes'*).

```javascript
$(".post-date").find(".year, .month, .day").stretch();
```

The key here is that whatever you are stretching should be an inline element or
text. You can grab the [stretch plugin from its GitHub repository][repo] or its
[project page on jQuery.com][project].

[repo]: http://plugins.jquery.com/project/stretch "Source code for Stretch"
[TextFill]: http://plugins.jquery.com/project/TextFill "Project page of TextFill plugin"
[project]: http://plugins.jquery.com/project/stretch "Stretch's JQuery Project Page"
