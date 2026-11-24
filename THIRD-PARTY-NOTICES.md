# Third-party notices

This repository is distributed under the MIT License (see `LICENSE-MIT`). That licence applies to the code written by Gurtam. The components listed below are third-party software included in the repository; they remain under their own licences, which are named in each entry and reproduced at the end of this file.

## Third-party components

### Bootstrap 3.3.1

- Where: `bower_components/apps_bootstrap/bootstrap/js/modal.js`; `bower_components/apps_bootstrap/bootstrap/LICENSE`; `css/bootstrap.css` (stylesheet compiled by Gurtam from the Bootstrap 3.3.1 LESS sources)
- Project: http://getbootstrap.com
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) 2011-2014 Twitter, Inc
- Note: The stylesheet is a custom build: it is compiled from the LESS sources of Bootstrap 3.3.1 together with Gurtam's own variables and additional rules, and does not carry the Bootstrap banner. It also contains normalize.css (listed below).

### normalize.css 3.0.2

- Where: `css/bootstrap.css` (as part of Bootstrap)
- Project: https://github.com/necolas/normalize.css
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) Nicolas Gallagher and Jonathan Neal

### GLYPHICONS Halflings (icon font distributed with Bootstrap)

- Where: `fonts/glyphicons-halflings-regular.eot`, .svg, .ttf, .woff
- Project: http://glyphicons.com/
- Licence: distributed as part of Bootstrap 3.3.1 and used under the licence of Bootstrap: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright © 2013 by Jan Kovarik. All rights reserved.
- Note: The Bootstrap documentation says: "Glyphicons Halflings are normally not available for free, but their creator has made them available for Bootstrap free of cost. As a thank you, we only ask that you include a link back to Glyphicons whenever possible."

### jQuery 3.7.1

- Where: `bower_components/jquery/dist/jquery.min.js`; `bower_components/jquery/LICENSE.txt`
- Project: https://jquery.com/
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright OpenJS Foundation and other contributors, https://openjsf.org/

### NProgress 0.2.0

- Where: `bower_components/nprogress/nprogress.js`; `bower_components/nprogress/License.md`; `css/main.css` (its stylesheet)
- Project: http://ricostacruz.com/nprogress
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) 2013-2014 Rico Sta. Cruz

### RequireJS 2.1.22

- Where: `bower_components/requirejs/require.js`
- Project: http://github.com/jrburke/requirejs
- Licence: dual-licensed by its authors under the MIT License or the new BSD License; used here under the MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.

### Underscore.js 1.8.3

- Where: `bower_components/underscore/underscore-min.js`; `bower_components/underscore/LICENSE`
- Project: http://underscorejs.org
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

### Clusterize.js 1.0.0

- Where: `bower_components/clusterize/clusterize.js`; `bower_components/clusterize/LICENSE`; `css/main.css` (its stylesheet, the `.clusterize-*` rules)
- Project: http://NeXTs.github.com/Clusterize.js/
- Licence: MIT License (SPDX: MIT). Text: see "MIT License" below.
- Copyright notice: Copyright (c) 2015 Denis Lukov

## Licence texts

### MIT License

The following text applies to every component above that refers to the MIT License; the copyright notice of each component is given in its entry.

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Libraries loaded at run time

At run time the app also loads some libraries from the network (for example the Wialon JavaScript SDK). They are not part of this repository and are not covered by this file.
