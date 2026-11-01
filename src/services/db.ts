import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuditEvent,
  Booking,
  CheckinRecord,
  CheckoutRecord,
  IncidentReport,
  NotificationItem,
  ResourceItem,
  ResourceReview,
  UserProfile,
  UserRole,
  WaitlistEntry
} from '../types';
import { validateBookingSlot } from '../utils/rules';

// Supabase environment variables
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const rawSupabaseUrl = ((env as Record<string, string>).VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = ((env as Record<string, string>).VITE_SUPABASE_ANON_KEY || '').trim();

function isValidHttpUrl(urlString: string): boolean {
  if (!urlString) return false;
  if (
    urlString.includes('your-project') ||
    urlString.includes('MY_') ||
    urlString === 'undefined' ||
    urlString === 'null'
  ) {
    return false;
  }
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function initSupabase(): SupabaseClient | null {
  if (
    !isValidHttpUrl(rawSupabaseUrl) ||
    !rawSupabaseAnonKey ||
    rawSupabaseAnonKey.includes('your-anon-key') ||
    rawSupabaseAnonKey.includes('MY_')
  ) {
    return null;
  }

  try {
    return createClient(rawSupabaseUrl, rawSupabaseAnonKey);
  } catch (err) {
    console.warn('Supabase initialization failed, falling back to local demo storage:', err);
    return null;
  }
}

export const supabase: SupabaseClient | null = initSupabase();
export const isSupabaseConfigured: boolean = Boolean(supabase !== null);


// Pre-seeded Demo Profiles
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr-sarah-chen',
    display_name: 'Dr. Sarah Chen',
    email: 'sarah.chen@apex.edu',
    role: 'requester',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    department: 'Robotics & Automation',
    verified_trainings: [
      'Laser Safety Level 2',
      '3D Sintering Certification',
      'Electrical Hazard Training'
    ]
  },
  {
    id: 'usr-marcus-vance',
    display_name: 'Prof. Marcus Vance',
    email: 'm.vance@apex.edu',
    role: 'owner',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    department: 'Mechanical Engineering & FabLab',
    verified_trainings: [
      'Laser Safety Level 2',
      '3D Sintering Certification',
      'CNC Operations Master',
      'High Voltage Certified'
    ]
  },
  {
    id: 'usr-elena-rostova',
    display_name: 'Elena Rostova',
    email: 'e.rostova@apex.edu',
    role: 'manager',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    department: 'Dean of Research Infrastructure',
    verified_trainings: ['All Institutional Facilities']
  },
  {
    id: 'usr-david-kim',
    display_name: 'David Kim',
    email: 'admin@apex.edu',
    role: 'admin',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    department: 'Platform Systems Administration',
    verified_trainings: ['Master Administrator Authorization']
  }
];

