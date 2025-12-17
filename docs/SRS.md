# Software Requirements Specification (SRS)
## Campus Quest - Campus Navigation System

**Version:** 1.0  
**Date:** December 2024  
**Prepared by:** Campus Quest Development Team

---

## 1. System Purpose

### 1.1 Overview
Campus Quest is a web-based campus navigation system designed to help students, faculty, staff, and visitors navigate the Wayne State University campus efficiently. The system provides real-time route computation, accessibility-aware navigation, and integrated campus information services.

### 1.2 Primary Objectives
1. **Wayfinding**: Enable users to find optimal routes between campus buildings
2. **Accessibility**: Provide accessible route options for users with mobility challenges
3. **Information Integration**: Combine navigation with campus amenities, events, and personnel information
4. **User Engagement**: Gamify navigation experience to encourage system adoption

### 1.3 Target Users
- **Students**: Navigate to classes, offices, and campus facilities
- **Faculty**: Locate meeting rooms, colleague offices, and campus services
- **Staff**: Access administrative buildings and service areas
- **Visitors**: Find destinations without prior campus knowledge

### 1.4 Business Value
- Reduces time spent navigating unfamiliar campus areas
- Improves accessibility compliance and support
- Enhances campus experience through integrated information services
- Provides data insights into campus traffic patterns and popular destinations

---

## 2. System Functionality

### 2.1 Core Features

#### 2.1.1 Interactive Campus Map
- **Description**: OpenStreetMap-based interactive map centered on Wayne State University
- **Capabilities**:
  - Pan and zoom controls for map exploration
  - Building markers with popup information
  - Visual route display with green polylines
  - User location indicator (GPS simulation)
- **User Interaction**: Click buildings to select as destination, drag to pan, scroll to zoom

#### 2.1.2 Route Computation
- **Algorithm**: Dijkstra's shortest path algorithm
- **Input**: Origin coordinates, destination building ID, accessibility flag, closure set
- **Output**: Path object with:
  - Coordinate polyline for visualization
  - Turn-by-turn navigation instructions
  - Total distance (meters) and estimated duration (minutes)
  - Building IDs for waypoints
- **Routing Modes**:
  - Standard mode: Shortest path by distance
  - Accessibility mode: Routes using only wheelchair-accessible edges
- **Dynamic Rerouting**: Automatically recomputes route when user deviates >30m from path

