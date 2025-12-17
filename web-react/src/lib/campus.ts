import { Amenity, Announcement, Building, Comment, Edge, Event, LatLng, Professor, Room } from './graph';

export const Campus: { center: LatLng; buildings: Building[]; edges: Edge[]; amenities: Amenity[]; closures: Edge[]; rooms: Room[]; professors: Professor[]; events: Event[]; announcements: Announcement[]; initialComments: Comment[] } = (() => {
  // Center near Wayne State University, Detroit
  const center = { lat: 42.3591, lng: -83.0664 };
  const buildings = [
    { id: 'ENG', name: 'Engineering Hall', lat: 42.3598, lng: -83.0675, departments: ['ECE', 'CSE'], imageUrl: 'https://picsum.photos/seed/ENG/400/240', rating: 4.5, reviews: [
      { author: 'Akhila', rating: 5, text: 'Great labs and helpful staff.' },
      { author: 'Parthiv', rating: 4, text: 'Wi-Fi can be spotty during peak times.' },
    ] },
    { id: 'LIB', name: 'Main Library', lat: 42.3579, lng: -83.0652, departments: ['Library'], imageUrl: 'https://picsum.photos/seed/LIB/400/240', rating: 4.6, reviews: [
      { author: 'Abhi', rating: 5, text: 'Quiet study spaces and good coffee.' },
      { author: 'Vish', rating: 4, text: 'Print queue gets busy near finals.' },
    ] },
    { id: 'SCI', name: 'Science Hall', lat: 42.356361, lng: -83.0670333, departments: ['Physics', 'Chemistry', 'Biology'], imageUrl: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400&h=240&fit=crop', rating: 4.6, reviews: [
      { author: 'Sugi', rating: 5, text: 'Amazing lecture halls and state-of-the-art labs. Perfect for physics experiments!' },
      { author: 'Aaraiz', rating: 5, text: 'Chemistry equipment is top-tier. Very organized and clean facilities.' },
      { author: 'Professor Anderson', rating: 5, text: 'Excellent research space and collaborative environment.' },
      { author: 'Zara P.', rating: 4, text: 'Great natural lighting in the classrooms. A bit crowded during midterms though.' },
    ], floorMapPath: '/assets/floormaps/science-hall.pdf' },
    { id: 'BUS', name: 'Business School', lat: 42.3572, lng: -83.0689, departments: ['MBA'], imageUrl: 'https://picsum.photos/seed/BUS/400/240', rating: 4.1, reviews: [
      { author: 'Lena', rating: 4, text: 'Modern classrooms and good networking events.' },
    ] },
    { id: 'ART', name: 'Arts Building', lat: 42.3612, lng: -83.0660, departments: ['Design'], imageUrl: 'https://picsum.photos/seed/ART/400/240', rating: 4.4, reviews: [
      { author: 'Sam', rating: 5, text: 'Creative spaces and great lighting.' },
    ] },
    { id: 'GYM', name: 'Recreation Center', lat: 42.3585, lng: -83.0698, departments: ['Rec'], imageUrl: 'https://picsum.photos/seed/GYM/400/240', rating: 4.7, reviews: [
      { author: 'Dana', rating: 5, text: 'Clean facilities and friendly staff.' },
    ] },
    { id: 'ATEC', name: 'Advanced Technology Education Center', lat: 42.509218, lng: -82.974034, departments: ['Advanced Tech', 'Software', 'Engineering'], imageUrl: 'https://picsum.photos/seed/ATEC/400/240', rating: 4.3, reviews: [
      { author: 'Local Student', rating: 4, text: 'Plenty of parking near Lot 4.' },
      { author: 'Visitor', rating: 5, text: 'Auditorium is excellent for seminars.' },
    ] },
  ];

  const edges: Edge[] = [
    ['ENG', 'LIB', 180, true],
    ['ENG', 'SCI', 170, true],
    ['ENG', 'GYM', 220, true],
    ['LIB', 'SCI', 160, true],
    ['LIB', 'BUS', 220, true],
    ['SCI', 'ART', 180, true],
    ['ART', 'GYM', 260, true],
    ['BUS', 'GYM', 200, false],
    ['BUS', 'ENG', 190, true],
    ['ART', 'ENG', 200, true],
    ['ENG', 'ATEC', 3500, true],
    ['ATEC', 'BUS', 3400, true],
  ];

  const amenities: Amenity[] = [
    { id: 'ATM1', name: 'ATM - Student Center', type: 'atm', lat: 42.3586, lng: -83.0668 },
    { id: 'CAFE1', name: 'Cafe - Library', type: 'cafe', lat: 42.3578, lng: -83.0649 },
    { id: 'REST1', name: 'Restroom - Engineering', type: 'restroom', lat: 42.3597, lng: -83.0672 },
    { id: 'WATER1', name: 'Water Fountain - Science', type: 'water', lat: 42.3605, lng: -83.0647 },
    { id: 'SAFE1', name: 'Safety Station - Quad', type: 'water', lat: 42.3592, lng: -83.0660 },
    { id: 'PARK1', name: 'Parking Garage A', type: 'atm', lat: 42.3575, lng: -83.0678 },
    { id: 'REST2', name: 'Restroom - ATEC', type: 'restroom', lat: 42.5093, lng: -82.9741 },
    { id: 'CAFE2', name: 'Cafe - ATEC', type: 'cafe', lat: 42.5092, lng: -82.9739 },
    { id: 'PARK2', name: 'Parking Garage B - ATEC', type: 'atm', lat: 42.5091, lng: -82.9743 },
  ];

  // example closure edge to demonstrate reroute (BUS-GYM)
  const closures: Edge[] = [['BUS', 'GYM', 200, false]];

  const rooms: Room[] = [
    { id: 'ENG-101', buildingId: 'ENG', room: '101', label: 'ENG 101 Lecture' },
    { id: 'ENG-210', buildingId: 'ENG', room: '210', label: 'ENG 210 Lab' },
    { id: 'SCI-115', buildingId: 'SCI', room: '115', label: 'SCI 115 Chemistry' },
    { id: 'LIB-305', buildingId: 'LIB', room: '305', label: 'LIB 305 Study' },
  ];

  const professors: Professor[] = [
    { id: 'PROF-ADA', name: 'Prof. Ada Lovelace', officeBuildingId: 'ENG', officeRoom: '210' },
    { id: 'PROF-TESLA', name: 'Prof. Nikola Tesla', officeBuildingId: 'SCI', officeRoom: '115' },
    { id: 'PROF-CURIE', name: 'Prof. Marie Curie', officeBuildingId: 'SCI', officeRoom: '305' },
  ];

  const events: Event[] = [
    { id: 'EVT-1', title: 'AI Club Meetup', buildingId: 'ENG', time: 'Today 4:00 PM' },
    { id: 'EVT-2', title: 'Library Workshop', buildingId: 'LIB', time: 'Today 2:00 PM' },
    { id: 'EVT-3', title: 'Design Showcase', buildingId: 'ART', time: 'Today 6:00 PM' },
  ];

  const announcements: Announcement[] = [
    { id: 'ANN-1', title: 'Accessibility Route Update', body: 'Temporary ramp added near Engineering Hall entrance.', buildingId: 'ENG', severity: 'info', time: 'Today 10:00 AM' },
    { id: 'ANN-2', title: 'Closure on BUS–GYM', body: 'Detour in effect due to maintenance. Follow signage.', buildingId: 'BUS', severity: 'warning', time: 'Today 9:30 AM' },
    { id: 'ANN-3', title: 'Event: CS Senior Seminar', body: 'Senior project presentations at ATEC auditorium.', buildingId: 'ATEC', severity: 'info', time: 'Tomorrow 3:00 PM' },
    { id: 'ANN-4', title: 'Critical: Weather Advisory', body: 'High winds expected. Use indoor routes where possible.', severity: 'critical', time: 'Tomorrow 8:00 AM' },
  ];

  const initialComments: Comment[] = [
    { id: 'C-1', buildingId: 'ENG', author: 'Parthiv', text: 'The new signage helps a lot!', time: '2025-12-16T14:00:00Z' },
    { id: 'C-2', buildingId: 'ENG', author: 'Abhi', text: 'Restrooms on the second floor are cleaner.', parentId: 'C-1', time: '2025-12-16T15:10:00Z' },
    { id: 'C-3', buildingId: 'ATEC', author: 'Vish', text: 'Parking Lot 4 fills up by 10AM, arrive early!', time: '2025-12-17T09:00:00Z' },
    { id: 'C-4', buildingId: 'SCI', author: 'Sarah M.', text: 'Finding classrooms here is SO hard. The layout is confusing and signage is minimal. Spent 15 minutes looking for room 315!', time: '2025-12-15T10:30:00Z' },
    { id: 'C-5', buildingId: 'SCI', author: 'James K.', text: 'Chemistry lab equipment is top-notch! The faculty are super helpful and the facilities are clean.', time: '2025-12-15T14:20:00Z' },
    { id: 'C-6', buildingId: 'SCI', author: 'Emily R.', text: 'Agreed on the confusing layout. First week was rough! But once you learn it, the building has great study nooks.', parentId: 'C-4', time: '2025-12-15T11:15:00Z' },
    { id: 'C-7', buildingId: 'SCI', author: 'David L.', text: 'Pro tip: Use the floor maps! They saved me so much time. The PDF has all the rooms labeled clearly.', parentId: 'C-4', time: '2025-12-15T16:00:00Z' },
    { id: 'C-8', buildingId: 'SCI', author: 'Maya P.', text: 'Physics lecture hall acoustics are amazing. Dr. Tesla lectures are so clear even from the back row!', time: '2025-12-16T09:45:00Z' },
    { id: 'C-9', buildingId: 'SCI', author: 'Chris T.', text: 'Elevator on the east side is broken again. Take the stairs or use the west elevator.', time: '2025-12-17T08:00:00Z' },
    { id: 'C-10', buildingId: 'SCI', author: 'Aisha N.', text: 'The third floor study lounge is perfect for group projects. Whiteboards everywhere!', time: '2025-12-16T13:30:00Z' },
  ];

  return { center, buildings, edges, amenities, closures, rooms, professors, events, announcements, initialComments };
})();