// Pre-seeded Demo Resources
export const SEED_RESOURCES: ResourceItem[] = [
  {
    id: 'res-3d-printer-01',
    title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
    category: 'Engineering Tools',
    description: 'Commercial-grade Selective Laser Sintering (SLS) 3D printer for end-use nylon parts with zero support structures and superior mechanical strength.',
    location_label: 'Maker Wing, Room 204',
    building: 'Engineering Hall',
    room: '204',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      'Build Volume': '165 × 165 × 300 mm',
      'Material Compatibility': 'Nylon 11, Nylon 12, TPU 90A',
      'Laser Spot Size': '200 microns',
      'Recycle Rate': 'Up to 70% refreshed powder ratio'
    },
    rules: [
      'Must wear certified safety goggles and respirator while handling powder',
      'Pre-heating takes 45 mins; do not open chamber lid during sintering',
      'Clean chamber sifter and vacuum station thoroughly after job completion'
    ],
    eligibility_rules: {
      restricted: true,
      department: 'Robotics & Automation',
      required_training: ['Laser Safety Level 2', '3D Sintering Certification']
    },
    supervision_required: false,
    max_duration_hours: 8,
    availability_schedule: 'Mon–Fri: 08:30 – 19:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 28,
    cost_label: '$28/hr (Nylon Consumables Included)',
    cost_billing_model: 'Subsidized FabLab Material Fee',
    average_rating: 4.9,
    total_reviews: 2,
    created_at: '2026-10-15T09:00:00.000Z',
    updated_at: '2026-10-30T14:00:00.000Z'
  },
  {
    id: 'res-oscilloscope-02',
    title: 'Digital Storage Oscilloscope 200MHz (Rigol DS1054Z)',
    category: 'Laboratory Equipment',
    description: 'High-precision 4-channel digital oscilloscope with deep memory capture, advanced waveform math, FFT spectrum analysis, and serial bus decoding.',
    location_label: 'Electronics Wing, Lab B-12',
    building: 'Science & Tech Complex',
    room: 'B-12',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Bandwidth: '200 MHz',
      Channels: '4 Analog Channels',
      'Sample Rate': '1 GSa/s real-time',
      'Memory Depth': '24 Mpts standard'
    },
    rules: [
      'Check ground clip polarity before hooking to live circuits',
      'Maximum input voltage rating: 300 Vrms CAT I',
      'Return 4x 10:1 passive probes to accessory kit upon return'
    ],
    eligibility_rules: {
      restricted: false,
      required_training: ['Electrical Hazard Training']
    },
    supervision_required: false,
    max_duration_hours: 6,
    availability_schedule: 'Mon–Sat: 09:00 – 21:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 0,
    cost_label: '$0/hr (Free Student & Faculty Access)',
    cost_billing_model: 'Institutional Core Facility Grant',
    average_rating: 5.0,
    total_reviews: 1,
    created_at: '2026-10-18T10:30:00.000Z',
    updated_at: '2026-10-28T11:20:00.000Z'
  },
  {
    id: 'res-robotics-03',
    title: 'Autonomous Mobile Robotics Workcell (Universal Robots UR5e)',
    category: 'Robotics Equipment',
    description: 'Collaborative 6-axis robotic arm integrated with Robotiq 2F-85 adaptive gripper and Intel RealSense D435i depth camera for pick-and-place automation and computer vision research.',
    location_label: 'Robotics Arena, Station 4',
    building: 'Innovation Hub',
    room: 'Station 4',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Payload: '5 kg (11 lbs)',
      Reach: '850 mm radius',
      Repeatability: '±0.03 mm',
      'Vision Sensor': 'Intel RealSense RGB-D'
    },
    rules: [
      'Emergency Stop pendant must remain within arm reach at all times',
      'Keep safety perimeter clear of obstacles during trajectory execution',
      'Load teach pendant program from authorized workspace directory only'
    ],
    eligibility_rules: {
      restricted: true,
      department: 'Robotics & Automation',
      required_training: ['Laser Safety Level 2']
    },
    supervision_required: true,
    max_duration_hours: 4,
    availability_schedule: 'Mon–Fri: 10:00 – 17:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 35,
    cost_label: '$35/hr (Certified Lab Attendant Included)',
    cost_billing_model: 'Specialized Research Facility Surcharge',
    average_rating: 4.8,
    total_reviews: 1,
    created_at: '2026-10-20T12:00:00.000Z',
    updated_at: '2026-10-31T08:00:00.000Z'
  },
  {
    id: 'res-workstation-04',
    title: 'AI Deep Learning Workstation (Dual RTX 4090, 128GB RAM)',
    category: 'Computers and Laptops',
    description: 'High-throughput compute rig optimized for local LLM inference, PyTorch model training, NeRF rendering, and computational fluid dynamics simulations.',
    location_label: 'Computing Pod 3A',
    building: 'Advanced Informatics Center',
    room: 'Pod 3A',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      GPU: '2x NVIDIA GeForce RTX 4090 (48GB VRAM Total)',
      CPU: 'AMD Ryzen Threadripper 7970X 32-Core',
      Memory: '128 GB DDR5 ECC',
      Storage: '4 TB Gen5 NVMe scratch drive'
    },
    rules: [
      'Store checkpoint weights in designated project directory',
      'Clear scratch disk cache before checking out',
      'Do not disable temperature monitoring daemon'
    ],
    eligibility_rules: {
      restricted: false
    },
    supervision_required: false,
    max_duration_hours: 12,
    availability_schedule: 'Available 24/7 with reservation',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 8,
    cost_label: '$8/hr (Subsidized GPU Power & Cooling)',
    cost_billing_model: 'High-Performance Compute Fund',
    average_rating: 5.0,
    total_reviews: 1,
    created_at: '2026-10-12T14:00:00.000Z',
    updated_at: '2026-10-29T16:00:00.000Z'
  },
  {
    id: 'res-seminar-05',
    title: 'Executive Seminar Hall & Smart Interactive Display',
    category: 'Meeting Rooms',
    description: 'Modern 45-person collaborative space with 85-inch 4K digital whiteboard, dual tracking PTZ cameras, ceiling mic array, and hybrid teleconference link.',
    location_label: 'Block A, Level 3, Hall 301',
    building: 'Innovation Wing Block A',
    room: 'Hall 301',
    owner_id: 'usr-elena-rostova',
    owner_name: 'Elena Rostova',
    owner_email: 'e.rostova@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Capacity: '45 Seated participants',
      AV: '85-inch Interactive Touch 4K Display',
      Audio: 'Shure Microflex Ceiling Array',
      Connectivity: 'HDMI, USB-C 100W PD, Wireless Cast'
    },
    rules: [
      'Wipe digital marker screen with microfiber cloth only',
      'No open drink containers without spill-proof lids',
      'Reset furniture to horseshoe layout at end of booking'
    ],
    eligibility_rules: {
      restricted: false
    },
    supervision_required: false,
    max_duration_hours: 4,
    availability_schedule: 'Mon–Fri: 08:00 – 20:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 0,
    cost_label: '$0/hr (Complimentary Academic Booking)',
    cost_billing_model: 'Campus Facilities Allocation',
    average_rating: 4.7,
    total_reviews: 3,
    created_at: '2026-10-10T11:00:00.000Z',
    updated_at: '2026-10-25T15:30:00.000Z'
  },
  {
    id: 'res-camera-06',
    title: 'Sony FX3 Cinema Camera Production Kit',
    category: 'Photography and Audio Equipment',
    description: 'Full-frame cinema line 4K 120fps camera rig with Sony FE 24-70mm f/2.8 GM II lens, dual XLR handle audio, wireless lavaliers, and Ronin RS3 gimbal.',
    location_label: 'Media Arts Center, Locker M-04',
    building: 'Creative Arts Center',
    room: 'Locker M-04',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Sensor: '12.1MP Full-Frame Exmor R CMOS',
      Video: '4K up to 120p 10-bit 4:2:2 All-Intra',
      Stabilization: '5-Axis In-Body + Active EIS',
      Media: '2x 160GB CFexpress Type A Cards'
    },
    rules: [
      'Keep lens cap on when not actively recording',
      'Do not expose to rain or heavy mist without weather cover',
      'Verify battery charge levels and return to charging cradle'
    ],
    eligibility_rules: {
      restricted: false
    },
    supervision_required: false,
    max_duration_hours: 8,
    availability_schedule: 'Mon–Sat: 09:00 – 18:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 15,
    cost_label: '$15/hr (Lens Insurance & Wear Surcharge)',
    cost_billing_model: 'Creative Media Lab Upkeep Fund',
    average_rating: 4.9,
    total_reviews: 2,
    created_at: '2026-10-14T10:00:00.000Z',
    updated_at: '2026-10-27T17:00:00.000Z'
  },
  {
    id: 'res-fumehood-07',
    title: 'ISO Class 6 Chemical Fume Hood & Wet Bench',
    category: 'Laboratory Equipment',
    description: 'Laminar airflow wet process workstation with acid-resistant polypropylene hood, dual DI water spray gun, N2 blow-off, and chemical spill catchment tank.',
    location_label: 'Cleanroom Wing, Bay 3',
    building: 'Materials Science Pavilion',
    room: 'Bay 3',
    owner_id: 'usr-elena-rostova',
    owner_name: 'Elena Rostova',
    owner_email: 'e.rostova@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Cleanliness: 'ISO Class 6 (Class 1000)',
      Exhaust: '1200 CFM scrubbed exhaust',
      Utilities: 'DI Water (18 MOhm), Nitrogen 99.999%',
      Safety: 'Automatic fire suppression & chemical sensor'
    },
    rules: [
      'Must wear cleanroom suit, chemical apron, and nitrile over-gloves',
      'All chemical waste must be poured into designated neutralized waste jugs',
      'Log chemical lot numbers in wet bench logbook before etching'
    ],
    eligibility_rules: {
      restricted: true,
      required_training: ['Laser Safety Level 2', 'Electrical Hazard Training']
    },
    supervision_required: true,
    max_duration_hours: 4,
    availability_schedule: 'Mon–Fri: 09:00 – 17:00',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 0,
    cost_label: '$0/hr (Sponsored by Dean Research Grant)',
    cost_billing_model: 'Campus Cleanroom Endowment',
    average_rating: 4.8,
    total_reviews: 1,
    created_at: '2026-10-16T08:00:00.000Z',
    updated_at: '2026-10-29T10:00:00.000Z'
  },
  {
    id: 'res-cnc-08',
    title: 'Precision 5-Axis CNC Mill (Haas Mini Mill Edu)',
    category: 'Engineering Tools',
    description: 'Compact 5-axis vertical machining center equipped with high-speed spindle, flood coolant, Renishaw wireless intuitive probing system, and 10-tool automatic changer.',
    location_label: 'Machine Shop, Bay 10',
    building: 'Engineering Hall',
    room: 'Bay 10',
    owner_id: 'usr-marcus-vance',
    owner_name: 'Prof. Marcus Vance',
    owner_email: 'm.vance@apex.edu',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      Travels: 'X: 406mm, Y: 305mm, Z: 254mm',
      Spindle: '10,000 RPM, 7.5 HP vector drive',
      Tooling: 'BT30 10-pocket automatic changer',
      Control: 'Haas NextGen CNC Controller'
    },
    rules: [
      'Run dry cycle (air cut) before engaging workpiece',
      'Never open enclosure door while spindle is running',
      'Vacuum all aluminum chips and clean way-covers at session end'
    ],
    eligibility_rules: {
      restricted: true,
      department: 'Robotics & Automation',
      required_training: ['CNC Operations Master']
    },
    supervision_required: false,
    max_duration_hours: 6,
    availability_schedule: 'Mon–Sat: 08:30 – 19:30',
    requires_approval: true,
    status: 'active',
    cost_per_hour: 22,
    cost_label: '$22/hr (Coolant & Endmill Wear)',
    cost_billing_model: 'Department Tooling Consumables Fee',
    average_rating: 4.9,
    total_reviews: 2,
    created_at: '2026-10-17T11:00:00.000Z',
    updated_at: '2026-10-30T16:00:00.000Z'
  }
];

