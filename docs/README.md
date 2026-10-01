# Interactive Kairo showcase

Open `index.html` in a browser, or serve this directory with any static HTTP
server. There is no build step, dependency, external font, analytics or API.

The sculpture uses CSS perspective and transforms. Project selection, layer
separation and motion controls work with native buttons and keyboard input.
The background contains seeded floral contours. A damped spring gives pointer
interaction an elastic response; a radial mask lights nearby forms while distant
contours remain faint. It settles to a still image after interaction.
It has a capped line count and pixel budget, and runs only during interaction
and settling. Motion controls and reduced-motion preferences suppress both
the flow response and sculpture perspective.

Technical-note links target this repository's published Markdown documents.
The local review copy redirects them to rendered local notes. GitHub Pages publishes this directory from `main`, with `.nojekyll` so the
authored HTML, CSS and JavaScript are served directly.
