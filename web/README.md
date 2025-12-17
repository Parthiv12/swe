# Campus Navigation App — Web Prototype

This is a minimal, client-only prototype implementing:
- Search destinations (by building name or department)
- Accessibility-first toggle (filters non-accessible edges)
- Route calculation on a small sample campus graph (Dijkstra)
- Leaflet map with the path rendered
- GPS simulation ("Start Navigation" animates along path)
- Reroute on simulated deviation
- Favorites saved to localStorage

## Run locally
No build step required. Options:

- Double-click `web/index.html` to open in your browser, or
- Serve the folder with a static server (avoids some CORS limits):

```bash
# Using Python 3
cd web
python -m http.server 8080
# Then open http://localhost:8080/
```

## Notes
- Map tiles from OpenStreetMap via Leaflet CDN.
- Data is synthetic and for demonstration only.
- Indoor/floor routing is out of scope for this prototype.