export const SEED_REVIEWS: ResourceReview[] = [
  {
    id: 'rev-seed-01',
    booking_id: 'book-seed-02',
    resource_id: 'res-oscilloscope-02',
    resource_title: 'Digital Storage Oscilloscope 200MHz (Rigol DS1054Z)',
    user_id: 'usr-sarah-chen',
    user_name: 'Dr. Sarah Chen',
    user_department: 'Robotics & Automation',
    rating: 5,
    comment: 'Exceptional signal integrity. FFT spectrum analysis and low noise floor made it effortless to pinpoint the 40kHz PWM ripple on our brushless motor controller.',
    reliability_score: 5,
    cleanliness_score: 5,
    created_at: '2026-10-30T13:25:00.000Z'
  },
  {
    id: 'rev-seed-02',
    booking_id: 'book-prev-01',
    resource_id: 'res-3d-printer-01',
    resource_title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
    user_id: 'usr-alex-rivera',
    user_name: 'Alex Rivera',
    user_department: 'Aerospace Systems',
    rating: 5,
    comment: 'Flawless nylon 12 sintering! Zero dimensional warping across our full 300mm rotor brackets. Sifter station was clean and ready to operate.',
    reliability_score: 5,
    cleanliness_score: 5,
    created_at: '2026-10-28T16:00:00.000Z'
  },
  {
    id: 'rev-seed-03',
    booking_id: 'book-prev-02',
    resource_id: 'res-3d-printer-01',
    resource_title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
    user_id: 'usr-elena-rostova',
    user_name: 'Elena Rostova',
    user_department: 'Dean of Research Infrastructure',
    rating: 4.8,
    comment: 'Consistent mechanical strength for load-bearing brackets. Remember to allow the full 45-minute chamber thermal stabilization cycle.',
    reliability_score: 5,
    cleanliness_score: 4.8,
    created_at: '2026-10-25T11:30:00.000Z'
  },
  {
    id: 'rev-seed-04',
    booking_id: 'book-prev-03',
    resource_id: 'res-workstation-04',
    resource_title: 'AI Deep Learning Workstation (Dual RTX 4090, 128GB RAM)',
    user_id: 'usr-liam-zhang',
    user_name: 'Liam Zhang',
    user_department: 'Computer Science',
    rating: 5,
    comment: 'Blazing fast throughput for distributed LLM finetuning. Scratch drive sustained over 6 GB/s sequential reads.',
    reliability_score: 5,
    cleanliness_score: 5,
    created_at: '2026-10-27T09:15:00.000Z'
  }
];

