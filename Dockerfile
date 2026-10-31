# ============================================================================
# Nilay Das — Cybersecurity & AI portfolio (static site)
#
# Build:    docker build -t nilay-portfolio .
# Run:      docker run -d -p 8080:80 --name portfolio nilay-portfolio
# Verify:   open http://localhost:8080
#
# Pure static HTML/CSS/JS — no build step. A single nginx stage is enough.
# ============================================================================

FROM nginx:1.28-alpine

# Slim server config: gzip + cache headers (see nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site files — relative URLs throughout, so any sub-path hosting works too
COPY index.html \
     about.html \
     projects.html \
     toolkit.html \
     learning.html \
     contact.html \
     styles.css \
     app.js \
     favicon.svg \
     /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1/"]
