# Campus Quest - Setup & Features Guide

## 🚀 Getting Started

### Installation & Running
```bash
cd web-react
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`

## ✨ Major Enhancements Implemented

### 1. **Science Hall Updates**
- ✅ Fixed coordinates: `42°21'22.9"N 83°04'01.2"W` (42.356361, -83.0670333)
- ✅ Renamed from "Science Center" to "Science Hall"
- ✅ Added high-quality building image
- ✅ Enhanced with 4 detailed reviews

### 2. **Building Detail Panel**
- 📱 Slide-in detail view from the right side when you click on a building
- 🖼️ **Fullscreen image viewing** - Click the ⛶ button to expand building photo
- ⭐ **Full review display** - See all reviews in a beautiful card layout
- 🗺️ **Floor maps integration** - View/navigate PDF floor plans
- 📍 **Quick location info** - Building coordinates and departments
- ← **Back button** - Easy navigation back to map

### 3. **Searchable To/From Navigation** 
- 🚶 **FROM input on top** - Select starting point (default: Current Location)
- 📍 **TO input below** - Select destination
- 🔍 **Live search** - Type to filter buildings and departments
- ✨ **Modern dropdown UI** - Highlighted selected items, smooth animations
- 🎯 **Smart current location** - GPS button to update FROM automatically

### 4. **Enhanced Current Location**
- 💜 **Pulsing marker** - Purple pulsing circle shows your location on map
- 📍 **"Your Current Location" popup** - Click the marker for details
- 🎯 **Auto-routing** - Navigate from current location to any building

### 5. **Rich User Comments & Ratings**
- 💬 **10+ mock comments** for Science Hall
- ✅ **Positive reviews** - About labs, facilities, acoustics
- ⚠️ **Constructive feedback** - Navigation difficulty, crowding
- 💬 **Comment threads** - Replies and discussions
- 🗣️ **Real student voices** - Authentic campus perspectives

### 6. **Floor Map Viewer**
- 📄 **Multi-page PDF support** - Navigate through different floors
- ⬅️➡️ **Prev/Next buttons** - Easy page navigation
- 📊 **Page counter** - Shows current floor / total floors
- 📍 **For Science Hall** - Place your PDF at `/public/assets/floormaps/science-hall.pdf`

### 7. **Stunning UI Design**
- ✨ **Glassmorphism effects** - Frosted glass header with backdrop blur
- 🎨 **Gradient accents** - Purple-to-violet color scheme
- 🌙 **Dark mode optimized** - High contrast, easy on eyes
- 🎭 **Smooth animations** - Slide-ins, fades, scale transforms
- 🎪 **Interactive elements** - Hover effects, button feedback
- 📊 **Enhanced XP bar** - Glowing green bar with smooth transitions

## 📁 File Structure

```
web-react/
├── src/
│   ├── components/
│   │   ├── App.tsx                 # Main container
│   │   ├── MapView.tsx             # Leaflet map integration
│   │   ├── Sidebar.tsx             # Feature tabs
│   │   ├── RouteSelector.tsx       # NEW: To/From search inputs
│   │   ├── BuildingDetailView.tsx  # NEW: Detail panel
│   │   ├── FloorMapViewer.tsx      # PDF viewer
│   │   └── [other components]
│   ├── lib/
│   │   ├── campus.ts               # Campus data (buildings, comments)
│   │   └── graph.ts                # Routing algorithm
│   ├── styles/
│   │   └── index.css               # All styling (ENHANCED)
│   └── assets/
│       └── w.png
├── public/
│   └── assets/
│       └── floormaps/
│           └── science-hall.pdf    # ← PLACE YOUR PDF HERE
└── package.json
```

## 🎯 How to Use

### View Building Details
1. **Click on any building** on the map
2. **Detail panel slides in** from the right
3. **View full information:**
   - Building image (click to fullscreen)
   - All reviews and ratings
   - Department list
   - Floor maps (if available)

### Navigate with To/From
1. **FROM input (top)** - Set starting point
   - Default: "Current Location"
   - Or select any campus building
2. **TO input (below)** - Search and select destination
3. **Click "Simulate Navigation"** to test route

### View Floor Maps
1. Select **Science Hall** from map
2. Detail panel opens
3. Click **"🗺️ View Floor Maps"** button
4. Use Prev/Next to navigate floors
5. Close with "✕ Close" button

### Fullscreen Images
1. Click building image in detail panel
2. Image expands to fullscreen
3. Click anywhere to close

## 📝 Adding More Floor Maps

For each building with floor maps:

1. **Place PDF file:**
   ```
   public/assets/floormaps/{building-id}.pdf
   ```

2. **Update campus.ts:**
   ```typescript
   { 
     id: 'ENG', 
     name: 'Engineering Hall',
     // ... other properties
     floorMapPath: '/assets/floormaps/engineering.pdf'
   }
   ```

3. **Done!** Floor map button appears automatically

## 🎨 Styling Highlights

### Colors
- **Primary**: Purple (`#4f46e5`), Violet (`#8b5cf6`)
- **Success**: Green (`#22c55e`)
- **Warning**: Amber (`#fbbf24`)
- **Error**: Red (`#ef4444`)

### Animations
- **Slide-in panel**: 300ms cubic-out
- **Fade effects**: 200ms ease-out
- **Button feedback**: 120ms ease
- **XP bar fill**: 300ms cubic-bezier
- **Pulse marker**: 2s infinite

## 🔧 Development Notes

### Recent Changes
- Science Hall coordinates corrected
- FROM/TO inputs reordered (FROM on top)
- Building detail view created
- New RouteSelector component
- Enhanced CSS with glassmorphism
- Fixed XP bar via CSS variables

### Known Issues
- Vite cache may need refresh if PDF not showing
- Safari may need `-webkit-` prefix for some effects
- PDF viewer requires 2+ second load time first view

### Next Steps
- Add more building floor maps
- Implement push notifications
- Add indoor navigation
- Expand mock data further

## 🤝 Contributing

All student-made! Developed by Wayne State students:
- Parthiv, Abhi, Vish, Aaraiz, and Sugi

