# Campus Navigation App — React + Vite

Features:
- Leaflet map (OpenStreetMap tiles)
- Search by building/department
- Accessibility-first toggle (filters non-accessible edges)
- Shortest-path routing (Dijkstra) on sample campus graph
- Simulated GPS navigation and reroute-on-deviation
- Favorites (localStorage)

## Run
```powershell
Push-Location "C:\Users\Akhila\Downloads\swe\web-react"
npm install
npm run dev
```
Then open the URL shown (usually http://localhost:5173).

## Build
```powershell
npm run build
npm run preview
```

## Notes
- Replace sample graph in `src/lib/campus.ts` with your real campus data when ready.
- Indoor/floor routing is out of scope for this phase.
