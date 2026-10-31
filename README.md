# Nilay Das — Cybersecurity & AI Portfolio

Portfolio site served at **https://nilaydaa.github.io/**

Cybersecurity + AI portfolio with an interactive SOC-ops hero: a drag-to-rotate 3D server-rack scene with animated network traffic, threat and defense modes, and a five-station carousel (SOC Lab, SIEM Dashboard, Endpoint Defense, Cloud Attack Surface, AI Defense).

## Pages
- **Home** — hero + interactive panel + skill marquee + section launcher
- **Projects** — 6 projects in filtered groups (Detection & SOC / AI-ML / Web & automation) with notes dialogs
- **About** — bio + terminal portrait
- **Toolkit** — SOC/detection tooling, languages, cloud/devopps, AI security
- **Learning** — certification track + 12-week roadmap
- **Contact** — email copy + links

## Tech
Plain HTML/CSS/JS. No build step, no external fonts or CDNs — works offline and deploys as-is via GitHub Pages (served from `main`).

## Local run
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