// Pre-seeded Demo Bookings
export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'book-seed-01',
    resource_id: 'res-3d-printer-01',
    resource_title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
    resource_category: 'Engineering Tools',
    resource_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    location_label: 'Maker Wing, Room 204',
    requester_id: 'usr-sarah-chen',
    requester_name: 'Dr. Sarah Chen',
    requester_email: 'sarah.chen@apex.edu',
    requester_department: 'Robotics & Automation',
    start_at: '2026-11-02T13:00:00.000Z',
    end_at: '2026-11-02T16:00:00.000Z',
    purpose: 'Fabricating ultra-light bio-mimetic drone frame components',
    num_users: 2,
    training_confirmed: true,
    rules_agreed: true,
    status: 'pending',
    eligibility_status: 'verified',
    created_at: '2026-10-31T09:30:00.000Z',
    updated_at: '2026-10-31T09:30:00.000Z'
  },
  {
    id: 'book-seed-02',
    resource_id: 'res-oscilloscope-02',
    resource_title: 'Digital Storage Oscilloscope 200MHz (Rigol DS1054Z)',
    resource_category: 'Laboratory Equipment',
    resource_image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    location_label: 'Electronics Wing, Lab B-12',
    requester_id: 'usr-sarah-chen',
    requester_name: 'Dr. Sarah Chen',
    requester_email: 'sarah.chen@apex.edu',
    requester_department: 'Robotics & Automation',
    start_at: '2026-10-30T10:00:00.000Z',
    end_at: '2026-10-30T13:00:00.000Z',
    purpose: 'PWM motor controller ripple calibration',
    num_users: 1,
    training_confirmed: true,
    rules_agreed: true,
    status: 'returned',
    eligibility_status: 'verified',
    decision_by: 'Prof. Marcus Vance',
    decision_at: '2026-10-29T14:00:00.000Z',
    created_at: '2026-10-29T11:00:00.000Z',
    updated_at: '2026-10-30T13:15:00.000Z'
  },
  {
    id: 'book-seed-03',
    resource_id: 'res-workstation-04',
    resource_title: 'AI Deep Learning Workstation (Dual RTX 4090, 128GB RAM)',
    resource_category: 'Computers and Laptops',
    resource_image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    location_label: 'Computing Pod 3A',
    requester_id: 'usr-sarah-chen',
    requester_name: 'Dr. Sarah Chen',
    requester_email: 'sarah.chen@apex.edu',
    requester_department: 'Robotics & Automation',
    start_at: '2026-10-31T11:00:00.000Z',
    end_at: '2026-10-31T17:00:00.000Z',
    purpose: 'Training perception model for object classification',
    num_users: 1,
    training_confirmed: true,
    rules_agreed: true,
    status: 'checked_out',
    eligibility_status: 'verified',
    decision_by: 'Prof. Marcus Vance',
    decision_at: '2026-10-31T10:30:00.000Z',
    created_at: '2026-10-31T10:00:00.000Z',
    updated_at: '2026-10-31T11:05:00.000Z'
  }
];

// Seed Handover Records
export const SEED_CHECKINS: CheckinRecord[] = [
  {
    id: 'chk-seed-01',
    booking_id: 'book-seed-03',
    resource_id: 'res-workstation-04',
    checked_in_by: 'usr-marcus-vance',
    checked_in_by_name: 'Prof. Marcus Vance',
    checked_in_at: '2026-10-31T11:05:00.000Z',
    initial_condition: 'excellent',
    accessories_issued: ['Dual 4K Monitor Cables', 'Security USB Dongle', 'Headset'],
    notes: 'Clean scratch partition allocated. Dual RTX 4090 thermal levels baseline 34°C.',
    photo_refs: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'chk-seed-02',
    booking_id: 'book-seed-02',
    resource_id: 'res-oscilloscope-02',
    checked_in_by: 'usr-marcus-vance',
    checked_in_by_name: 'Prof. Marcus Vance',
    checked_in_at: '2026-10-30T10:05:00.000Z',
    initial_condition: 'excellent',
    accessories_issued: ['4x Passive Probes', 'Power Cord', 'BNC-to-Alligator Lead'],
    notes: 'Calibrated October 2026. All channels clean.',
    photo_refs: []
  }
];

export const SEED_CHECKOUTS: CheckoutRecord[] = [
  {
    id: 'chko-seed-02',
    booking_id: 'book-seed-02',
    resource_id: 'res-oscilloscope-02',
    checked_out_by: 'usr-sarah-chen',
    checked_out_by_name: 'Dr. Sarah Chen',
    checked_out_at: '2026-10-30T13:10:00.000Z',
    final_condition: 'excellent',
    accessories_returned: ['4x Passive Probes', 'Power Cord', 'BNC-to-Alligator Lead'],
    notes: 'Returned in full working order. All cables accounted for.',
    photo_refs: [],
    return_confirmed_by: 'Prof. Marcus Vance',
    return_confirmed_at: '2026-10-30T13:15:00.000Z'
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    recipient_id: 'usr-marcus-vance',
    type: 'booking_submitted',
    title: 'New Booking Request',
    body: 'Dr. Sarah Chen requested Industrial SLS 3D Printer for Nov 2, 2026 (13:00 - 16:00).',
    related_booking_id: 'book-seed-01',
    related_resource_id: 'res-3d-printer-01',
    read: false,
    created_at: '2026-10-31T09:30:00.000Z'
  },
  {
    id: 'notif-02',
    recipient_id: 'usr-sarah-chen',
    type: 'checked_out',
    title: 'Resource Handover Confirmed',
    body: 'Prof. Marcus Vance handed over AI Deep Learning Workstation in Excellent condition.',
    related_booking_id: 'book-seed-03',
    related_resource_id: 'res-workstation-04',
    read: true,
    created_at: '2026-10-31T11:05:00.000Z'
  }
];

export const SEED_AUDIT: AuditEvent[] = [
  {
    id: 'aud-01',
    actor_id: 'usr-sarah-chen',
    actor_name: 'Dr. Sarah Chen',
    actor_role: 'requester',
    action: 'Booking Requested',
    entity_type: 'booking',
    entity_id: 'book-seed-01',
    entity_title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
    details: 'Submitted reservation for 3 hours (Nov 2). Purpose: Rapid drone rotor prototype.',
    occurred_at: '2026-10-31T09:30:00.000Z'
  },
  {
    id: 'aud-02',
    actor_id: 'usr-marcus-vance',
    actor_name: 'Prof. Marcus Vance',
    actor_role: 'owner',
    action: 'Handover Completed',
    entity_type: 'handover',
    entity_id: 'chk-seed-01',
    entity_title: 'AI Deep Learning Workstation (Dual RTX 4090)',
    details: 'Resource checked out to Dr. Sarah Chen. Initial condition: Excellent. Accessories issued: 3 items.',
    occurred_at: '2026-10-31T11:05:00.000Z'
  }
];

