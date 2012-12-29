---
layout: post
title: Easy Multilingual Theming with XDV
keywords: i18n, programming, plone, theming, xdv
description: "Using language-specific stylesheets in Plone with XDV."
---
I use [Plone][plone] at work (and love it). Lately I’ve started getting into
[using XDV to theme my sites][XDV] (3 so far). It’s fantastic. Our latest site
was put up in a week (from start to finish) using Plone, collective.xdv and
some team work. Anyways, we only had the English version up initially, while we
waited on the translations. When they finally came through, I first plugged it
all into Plone (using LinguaPlone), but now I had to update the theme to
support the French site. Support for the `:lang()` CSS pseudo selector is
lacking in some browsers, so I contemplated for a few minutes, then added 2
rules to my rules.xml file:

```xml
<drop theme="//*[@lang='fr']" if-content="/html[@lang!='fr']" />
<drop theme="//*[@lang='en']" if-content="/html[@lang!='en']" />
```

Problem solved! To handle language-specific CSS, I just created 2 new css
files, one for English and one for French and added a lang attribute in the
link element.

```xml
<link lang="en" href="style-en.css" rel="stylesheet" type="text/css" />
<link lang="fr" href="style-fr.css" rel="stylesheet" type="text/css" />
```

I did the same thing for static text and images as well.

[plone]: http://plone.org/ "Official Plone web site"
[XDV]: http://pypi.python.org/pypi/collective.xdv