#### 2.1.3 Multi-Criteria Search
- **Search Strategies**:
  1. Building name (partial match)
  2. Department name (searches all buildings with matching departments)
  3. Room number or label
  4. Professor name (displays professor's office location)
- **User Experience**:
  - Real-time search results (typeahead)
  - Dropdown with categorized results
  - Click result to set as destination

#### 2.1.4 Amenities Overlay
- **Amenity Types**:
  - Restrooms (sky blue markers)
  - Water fountains (ocean blue markers)
  - ATMs (amber markers)
  - Cafés/dining (pink markers)
  - Safety stations (red markers)
  - Parking areas (green markers)
- **Toggle Control**: Show/hide amenities layer via checkbox
- **Information Display**: Click amenity marker for name and type

#### 2.1.5 Favorites Management
- **Operations**:
  - Add current destination to favorites
  - View list of saved favorites
  - Navigate to favorite location (1-click)
  - Remove favorite from list
- **Persistence**: LocalStorage for cross-session retention
- **Gamification**: +5 XP for adding favorite

#### 2.1.6 Campus Events Integration
- **Display**: Today's events with time and title
- **Navigation**: 1-click navigation to event location
- **Example Events**:
  - Career Fair at Student Center (10:00 AM)
  - Guest Lecture at Engineering Building (2:00 PM)
  - Campus Tour at Library (11:30 AM)

#### 2.1.7 GPS Navigation Simulation
- **Start Navigation**: Simulates GPS updates along computed route (1-second intervals)
- **Deviation Detection**: Monitors distance from route, triggers reroute if >30m off-path
- **Manual Deviation**: "Deviate" button simulates user straying from route (~50m west)
- **Stop Navigation**: Halts GPS simulation
- **Gamification**: +10 XP for starting navigation

#### 2.1.8 Accessibility Features
- **Accessible Routing**: Filters graph to use only wheelchair-accessible edges
- **Visual Feedback**: Checkbox toggle for accessibility mode
- **Route Adaptation**: Automatically recomputes route when accessibility mode changes

#### 2.1.9 Closure Management
- **Dynamic Closures**: Simulates construction/maintenance closures
- **Exclusion Logic**: Closed edges excluded from route computation
- **Simulation**: "Simulate Closure" button activates predefined closures
- **Example**: General Lectures Building ↔ Science Building closure

#### 2.1.10 Internationalization (i18n)
- **Supported Languages**: English (EN), Spanish (ES)
- **Translation Coverage**:
  - UI labels and buttons
  - Navigation instructions
  - Settings controls
- **Language Toggle**: Dropdown selector in header

#### 2.1.11 Gamification System
- **XP Bar**: Visual progress bar (0-100 XP)
- **XP Awards**:
  - +10 XP for starting navigation
  - +5 XP for adding favorite
- **Badges**: Display user level and achievements
  - "Explorer Lv. 1"
  - "Daily Streak" badge
- **Purpose**: Increase user engagement and system adoption

### 2.2 User Workflows

#### Workflow 1: Find Route to Building
1. User enters splash screen, clicks "Start Exploring"
2. User types building name in search bar
3. System displays matching results
4. User clicks result to select destination
5. System computes and displays route from user location
6. User clicks "Start Navigation" to begin GPS simulation
7. System shows turn-by-turn instructions and ETA

#### Workflow 2: Accessible Route Planning
1. User checks "Accessibility-first routing" checkbox
2. User selects destination via search or map click
3. System computes route using only accessible edges
4. System displays accessible route with instructions
5. User navigates along accessible path

#### Workflow 3: Save and Navigate to Favorite
1. User selects destination
2. User clicks "Add to Favorites"
3. System saves favorite to LocalStorage, awards +5 XP
4. Later: User clicks "Go" next to favorite in sidebar
5. System sets favorite as destination and computes route

#### Workflow 4: Find Amenity
1. User checks "Amenities" checkbox
2. System overlays amenity markers on map
3. User clicks amenity marker (e.g., restroom)
4. System shows popup with amenity name and type
5. User navigates to nearby amenity

#### Workflow 5: Navigate to Campus Event
1. User views "Today's Events" section in sidebar
2. User clicks "Navigate" next to event
3. System sets event location as destination
4. System computes and displays route

---

## 3. System Interfaces

### 3.1 User Interface

#### 3.1.1 Splash Screen
- **Purpose**: Welcome screen with branding
- **Elements**:
  - H1: "Campus Quest - Campus Navigation"
  - Animated background (stars, gradient)
  - Badges: "Explorer Lv. 1", "Daily Streak"
  - "Start Exploring" button
- **Interaction**: Click button to enter main application

#### 3.1.2 Header Section
- **Elements**:
  - H2 title: "Campus Quest"
  - Search bar with typeahead
  - Accessibility checkbox
  - Amenities checkbox
  - Language dropdown (EN/ES)
  - Action buttons: Start Navigation, Deviate, Clear, Simulate Closure
  - XP bar with label and progress indicator
- **Layout**: Fixed header at top of viewport

#### 3.1.3 Main Layout
- **Sidebar (Left)**:
  - Destination display pill
  - "Add to Favorites" button
  - Instructions section (ordered list)
  - Distance/ETA pill
  - Favorites list (Go/Remove buttons)
  - Events list (Navigate buttons)
- **Map Section (Right)**:
  - Interactive Leaflet map (full height)
  - Building markers (clickable)
  - Route polyline (green, 5px weight)
  - User location marker (purple circle)
  - Amenity markers (color-coded circles)
  - Loading overlay (on initialization)

#### 3.1.4 Color Scheme (Dark Theme)
- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Accent: `#4f46e5` (indigo-600)
- Success: `#22c55e` (green-500)
- Text: `#f1f5f9` (slate-100)
- Muted: `#94a3b8` (slate-400)

#### 3.1.5 Typography
- Font: System font stack (Inter, -apple-system, SF Pro)
- H1: 2.5rem, bold
- H2: 1.25rem, semibold
- Body: 0.875rem, regular
- Buttons: 0.875rem, medium weight

### 3.2 Software Interfaces

#### 3.2.1 Leaflet.js API (v1.9.4)
- **Purpose**: Interactive map rendering and controls
- **Integration**: Adapter Pattern wraps Leaflet in React component
- **Key Methods**:
  - `L.map()`: Initialize map instance
  - `L.marker()`: Create building markers
  - `L.polyline()`: Draw route paths
  - `L.circleMarker()`: User location and amenity markers
  - `L.tileLayer()`: Load OpenStreetMap tiles

#### 3.2.2 OpenStreetMap Tile API
- **Endpoint**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Protocol**: HTTPS
- **Rate Limiting**: Standard OSM tile usage policy
- **Zoom Levels**: 0-19 (application uses level 16 by default)
- **Attribution**: Required per OSM license

#### 3.2.3 LocalStorage API
- **Purpose**: Persist favorites across sessions
- **Key**: `favorites`
- **Value**: JSON array of `{id: string, displayName: string}[]`
- **Operations**:
  - `localStorage.getItem()`: Load favorites on mount
  - `localStorage.setItem()`: Save favorites on change

### 3.3 Data Interfaces

#### 3.3.1 Campus Data Structure
```typescript
interface Campus {
  center: LatLng;              // Map center coordinates
  buildings: Building[];        // Campus buildings
  edges: Edge[];               // Graph edges with weights
  amenities: Amenity[];        // Campus amenities
  rooms: Room[];               // Rooms within buildings
  professors: Professor[];     // Faculty office locations
  events: Event[];             // Campus events
  closures: [string, string][]; // Closed edges
}
```

#### 3.3.2 Graph Types
```typescript
interface LatLng {
  lat: number;  // Latitude (decimal degrees)
  lng: number;  // Longitude (decimal degrees)
}

interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  departments: string[];
}

interface Edge {
  0: string;  // Origin building ID
  1: string;  // Destination building ID
  2: number;  // Weight (distance in meters)
  3: boolean; // Accessibility flag
}

interface Path {
  id: string;
  points: LatLng[];              // Polyline coordinates
  distance: number;              // Total distance (m)
  duration: number;              // Estimated time (s)
  instructions: NavigationInstruction[];
  nodes: string[];               // Building IDs in path
}

interface NavigationInstruction {
  index: number;
  text: string;                  // e.g., "Walk to Engineering Building (~150 m)"
  maneuverType: string;          // e.g., "straight", "left", "right"
  coordinate: LatLng;
}
```

---

## 4. Performance Criteria

### 4.1 Response Time Requirements

#### 4.1.1 Route Computation
- **Target**: <100ms for typical campus graph (6 buildings, 10 edges)
- **Maximum**: <500ms for expanded campus (50+ buildings)
- **Algorithm Complexity**: O(E log V) where E = edges, V = vertices
- **Optimization**: Dijkstra's algorithm with priority queue (binary heap)

#### 4.1.2 Search Results
- **Target**: <50ms for query processing
- **Implementation**: useMemo memoization with O(n) filtering
- **User Perception**: Instant feedback (typeahead)

#### 4.1.3 Map Rendering
- **Initial Load**: <1.2 seconds (includes loading overlay)
- **Tile Loading**: Progressive (depends on network, cached by browser)
- **Marker Updates**: <16ms (60 FPS) using Leaflet's optimized rendering

#### 4.1.4 UI Interactions
- **Button Click**: <50ms to register action
- **State Updates**: <100ms to reflect in UI
- **Animations**: 60 FPS for smooth transitions

### 4.2 Scalability

#### 4.2.1 Campus Size
- **Current**: 6 buildings, 10 edges, 6 amenities
- **Design Capacity**: 100 buildings, 500 edges, 50 amenities
- **Graph Algorithm**: Scales to 1000+ nodes with efficient implementation

#### 4.2.2 Concurrent Users
- **Architecture**: Static SPA (no backend), unlimited concurrent users
- **Bottleneck**: OpenStreetMap tile server rate limits (mitigated by browser caching)
- **LocalStorage**: Per-user, no shared state

### 4.3 Reliability

#### 4.3.1 Uptime
- **Target**: 99.9% (dependent on hosting provider)
- **Static Assets**: CDN distribution for high availability
- **Graceful Degradation**: System functions without network (cached tiles)

#### 4.3.2 Data Integrity
- **LocalStorage**: Fault-tolerant (try-catch on parse errors)
- **Route Computation**: Null checks prevent crashes on invalid inputs
- **Graph Validation**: Pre-validated campus data structure

### 4.4 Usability

#### 4.4.1 Learnability
- **First-Time Users**: <5 minutes to find first route
- **Onboarding**: Splash screen introduces branding, no tutorial needed
- **Discoverability**: Clear labels and conventional UI patterns

#### 4.4.2 Efficiency
- **Expert Users**: <30 seconds to plan route with multiple criteria
- **Quick Actions**: 1-click navigation to favorites and events
- **Keyboard Support**: Tab navigation, Enter to select search results

#### 4.4.3 Accessibility Compliance
- **WCAG 2.1**: Level AA conformance (target)
- **Screen Readers**: Semantic HTML with ARIA labels
- **Color Contrast**: 4.5:1 minimum for text
- **Keyboard Navigation**: All features accessible without mouse

### 4.5 Maintainability

#### 4.5.1 Code Quality
- **TypeScript**: Static typing for 100% of codebase
- **SOLID Principles**: Applied to all components and services
- **Design Patterns**: 8+ patterns documented in comments
- **Test Coverage**: Unit tests for routing, search, favorites

#### 4.5.2 Documentation
- **Inline Comments**: Comprehensive JSDoc and design pattern annotations
- **SRS**: This document (system specification)
- **Architecture Docs**: Domain model, class diagrams, sequence diagrams
- **README**: Setup instructions and deployment guide

#### 4.5.3 Extensibility
- **Open/Closed Principle**: New features added without modifying existing code
- **Plugin Architecture**: Amenity types, search strategies easily extended
- **Data-Driven**: Campus data in separate module, easily updated

---

## 5. Non-Functional Requirements

### 5.1 Security
- **Data Storage**: LocalStorage only (no sensitive data)
- **Input Validation**: Search queries sanitized
- **XSS Protection**: React's built-in escaping

### 5.2 Browser Compatibility
- **Target Browsers**:
  - Chrome 90+ (primary)
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Mobile**: Responsive design for tablets and smartphones

### 5.3 Localization
- **Languages**: English, Spanish (extensible to more)
- **Format**: Translation object with locale keys
- **Fallback**: English default if translation missing

### 5.4 Legal
- **Licensing**: MIT License (code), ODbL (OpenStreetMap data)
- **Attribution**: OSM contributors credited in map view
- **Privacy**: No user data collection, no cookies

---

## 6. Assumptions and Dependencies

### 6.1 Assumptions
1. Users have modern web browsers with JavaScript enabled
2. Campus building coordinates are accurate
3. Walking speed assumption: 1.4 m/s (~5 km/h)
4. GPS simulation represents real-world GPS accuracy (~5-10m)

### 6.2 Dependencies
- **React 18.2.0**: UI framework
- **Vite 5.0.8**: Build tool
- **TypeScript 5.5.4**: Type system
- **Leaflet 1.9.4**: Mapping library
- **OpenStreetMap**: Tile provider (external service)

### 6.3 Constraints
- **Network**: Requires internet for initial tile loading
- **Browser Storage**: LocalStorage ~5MB limit
- **Performance**: Client-side computation (CPU-bound on user device)

---

## 7. Future Enhancements

### 7.1 Planned Features
1. **Real GPS Integration**: Use device GPS instead of simulation
2. **Turn-by-Turn Voice Navigation**: Audio instructions
3. **Indoor Navigation**: Floor plans and room-level routing
4. **Social Features**: Share routes, favorite locations with friends
5. **Transit Integration**: Campus shuttle and public transit routes
6. **Weather Overlay**: Real-time weather alerts and indoor route suggestions

### 7.2 Technical Debt
1. **Testing**: Expand unit test coverage to >80%
2. **PWA**: Progressive Web App for offline functionality
3. **Backend**: API for real-time closure updates and analytics
4. **Optimization**: Web Workers for heavy graph computations

---

## 8. Acceptance Criteria

### 8.1 Functional Acceptance
- ✅ User can find route between any two campus buildings
- ✅ Accessibility mode produces wheelchair-accessible routes
- ✅ Search finds buildings, departments, rooms, and professors
- ✅ Favorites persist across browser sessions
- ✅ Events list displays with 1-click navigation
- ✅ GPS simulation follows route with automatic rerouting
- ✅ Amenities overlay shows color-coded markers
- ✅ Language switcher translates UI to Spanish

### 8.2 Technical Acceptance
- ✅ HTML validates with no errors (W3C Validator)
- ✅ CSS validates with no errors (Jigsaw Validator)
- ✅ No inline styles (except dynamic width/height for map)
- ✅ Single H1 tag per page (semantic HTML)
- ✅ OOP architecture with documented design patterns
- ✅ SOLID principles applied and commented
- ✅ TypeScript with no `any` types

### 8.3 Performance Acceptance
- ✅ Route computation <100ms for campus graph
- ✅ Search results display <50ms after keystroke
- ✅ Map loads <1.5 seconds on 10 Mbps connection
- ✅ UI animations run at 60 FPS

---

## Appendix A: Glossary

- **Accessibility**: Features supporting users with mobility challenges (wheelchair-accessible routes)
- **Amenity**: Campus facility (restroom, ATM, café, etc.)
- **Building**: Physical structure on campus with unique ID and coordinates
- **Closure**: Temporarily blocked path between buildings (construction, maintenance)
- **Dijkstra's Algorithm**: Graph algorithm for finding shortest paths
- **Edge**: Connection between two buildings with distance and accessibility flag
- **Favorite**: User-saved building for quick access
- **GPS**: Global Positioning System (simulated in this application)
- **Graph**: Data structure representing campus as nodes (buildings) and edges (paths)
- **Polyline**: Series of connected line segments representing a route
- **Reroute**: Recompute route when user deviates from planned path
- **XP**: Experience Points (gamification metric)

---

## Appendix B: References

1. OpenStreetMap: https://www.openstreetmap.org/
2. Leaflet.js Documentation: https://leafletjs.com/reference.html
3. React Documentation: https://react.dev/
4. TypeScript Handbook: https://www.typescriptlang.org/docs/
5. WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
6. IEEE 830-1998: Software Requirements Specification Standard
7. Dijkstra's Algorithm: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

---

**Document Version History:**
- v1.0 (December 2024): Initial release