export const SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-01',
    booking_id: 'book-seed-02',
    resource_id: 'res-oscilloscope-02',
    resource_title: 'Digital Storage Oscilloscope 200MHz',
    reported_by_id: 'usr-sarah-chen',
    reported_by_name: 'Dr. Sarah Chen',
    reported_by_role: 'requester',
    type: 'missing_accessory',
    description: 'Channel 4 BNC ground clip spring was slightly stiff upon opening box. Works after minor contact cleaning.',
    evidence_refs: [],
    status: 'resolved',
    resolution_note: 'Inspected by lab manager. Spring re-lubricated with dielectric grease. Ready for service.',
    assigned_to: 'Prof. Marcus Vance',
    resolved_at: '2026-10-30T14:00:00.000Z',
    created_at: '2026-10-30T10:15:00.000Z'
  }
];

// Storage Engine Implementation
class DataStore {
  private resources: ResourceItem[] = [];
  private bookings: Booking[] = [];
  private checkins: CheckinRecord[] = [];
  private checkouts: CheckoutRecord[] = [];
  private incidents: IncidentReport[] = [];
  private reviews: ResourceReview[] = [];
  private notifications: NotificationItem[] = [];
  private auditEvents: AuditEvent[] = [];
  private waitlist: WaitlistEntry[] = [];
  private currentProfile: UserProfile = DEMO_PROFILES[0]; // Dr. Sarah Chen by default

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedRes = localStorage.getItem('rb_resources');
      const parsedRes: ResourceItem[] = savedRes ? JSON.parse(savedRes) : [...SEED_RESOURCES];
      this.resources = parsedRes.map(r => ({
        ...r,
        cost_per_hour: r.cost_per_hour ?? (r.id === 'res-3d-printer-01' ? 28 : r.id === 'res-robotics-03' ? 35 : r.id === 'res-workstation-04' ? 8 : r.id === 'res-camera-06' ? 15 : r.id === 'res-cnc-08' ? 22 : 0),
        cost_label: r.cost_label || (r.cost_per_hour ? `$${r.cost_per_hour}/hr` : '$0/hr (Free Student & Faculty Access)'),
        cost_billing_model: r.cost_billing_model || 'Institutional Allocation'
      }));

      const savedBookings = localStorage.getItem('rb_bookings');
      this.bookings = savedBookings ? JSON.parse(savedBookings) : [...SEED_BOOKINGS];

      const savedCheckins = localStorage.getItem('rb_checkins');
      this.checkins = savedCheckins ? JSON.parse(savedCheckins) : [...SEED_CHECKINS];

      const savedCheckouts = localStorage.getItem('rb_checkouts');
      this.checkouts = savedCheckouts ? JSON.parse(savedCheckouts) : [...SEED_CHECKOUTS];

      const savedIncidents = localStorage.getItem('rb_incidents');
      this.incidents = savedIncidents ? JSON.parse(savedIncidents) : [...SEED_INCIDENTS];

      const savedReviews = localStorage.getItem('rb_reviews');
      this.reviews = savedReviews ? JSON.parse(savedReviews) : [...SEED_REVIEWS];

      const savedNotifs = localStorage.getItem('rb_notifications');
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : [...SEED_NOTIFICATIONS];

      const savedAudit = localStorage.getItem('rb_audit');
      this.auditEvents = savedAudit ? JSON.parse(savedAudit) : [...SEED_AUDIT];

      const savedWaitlist = localStorage.getItem('rb_waitlist');
      this.waitlist = savedWaitlist ? JSON.parse(savedWaitlist) : [];

