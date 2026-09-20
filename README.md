# Swaraj Kumar — UX Portfolio

Portfolio site for **Swaraj Kumar**, Senior UX Designer at redBus (MakeMyTrip Group), Bangalore.
Plain HTML, CSS and JavaScript — no build step, no framework, no dependencies.

**Live:** https://swaraj-kumarux.github.io/portfolio/

## Structure

```
index.html              Homepage — hero, work, experience, contact
work.html               Work listing
case-studies/           Three long-form case studies
css/home.css            Light design system (hp- prefix) — index + work
css/case-study.css      Dark design system (ns- prefix) — case studies
js/home.js              Scroll reveals
js/bgfx.js              Cursor-reactive background grid + circular cursor
```

## Notes

Two deliberate visual systems: a warm light theme for the homepage and work
listing, and a near-black theme for the case studies themselves.

Typography is Inter throughout, at three weights — Medium 500, SemiBold 600 and
Bold 700.

The background is a single document-wide layer (`.hp-bg`) rather than
per-section backgrounds, so the 62px lattice stays continuous across section
boundaries. `js/bgfx.js` upgrades it to a canvas that scatters cells away from
the pointer; it bails out entirely on touch devices and under
`prefers-reduced-motion`, falling back to the static CSS texture.

## Running locally

Any static server works:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000