      const savedProfile = localStorage.getItem('rb_active_profile');
      if (savedProfile) {
        this.currentProfile = JSON.parse(savedProfile);
      }
    } catch {
      this.resources = [...SEED_RESOURCES];
      this.bookings = [...SEED_BOOKINGS];
      this.checkins = [...SEED_CHECKINS];
      this.checkouts = [...SEED_CHECKOUTS];
      this.incidents = [...SEED_INCIDENTS];
      this.reviews = [...SEED_REVIEWS];
      this.notifications = [...SEED_NOTIFICATIONS];
      this.auditEvents = [...SEED_AUDIT];
      this.waitlist = [];
    }
  }

  private save() {
    try {
      localStorage.setItem('rb_resources', JSON.stringify(this.resources));
      localStorage.setItem('rb_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('rb_checkins', JSON.stringify(this.checkins));
      localStorage.setItem('rb_checkouts', JSON.stringify(this.checkouts));
      localStorage.setItem('rb_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('rb_reviews', JSON.stringify(this.reviews));
      localStorage.setItem('rb_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('rb_audit', JSON.stringify(this.auditEvents));
      localStorage.setItem('rb_waitlist', JSON.stringify(this.waitlist));
      localStorage.setItem('rb_active_profile', JSON.stringify(this.currentProfile));
    } catch {
      // Ignore quota error in tests
    }
  }

  resetToDemo() {
    this.resources = [...SEED_RESOURCES];
    this.bookings = [...SEED_BOOKINGS];
    this.checkins = [...SEED_CHECKINS];
    this.checkouts = [...SEED_CHECKOUTS];
    this.incidents = [...SEED_INCIDENTS];
    this.reviews = [...SEED_REVIEWS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.auditEvents = [...SEED_AUDIT];
    this.waitlist = [];
    this.currentProfile = DEMO_PROFILES[0];
    this.save();
  }

  // Active User Profile
  getCurrentProfile(): UserProfile {
    return this.currentProfile;
  }

  setCurrentProfile(profile: UserProfile) {
    this.currentProfile = profile;
    this.save();
  }

  switchRole(role: UserRole) {
    const match = DEMO_PROFILES.find(p => p.role === role);
    if (match) {
      this.setCurrentProfile(match);
    }
  }

  // Resources
  getResources(): ResourceItem[] {
    return [...this.resources];
  }

  getResourceById(id: string): ResourceItem | undefined {
    return this.resources.find(r => r.id === id);
  }

  saveResource(item: Partial<ResourceItem> & { title: string; category: any; location_label: string }): ResourceItem {
    const isEdit = Boolean(item.id);
    let saved: ResourceItem;

    if (isEdit && item.id) {
      const idx = this.resources.findIndex(r => r.id === item.id);
      if (idx !== -1) {
        this.resources[idx] = {
          ...this.resources[idx],
          ...item,
          updated_at: new Date().toISOString()
        } as ResourceItem;
        saved = this.resources[idx];
      } else {
        throw new Error('Resource not found');
      }
    } else {
      saved = {
        id: `res-${Date.now()}`,
        title: item.title,
        category: item.category,
        description: item.description || '',
        location_label: item.location_label,
        building: item.building || 'Main Campus',
        room: item.room || 'TBD',
        owner_id: this.currentProfile.id,
        owner_name: this.currentProfile.display_name,
        owner_email: this.currentProfile.email,
        organisation_id: this.currentProfile.organisation_id,
        organisation_name: this.currentProfile.organisation_name,
        image_url: item.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        gallery: item.gallery || [],
        specifications: item.specifications || {},
        rules: item.rules || ['Follow lab health & safety guidelines'],
        eligibility_rules: item.eligibility_rules || { restricted: false },
        supervision_required: Boolean(item.supervision_required),
        max_duration_hours: item.max_duration_hours || 4,
        availability_schedule: item.availability_schedule || 'Mon–Fri 09:00 – 17:00',
        requires_approval: item.requires_approval !== false,
        status: item.status || 'active',
        cost_per_hour: item.cost_per_hour ?? 0,
        cost_label: item.cost_label || (item.cost_per_hour ? `$${item.cost_per_hour}/hr` : '$0/hr (Free Student & Faculty Access)'),
        cost_billing_model: item.cost_billing_model || 'Department Subsidized Facility',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.resources.unshift(saved);
    }

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: isEdit ? 'Resource Updated' : 'Resource Created',
      entity_type: 'resource',
      entity_id: saved.id,
      entity_title: saved.title,
      details: `${isEdit ? 'Modified' : 'Published'} listing in category ${saved.category}`
    });

    this.save();
    return saved;
  }

  // Bookings
  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(b => b.id === id);
  }

  createBooking(params: {
    resource_id: string;
    start_at: string;
    end_at: string;
    purpose: string;
    num_users?: number;
    training_confirmed: boolean;
    rules_agreed: boolean;
  }): { success: boolean; booking?: Booking; error?: string } {
    const resource = this.getResourceById(params.resource_id);
    if (!resource) {
      return { success: false, error: 'Target resource does not exist.' };
    }

    // Server-side / state-level validation
    const validation = validateBookingSlot(
      this.bookings,
      resource.id,
      params.start_at,
      params.end_at,
      resource.max_duration_hours
    );

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    if (!params.rules_agreed) {
      return { success: false, error: 'You must agree to the equipment safety and usage rules.' };
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      resource_id: resource.id,
      resource_title: resource.title,
      resource_category: resource.category,
      resource_image: resource.image_url,
      location_label: resource.location_label,
      requester_id: this.currentProfile.id,
      requester_name: this.currentProfile.display_name,
      requester_email: this.currentProfile.email,
      requester_department: this.currentProfile.department,
      start_at: new Date(params.start_at).toISOString(),
      end_at: new Date(params.end_at).toISOString(),
      purpose: params.purpose,
      num_users: params.num_users || 1,
      training_confirmed: params.training_confirmed,
      rules_agreed: params.rules_agreed,
      status: resource.requires_approval ? 'pending' : 'approved',
      eligibility_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);

    // Notify resource owner
    this.addNotification({
      recipient_id: resource.owner_id,
      type: 'booking_submitted',
      title: 'New Booking Request',
      body: `${this.currentProfile.display_name} requested ${resource.title} from ${new Date(params.start_at).toLocaleDateString()} ${new Date(params.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      related_booking_id: newBooking.id,
      related_resource_id: resource.id
    });

    // Audit log
    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Booking Requested',
      entity_type: 'booking',
      entity_id: newBooking.id,
      entity_title: resource.title,
      details: `Request submitted for ${newBooking.purpose}`
    });

    this.save();
    return { success: true, booking: newBooking };
  }

  approveBooking(bookingId: string, reason?: string): { success: boolean; error?: string } {
    const booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    const resource = this.getResourceById(booking.resource_id);
    if (resource) {
      // Conflict re-check before approval
      const conflictCheck = validateBookingSlot(
        this.bookings,
        resource.id,
        booking.start_at,
        booking.end_at,
        resource.max_duration_hours,
        booking.id
      );
      if (!conflictCheck.valid) {
        return { success: false, error: conflictCheck.reason };
      }
    }

    booking.status = 'approved';
    booking.decision_by = this.currentProfile.display_name;
    booking.decision_at = new Date().toISOString();
    booking.decision_reason = reason || 'Booking approved by authorized owner.';
    booking.updated_at = new Date().toISOString();

    // Notify requester
    this.addNotification({
      recipient_id: booking.requester_id,
      type: 'booking_approved',
      title: 'Booking Approved!',
      body: `Your request for ${booking.resource_title} has been approved. Proceed to pickup at ${booking.location_label}.`,
      related_booking_id: booking.id,
      related_resource_id: booking.resource_id
    });

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Booking Approved',
      entity_type: 'booking',
      entity_id: booking.id,
      entity_title: booking.resource_title,
      details: `Approved by ${this.currentProfile.display_name}`
    });

    this.save();
    return { success: true };
  }

  rejectBooking(bookingId: string, reason: string): { success: boolean; error?: string } {
    const booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    booking.status = 'rejected';
    booking.decision_by = this.currentProfile.display_name;
    booking.decision_at = new Date().toISOString();
    booking.decision_reason = reason || 'Reservation rejected by owner.';
    booking.updated_at = new Date().toISOString();

    this.addNotification({
      recipient_id: booking.requester_id,
      type: 'booking_rejected',
      title: 'Booking Request Declined',
      body: `Your request for ${booking.resource_title} was declined: ${reason}`,
      related_booking_id: booking.id,
      related_resource_id: booking.resource_id
    });

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Booking Rejected',
      entity_type: 'booking',
      entity_id: booking.id,
      entity_title: booking.resource_title,
      details: `Declined reason: ${reason}`
    });

    this.save();
    return { success: true };
  }

  cancelBooking(bookingId: string, reason?: string): { success: boolean; error?: string } {
    const booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    booking.status = 'cancelled';
    booking.updated_at = new Date().toISOString();

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Booking Cancelled',
      entity_type: 'booking',
      entity_id: booking.id,
      entity_title: booking.resource_title,
      details: reason || 'Cancelled by borrower'
    });

    this.save();
    return { success: true };
  }

  // Handover Workflows: Checkin (Collection) & Checkout (Return)
  recordCheckin(params: {
    booking_id: string;
    condition: any;
    accessories_issued: string[];
    notes: string;
    photo_refs?: string[];
  }): { success: boolean; error?: string } {
    const booking = this.getBookingById(params.booking_id);
    if (!booking) return { success: false, error: 'Booking not found.' };

    const checkin: CheckinRecord = {
      id: `chk-${Date.now()}`,
      booking_id: booking.id,
      resource_id: booking.resource_id,
      checked_in_by: this.currentProfile.id,
      checked_in_by_name: this.currentProfile.display_name,
      checked_in_at: new Date().toISOString(),
      initial_condition: params.condition,
      accessories_issued: params.accessories_issued,
      notes: params.notes,
      photo_refs: params.photo_refs || []
    };

    this.checkins.unshift(checkin);
    booking.status = 'checked_out';
    booking.updated_at = new Date().toISOString();

    this.addNotification({
      recipient_id: booking.requester_id,
      type: 'checked_out',
      title: 'Handover Completed (Checked Out)',
      body: `Resource ${booking.resource_title} is now in your custody. Initial condition: ${params.condition}.`,
      related_booking_id: booking.id,
      related_resource_id: booking.resource_id
    });

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Resource Checked Out',
      entity_type: 'handover',
      entity_id: checkin.id,
      entity_title: booking.resource_title,
      details: `Handover recorded by ${this.currentProfile.display_name}. Condition: ${params.condition}`
    });

    this.save();
    return { success: true };
  }

  recordReturn(params: {
    booking_id: string;
    condition: any;
    accessories_returned: string[];
    notes: string;
    photo_refs?: string[];
    requiresReview?: boolean;
  }): { success: boolean; error?: string } {
    const booking = this.getBookingById(params.booking_id);
    if (!booking) return { success: false, error: 'Booking not found.' };

    const checkout: CheckoutRecord = {
      id: `chko-${Date.now()}`,
      booking_id: booking.id,
      resource_id: booking.resource_id,
      checked_out_by: this.currentProfile.id,
      checked_out_by_name: this.currentProfile.display_name,
      checked_out_at: new Date().toISOString(),
      final_condition: params.condition,
      accessories_returned: params.accessories_returned,
      notes: params.notes,
      photo_refs: params.photo_refs || [],
      return_confirmed_by: this.currentProfile.display_name,
      return_confirmed_at: new Date().toISOString()
    };

    this.checkouts.unshift(checkout);
    booking.status = params.requiresReview ? 'review_required' : 'returned';
    booking.updated_at = new Date().toISOString();

    this.addNotification({
      recipient_id: booking.requester_id,
      type: 'returned',
      title: 'Return Verified & Completed',
      body: `Return for ${booking.resource_title} confirmed. Status: ${booking.status.toUpperCase()}.`,
      related_booking_id: booking.id,
      related_resource_id: booking.resource_id
    });

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Resource Returned',
      entity_type: 'handover',
      entity_id: checkout.id,
      entity_title: booking.resource_title,
      details: `Return inspected by ${this.currentProfile.display_name}. Final condition: ${params.condition}`
    });

    this.save();
    return { success: true };
  }

  getHandoverRecords(bookingId: string) {
    return {
      checkin: this.checkins.find(c => c.booking_id === bookingId),
      checkout: this.checkouts.find(c => c.booking_id === bookingId)
    };
  }

  // Incidents
  getIncidents(): IncidentReport[] {
    return [...this.incidents];
  }

  reportIncident(params: {
    booking_id: string;
    resource_id: string;
    type: any;
    description: string;
    evidence_refs?: string[];
  }): { success: boolean; incident?: IncidentReport; error?: string } {
    const booking = this.getBookingById(params.booking_id);
    const resource = this.getResourceById(params.resource_id);

    const report: IncidentReport = {
      id: `inc-${Date.now()}`,
      booking_id: params.booking_id,
      resource_id: params.resource_id,
      resource_title: resource?.title || booking?.resource_title || 'Equipment',
      reported_by_id: this.currentProfile.id,
      reported_by_name: this.currentProfile.display_name,
      reported_by_role: this.currentProfile.role,
      type: params.type,
      description: params.description,
      evidence_refs: params.evidence_refs || [],
      status: 'open',
      created_at: new Date().toISOString()
    };

    this.incidents.unshift(report);

    // Notify resource owner and managers
    if (resource) {
      this.addNotification({
        recipient_id: resource.owner_id,
        type: 'incident_updated',
        title: 'New Incident Flagged',
        body: `An incident (${params.type}) was reported for ${resource.title}.`,
        related_booking_id: params.booking_id,
        related_resource_id: params.resource_id
      });
    }

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Incident Reported',
      entity_type: 'incident',
      entity_id: report.id,
      entity_title: report.resource_title,
      details: `Category: ${report.type}. Description: ${report.description}`
    });

    this.save();
    return { success: true, incident: report };
  }

  resolveIncident(incidentId: string, resolutionNote: string) {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) return;

    inc.status = 'resolved';
    inc.resolution_note = resolutionNote;
    inc.resolved_at = new Date().toISOString();
    inc.assigned_to = this.currentProfile.display_name;

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Incident Resolved',
      entity_type: 'incident',
      entity_id: inc.id,
      entity_title: inc.resource_title,
      details: `Resolved by ${this.currentProfile.display_name}: ${resolutionNote}`
    });

    this.save();
  }

  sendSupportTicket(params: {
    category: string;
    subject: string;
    message: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    related_resource_id?: string;
    related_booking_id?: string;
  }): { success: boolean; ticketId?: string } {
    const ticketId = `supp-${Date.now()}`;
    const resource = params.related_resource_id ? this.getResourceById(params.related_resource_id) : undefined;

    this.addNotification({
      recipient_id: resource?.owner_id || 'usr-david-kim',
      type: 'system_alert',
      title: `[Support - ${params.urgency.toUpperCase()}] ${params.subject}`,
      body: `From ${this.currentProfile.display_name} (${this.currentProfile.department}): ${params.message}`,
      related_booking_id: params.related_booking_id,
      related_resource_id: params.related_resource_id
    });

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Support Ticket Submitted',
      entity_type: 'system',
      entity_id: ticketId,
      entity_title: params.subject,
      details: `Urgency: ${params.urgency.toUpperCase()} • Category: ${params.category} • Resource: ${resource?.title || 'General'}`
    });

    this.save();
    return { success: true, ticketId };
  }

  // Waitlist
  getWaitlist(resourceId?: string): WaitlistEntry[] {
    if (resourceId) {
      return this.waitlist.filter(w => w.resource_id === resourceId);
    }
    return [...this.waitlist];
  }

  joinWaitlist(params: {
    resource_id: string;
    desired_start_at: string;
    desired_end_at: string;
  }): { success: boolean; position: number } {
    const resource = this.getResourceById(params.resource_id);
    const existing = this.waitlist.filter(w => w.resource_id === params.resource_id && w.status === 'waiting');
    const queuePos = existing.length + 1;

    const entry: WaitlistEntry = {
      id: `wt-${Date.now()}`,
      resource_id: params.resource_id,
      resource_title: resource?.title || 'Resource',
      requester_id: this.currentProfile.id,
      requester_name: this.currentProfile.display_name,
      requester_email: this.currentProfile.email,
      desired_start_at: params.desired_start_at,
      desired_end_at: params.desired_end_at,
      queue_position: queuePos,
      status: 'waiting',
      created_at: new Date().toISOString()
    };

    this.waitlist.push(entry);

    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Joined Waitlist',
      entity_type: 'booking',
      entity_id: entry.id,
      entity_title: entry.resource_title,
      details: `Queue position: #${queuePos}`
    });

    this.save();
    return { success: true, position: queuePos };
  }

  // Reviews & Equipment Star Ratings
  getReviews(resourceId?: string): ResourceReview[] {
    if (resourceId) {
      return this.reviews.filter(r => r.resource_id === resourceId);
    }
    return [...this.reviews];
  }

  getReviewByBookingId(bookingId: string): ResourceReview | undefined {
    return this.reviews.find(r => r.booking_id === bookingId);
  }

  submitReview(params: {
    booking_id: string;
    resource_id: string;
    rating: number;
    comment: string;
    reliability_score?: number;
    cleanliness_score?: number;
  }): { success: boolean; review?: ResourceReview; error?: string } {
    const booking = this.bookings.find(b => b.id === params.booking_id);
    const resource = this.resources.find(r => r.id === params.resource_id);

    if (booking && booking.reviewed) {
      return { success: false, error: 'Booking has already been reviewed.' };
    }

    const newReview: ResourceReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      booking_id: params.booking_id,
      resource_id: params.resource_id,
      resource_title: resource?.title || booking?.resource_title || 'Resource',
      user_id: this.currentProfile.id,
      user_name: this.currentProfile.display_name,
      user_department: this.currentProfile.department,
      rating: params.rating,
      comment: params.comment,
      reliability_score: params.reliability_score || params.rating,
      cleanliness_score: params.cleanliness_score || params.rating,
      created_at: new Date().toISOString()
    };

    this.reviews.unshift(newReview);

    // Update booking record
    if (booking) {
      booking.reviewed = true;
      booking.review_id = newReview.id;
      booking.rating = params.rating;
      booking.updated_at = new Date().toISOString();
    }

    // Recalculate resource average rating and review count
    const resReviews = this.reviews.filter(r => r.resource_id === params.resource_id);
    if (resource && resReviews.length > 0) {
      const sum = resReviews.reduce((acc, r) => acc + r.rating, 0);
      resource.average_rating = Math.round((sum / resReviews.length) * 10) / 10;
      resource.total_reviews = resReviews.length;
    }

    // Add notification to resource owner / custodian
    if (resource?.owner_id) {
      this.addNotification({
        recipient_id: resource.owner_id,
        type: 'review_submitted',
        title: 'New Equipment Star Rating',
        body: `${this.currentProfile.display_name} rated "${resource.title}" ${params.rating}★: "${params.comment.slice(0, 60)}"`,
        related_booking_id: params.booking_id,
        related_resource_id: params.resource_id
      });
    }

    // Audit log
    this.logAudit({
      actor_id: this.currentProfile.id,
      actor_name: this.currentProfile.display_name,
      actor_role: this.currentProfile.role,
      action: 'Equipment Rated',
      entity_type: 'resource',
      entity_id: params.resource_id,
      entity_title: resource?.title || 'Resource',
      details: `Submitted ${params.rating}★ review with verified borrower status.`
    });

    this.save();
    return { success: true, review: newReview };
  }

  // Notifications
  getNotifications(userId?: string): NotificationItem[] {
    const uid = userId || this.currentProfile.id;
    return this.notifications.filter(n => n.recipient_id === uid);
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'created_at'>) {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      created_at: new Date().toISOString(),
      ...item
    };
    this.notifications.unshift(notif);
    this.save();
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId?: string) {
    const uid = userId || this.currentProfile.id;
    this.notifications.forEach(n => {
      if (n.recipient_id === uid) n.read = true;
    });
    this.save();
  }

  // Audit Logs
  getActivityLogs(): AuditEvent[] {
    return [...this.auditEvents];
  }

  logAudit(event: Omit<AuditEvent, 'id' | 'occurred_at'>) {
    const audit: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      occurred_at: new Date().toISOString(),
      ...event
    };
    this.auditEvents.unshift(audit);
    this.save();
  }
}

export const db = new DataStore();
