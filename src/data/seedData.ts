import {
  User,
  Project,
  Milestone,
  Task,
  BudgetLine,
  Expense,
  Invoice,
  Payment,
  ChangeOrder,
  TeamMember,
  Client,
  DesignConcept,
  DesignRequest,
  Inquiry,
  MarketArticle,
  ChatChannel,
  ChatMessage,
  AuditLog,
  SystemLog,
  POSTransaction,
  LegalDocument,
  Company,
  CatalogItem
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alexander Wright',
    email: 'admin@vertex.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    specialization: 'Principal Architect & Managing Director',
    company: 'VERTEX Studio Architecture',
    companyId: 'comp-vertex',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2025-10-01',
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: true,
    securityTier: 'TIER_1_SOVEREIGN',
    permissions: [
      'VIEW_FINANCIALS',
      'APPROVE_BUDGET_DRAWS',
      'EXECUTE_LEGAL_CONTRACTS',
      'ACCESS_POS_TERMINAL',
      'MANAGE_IAM_USERS',
      'MANAGE_COMPANIES',
      'DESIGN_PORTAL_WRITE',
      'MANAGE_PROJECTS',
      'MANAGE_TASKS',
      'EXPORT_FORENSIC_LOGS',
      'SYSTEM_ADMIN_CONFIG'
    ],
    lastLoginAt: '2026-09-01 08:30:12',
    mfaSecretKey: 'VTX-ALEX-9842-SEC',
    backupCodesRemaining: 8
  },
  {
    id: 'u2',
    name: 'Sophia Chen',
    email: 'sophia.chen@vertex.com',
    role: 'PROJECT_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    specialization: 'High-Rise & Luxury Residential PM',
    company: 'VERTEX Studio Architecture',
    companyId: 'comp-vertex',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2025-11-15',
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: true,
    securityTier: 'TIER_2_PRINCIPAL',
    permissions: [
      'VIEW_FINANCIALS',
      'APPROVE_BUDGET_DRAWS',
      'EXECUTE_LEGAL_CONTRACTS',
      'ACCESS_POS_TERMINAL',
      'MANAGE_COMPANIES',
      'DESIGN_PORTAL_WRITE',
      'MANAGE_PROJECTS',
      'MANAGE_TASKS'
    ],
    lastLoginAt: '2026-09-01 07:14:22',
    mfaSecretKey: 'VTX-SOPH-4412-SEC',
    backupCodesRemaining: 7
  },
  {
    id: 'u3',
    name: 'Marcus Vance',
    email: 'marcus.v@vertex.com',
    role: 'DESIGNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    specialization: 'Contemporary & Minimalist FF&E',
    company: 'VERTEX Studio Architecture',
    companyId: 'comp-vertex',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2025-12-01',
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: false,
    securityTier: 'TIER_3_SPECIALIST',
    permissions: [
      'DESIGN_PORTAL_WRITE',
      'MANAGE_TASKS'
    ],
    lastLoginAt: '2026-08-31 18:45:00',
    mfaSecretKey: 'VTX-MARC-8819-SEC',
    backupCodesRemaining: 8
  },
  {
    id: 'u4',
    name: 'Eleanor Sterling',
    email: 'eleanor@sterlingholdings.com',
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8901',
    company: 'Sterling Luxury Holdings',
    companyId: 'comp-2',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2026-01-05',
    assignedProjectIds: ['p1'],
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: true,
    securityTier: 'TIER_4_CLIENT',
    permissions: [
      'VIEW_FINANCIALS',
      'EXECUTE_LEGAL_CONTRACTS'
    ],
    lastLoginAt: '2026-09-01 06:12:00',
    mfaSecretKey: 'VTX-ELEN-1029-SEC',
    backupCodesRemaining: 6
  },
  {
    id: 'u7_pending_client',
    name: 'Harrison Sterling-Cole',
    email: 'harrison.cole@pendingclient.com',
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 998-1122',
    company: 'Cole Heritage Trust',
    companyId: 'comp-7',
    onboardingStatus: 'PENDING_ONBOARDING',
    submittedAt: '2026-09-01 07:15 UTC (2 hrs ago)',
    onboardingNotes: 'Requesting access to $850k Villa Aurelia Penthouse project drawings and escrow billing ledger.',
    requestedClearance: 'TIER_4_CLIENT',
    assignedProjectIds: ['p1'],
    status: 'PENDING_2FA',
    twoFactorStatus: 'PENDING_ENROLLMENT',
    twoFactorEnforced: true,
    securityTier: 'TIER_4_CLIENT',
    permissions: ['VIEW_FINANCIALS'],
    lastLoginAt: 'Never',
    backupCodesRemaining: 8
  },
  {
    id: 'u8_pending_client',
    name: 'Genevieve DuPont',
    email: 'genevieve@dupontrealestate.com',
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-9988',
    company: 'DuPont Real Estate Trust',
    companyId: 'comp-3',
    onboardingStatus: 'PENDING_ONBOARDING',
    submittedAt: '2026-09-01 05:40 UTC (4 hrs ago)',
    onboardingNotes: 'Commercial flagship development; seeking 3D design moodboards & milestone execution approvals.',
    requestedClearance: 'TIER_4_CLIENT',
    assignedProjectIds: ['p2'],
    status: 'PENDING_2FA',
    twoFactorStatus: 'PENDING_ENROLLMENT',
    twoFactorEnforced: true,
    securityTier: 'TIER_4_CLIENT',
    permissions: ['VIEW_FINANCIALS'],
    lastLoginAt: 'Never',
    backupCodesRemaining: 8
  },
  {
    id: 'u9_rejected_client',
    name: 'Julian Vance',
    email: 'julian@vancecapital.ch',
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+41 22 819 9000',
    company: 'Vance Capital Partners Zurich',
    companyId: 'comp-4',
    onboardingStatus: 'REJECTED',
    submittedAt: '2026-08-30 14:20 UTC',
    onboardingNotes: 'Corporate NDA expired and KYC identity verification document not authenticated.',
    requestedClearance: 'TIER_4_CLIENT',
    assignedProjectIds: [],
    status: 'SUSPENDED',
    twoFactorStatus: 'NOT_CONFIGURED',
    twoFactorEnforced: false,
    securityTier: 'TIER_4_CLIENT',
    permissions: [],
    lastLoginAt: 'Never',
    backupCodesRemaining: 0
  },
  {
    id: 'u5',
    name: 'David Thorne',
    email: 'david.t@vertex.com',
    role: 'SITE_ENGINEER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012',
    specialization: 'Structural & HVAC Integration',
    company: 'Apex Heavy Rigging & Logistics',
    companyId: 'comp-1',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2025-11-20',
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: true,
    securityTier: 'TIER_5_CONTRACTOR',
    permissions: ['MANAGE_TASKS'],
    lastLoginAt: '2026-08-31 22:15:30',
    mfaSecretKey: 'VTX-DTHO-3391-SEC',
    backupCodesRemaining: 8
  },
  {
    id: 'u6',
    name: 'Claire Beauchamp',
    email: 'claire.b@vertex.com',
    role: 'FINANCE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 789-0123',
    specialization: 'Procurement & Cost Accounting',
    company: 'VERTEX Studio Architecture',
    companyId: 'comp-vertex',
    onboardingStatus: 'ONBOARDED',
    onboardedAt: '2025-10-10',
    status: 'ACTIVE',
    twoFactorStatus: 'ENROLLED',
    twoFactorEnforced: true,
    securityTier: 'TIER_2_PRINCIPAL',
    permissions: [
      'VIEW_FINANCIALS',
      'APPROVE_BUDGET_DRAWS',
      'ACCESS_POS_TERMINAL'
    ],
    lastLoginAt: '2026-09-01 08:05:44',
    mfaSecretKey: 'VTX-CLAI-9912-SEC',
    backupCodesRemaining: 8
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Villa Aurelia Penthouse',
    code: 'VTX-2026-001',
    location: 'Beverly Hills, CA (GPS: 34.0736, -118.4004)',
    latitude: 34.0736,
    longitude: -118.4004,
    budget: 850000,
    spent: 595000,
    status: 'IN_PROGRESS',
    progress: 70,
    description: 'Ultra-luxury 6,500 sq ft penthouse interior transformation featuring Calacatta marble, custom brushed brass joinery, and an integrated smart home ecosystem.',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    clientEmail: 'eleanor@sterlingholdings.com',
    startDate: '2026-01-15',
    endDate: '2026-10-30',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    team: [
      { memberId: 'u2', memberName: 'Sophia Chen', memberAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'Project Manager', allocationPercentage: 60 },
      { memberId: 'u3', memberName: 'Marcus Vance', memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Lead Interior Designer', allocationPercentage: 80 },
      { memberId: 'u5', memberName: 'David Thorne', memberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Site Engineer', allocationPercentage: 40 }
    ],
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'p2',
    name: 'Lumina Corporate Headquarters',
    code: 'VTX-2026-002',
    location: 'Hudson Yards, New York (GPS: 40.7538, -74.0022)',
    latitude: 40.7538,
    longitude: -74.0022,
    budget: 1450000,
    spent: 420000,
    status: 'IN_PROGRESS',
    progress: 35,
    description: 'Biophilic 3-floor executive headquarters with acoustic timber paneling, executive boardroom, wellness suites, and bespoke lighting fixtures.',
    clientId: 'c2',
    clientName: 'Julian Thorne',
    clientEmail: 'julian@luminagroup.io',
    startDate: '2026-03-01',
    endDate: '2026-12-15',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    team: [
      { memberId: 'u2', memberName: 'Sophia Chen', memberAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'Project Manager', allocationPercentage: 40 },
      { memberId: 'u3', memberName: 'Marcus Vance', memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Interior Architect', allocationPercentage: 50 }
    ],
    createdAt: '2026-02-20T10:30:00Z'
  },
  {
    id: 'p3',
    name: 'The Meridian Coastal Residence',
    code: 'VTX-2026-003',
    location: 'Miami Beach, FL (GPS: 25.7907, -80.1300)',
    latitude: 25.7907,
    longitude: -80.1300,
    budget: 620000,
    spent: 75000,
    status: 'PLANNING',
    progress: 15,
    description: 'Mediterranean-modern coastal sanctuary emphasizing seamless indoor-outdoor living, travertine terraces, and organic linen textiles.',
    clientId: 'c3',
    clientName: 'Victoria Hastings',
    clientEmail: 'vhastings@hastingscap.com',
    startDate: '2026-06-01',
    endDate: '2027-02-28',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
    team: [
      { memberId: 'u3', memberName: 'Marcus Vance', memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Lead Designer', allocationPercentage: 30 }
    ],
    createdAt: '2026-05-12T14:15:00Z'
  },
  {
    id: 'p4',
    name: 'Kyoto Pavilion Restorations',
    code: 'VTX-2025-089',
    location: 'Kyoto, Japan (GPS: 35.0116, 135.7681)',
    latitude: 35.0116,
    longitude: 135.7681,
    budget: 520000,
    spent: 512000,
    status: 'COMPLETED',
    progress: 100,
    description: 'Heritage tea house conversion blending traditional shoji screens, hinoki cypress craftsmanship, and contemporary minimalist luxury bath suites.',
    clientId: 'c4',
    clientName: 'Kenji Takahashi',
    clientEmail: 'takahashi@zenith-hospitality.jp',
    startDate: '2025-08-01',
    endDate: '2026-04-15',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    team: [
      { memberId: 'u2', memberName: 'Sophia Chen', memberAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'Project Manager', allocationPercentage: 0 },
      { memberId: 'u5', memberName: 'David Thorne', memberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Structural Specialist', allocationPercentage: 0 }
    ],
    createdAt: '2025-07-15T09:00:00Z'
  }
];

export const SEED_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Architectural Demolition & Framing',
    description: 'Complete removal of non-load bearing partitions and structural steel re-reinforcement.',
    dueDate: '2026-03-01',
    targetTaskId: 't1',
    progress: 100,
    status: 'COMPLETED'
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Custom Millwork & Italian Marble Delivery',
    description: 'Installation of custom walnut acoustic panels and bookmatched Calacatta Gold slabs in master foyer.',
    dueDate: '2026-07-20',
    targetTaskId: 't2',
    progress: 85,
    status: 'IN_PROGRESS',
    isHighlightOfMonth: true
  },
  {
    id: 'm3',
    projectId: 'p1',
    name: 'Smart Lighting & Automation Commissioning',
    description: 'Lutron Homeworks QSX lighting integration and climate zoning calibration.',
    dueDate: '2026-09-15',
    targetTaskId: 't3',
    progress: 25,
    status: 'IN_PROGRESS'
  },
  {
    id: 'm4',
    projectId: 'p2',
    name: 'Acoustic Ceiling & HVAC Rerouting',
    description: 'Install decoupled sound isolation grid across floors 42-44.',
    dueDate: '2026-06-30',
    progress: 60,
    status: 'IN_PROGRESS'
  },
  {
    id: 'm5',
    projectId: 'p3',
    name: 'Schematic Design & Material Board Sign-off',
    description: 'Client sign-off on coastal palettes, travertine finishes, and Italian outdoor furnishings.',
    dueDate: '2026-07-10',
    progress: 90,
    status: 'IN_PROGRESS'
  }
];

export const SEED_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Inspect Master Suite Slab Reinforcement',
    description: 'Verify structural load capacity for freestanding 800lb marble soaking tub with site engineer.',
    assignedToId: 'u5',
    assignedToName: 'David Thorne',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    assignedRole: 'SITE_ENGINEER',
    priority: 'HIGH',
    status: 'DONE',
    dueDate: '2026-02-28',
    progressPercent: 100,
    stage: 'Structural & MEP',
    attachments: [
      { id: 'att1', name: 'Structural_Inspection_Report.pdf', url: '#', size: '2.4 MB', type: 'application/pdf' }
    ],
    comments: [
      { id: 'c1', authorName: 'David Thorne', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', text: 'Load test verified at 120 lbs/sq ft. Safe for installation.', createdAt: '2026-02-27T16:00:00Z' }
    ],
    progressImages: [
      {
        id: 'img_t1_1',
        taskId: 't1',
        projectId: 'p1',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=400&auto=format&fit=crop&q=80',
        caption: 'High-tensile rebar reinforcement grid anchored with epoxy structural studs prior to lightweight acoustic screed pour.',
        stageName: 'Subfloor Load Verification',
        progressPercent: 100,
        locationTag: 'Villa Aurelia • Penthouse Master Suite Grid-B2',
        uploadedBy: {
          id: 'u5',
          name: 'David Thorne',
          role: 'SITE_ENGINEER',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          company: 'Apex Heavy Rigging & Logistics'
        },
        uploadedAt: '2026-02-26 14:32:10 UTC',
        cameraMetadata: {
          device: 'Leica BLK360 / iPhone 15 Pro LiDAR',
          timestamp: '2026-02-26 14:30:00',
          gpsCoords: '34.0736° N, 118.4004° W (Elevation 182m)'
        },
        validationStatus: 'CLIENT_VALIDATED',
        clientValidation: {
          validatedBy: 'Eleanor Sterling',
          validatedById: 'u4',
          validatedAt: '2026-02-27 18:45:00 UTC',
          signatureVerificationCode: 'VTX-SEAL-8921-EST',
          feedback: 'Engineering load cert checked and signed off for the marble soaking tub installation.',
          rating: 5
        },
        tags: ['Structural', 'Rebar', 'Master Bath']
      }
    ]
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Calacatta Gold Bookmatching Inspection',
    description: 'Conduct video call with Italian stone quarry in Carrara to approve the veining pattern on slabs 4A through 4D.',
    assignedToId: 'u3',
    assignedToName: 'Marcus Vance',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    assignedRole: 'DESIGNER',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueDate: '2026-07-18',
    progressPercent: 85,
    stage: 'Stone Sourcing & Dry Lay',
    attachments: [
      { id: 'att2', name: 'Carrara_Slab_Vein_Map.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', size: '4.1 MB', type: 'image/jpeg' }
    ],
    comments: [
      { id: 'c2', authorName: 'David Thorne', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', text: 'Quarry dry-lay photos received. Moisture sealing test passed.', createdAt: '2026-07-15T09:12:00Z' }
    ],
    progressImages: [
      {
        id: 'img_t2_1',
        taskId: 't2',
        projectId: 'p1',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
        caption: 'Dry-lay arrangement of 4 continuous Calacatta Gold slabs with golden honey veining alignment across main salon fireplace.',
        stageName: 'Quarry Dry-Lay & Mirror Matching',
        progressPercent: 85,
        locationTag: 'Carrara Quarry Lot #481 • Destined for Grand Salon',
        uploadedBy: {
          id: 'u5',
          name: 'David Thorne',
          role: 'SITE_ENGINEER',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          company: 'Apex Heavy Rigging & Logistics'
        },
        uploadedAt: '2026-07-16 11:20:00 UTC',
        cameraMetadata: {
          device: 'Nikon Z8 45MP / Optical Calibration',
          timestamp: '2026-07-16 11:15:00',
          gpsCoords: '44.0793° N, 10.1004° E (Carrara, Italy)'
        },
        validationStatus: 'PENDING_CLIENT_VALIDATION',
        tags: ['Calacatta', 'Bookmatch', 'Fireplace']
      }
    ]
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Lutron QSX Keypad Engraving Confirmation',
    description: 'Finalize customized backlight button text with client for master bedroom and gallery entrance.',
    assignedToId: 'u2',
    assignedToName: 'Sophia Chen',
    assignedToAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    assignedRole: 'PROJECT_MANAGER',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '2026-08-05',
    progressPercent: 40,
    stage: 'Home Automation & Lighting',
    attachments: [],
    comments: [],
    progressImages: [
      {
        id: 'img_t3_1',
        taskId: 't3',
        projectId: 'p1',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&auto=format&fit=crop&q=80',
        caption: 'Palladiom satin nickel keypad with custom backlit engraving mockups ("Welcome", "Relax", "Night", "All Off").',
        stageName: 'Hardware Prototype Sign-Off',
        progressPercent: 50,
        locationTag: 'Villa Aurelia • Gallery Hallway',
        uploadedBy: {
          id: 'u2',
          name: 'Sophia Chen',
          role: 'PROJECT_MANAGER',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          company: 'VERTEX Studio Architecture'
        },
        uploadedAt: '2026-08-01 16:10:00 UTC',
        validationStatus: 'PENDING_CLIENT_VALIDATION',
        tags: ['Lutron', 'SmartHome', 'Keypad']
      }
    ]
  },
  {
    id: 't4',
    projectId: 'p2',
    title: 'Timber Sound Baffle Flammability Rating Check',
    description: 'Review Class A fire test documentation for custom micro-perforated oak ceiling panels.',
    assignedToId: 'u5',
    assignedToName: 'David Thorne',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    assignedRole: 'SITE_ENGINEER',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-07-22',
    progressPercent: 70,
    stage: 'Acoustic Millwork',
    attachments: [],
    comments: [],
    progressImages: [
      {
        id: 'img_t4_1',
        taskId: 't4',
        projectId: 'p2',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
        caption: 'Micro-perforated natural rift white oak acoustic ceiling baffle test segment with fire-retardant matte sealer.',
        stageName: 'Acoustic Test Mockup',
        progressPercent: 70,
        locationTag: 'Lumina HQ • Level 42 Executive Boardroom',
        uploadedBy: {
          id: 'u5',
          name: 'David Thorne',
          role: 'SITE_ENGINEER',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          company: 'Apex Heavy Rigging & Logistics'
        },
        uploadedAt: '2026-07-20 15:45:00 UTC',
        validationStatus: 'PENDING_CLIENT_VALIDATION',
        tags: ['Oak', 'Acoustics', 'FireRating']
      }
    ]
  },
  {
    id: 't5',
    projectId: 'p3',
    title: '3D Virtual Walkthrough Render Generation',
    description: 'Generate high-fidelity Unreal/WebGL walkthrough for outdoor lanai and sunset pavilion.',
    assignedToId: 'u3',
    assignedToName: 'Marcus Vance',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    assignedRole: 'DESIGNER',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '2026-07-28',
    progressPercent: 30,
    stage: 'Landscape Architecture',
    attachments: [],
    comments: []
  }
];

export const SEED_BUDGET_LINES: BudgetLine[] = [
  { id: 'bl1', projectId: 'p1', category: 'Architectural & MEP', itemName: 'Demolition & Structural Steel', estimated: 120000, actual: 118500, variance: 1500, notes: 'Completed within margin' },
  { id: 'bl2', projectId: 'p1', category: 'Stone & Finishes', itemName: 'Calacatta Gold Italian Marble', estimated: 185000, actual: 192000, variance: -7000, notes: 'Slight increase due to rare veining selection' },
  { id: 'bl3', projectId: 'p1', category: 'Custom Millwork', itemName: 'Bespoke Fluted Walnut Cabinetry', estimated: 210000, actual: 185000, variance: 25000, notes: 'In-progress fabrication' },
  { id: 'bl4', projectId: 'p1', category: 'Lighting & Smart Tech', itemName: 'Lutron & Architectural Fixtures', estimated: 95000, actual: 64500, variance: 30500, notes: 'Phase 2 delivery pending' },
  { id: 'bl5', projectId: 'p1', category: 'FF&E Furniture', itemName: 'Minotti & B&B Italia Curated Pieces', estimated: 240000, actual: 35000, variance: 205000, notes: 'Scheduled for Q3 installation' }
];

export const SEED_EXPENSES: Expense[] = [
  { id: 'exp1', projectId: 'p1', description: 'Quarry Deposit for 4 Bookmatched Marble Slabs', category: 'Materials', amount: 96000, date: '2026-03-12', vendor: 'Carrara Stone Works Italia', paymentMethod: 'BANK_TRANSFER', status: 'APPROVED', approvedBy: 'Claire Beauchamp' },
  { id: 'exp2', projectId: 'p1', description: 'HVAC Crane Lift & City Permit Fee', category: 'Logistics', amount: 14500, date: '2026-04-05', vendor: 'LA Precision Crane Co', paymentMethod: 'CREDIT_CARD', status: 'APPROVED', approvedBy: 'Claire Beauchamp' },
  { id: 'exp3', projectId: 'p1', description: 'Fluted Walnut Sample Mockup & Hardware Kit', category: 'Prototyping', amount: 3200, date: '2026-05-18', vendor: 'Studio Artisan Woods', paymentMethod: 'BANK_TRANSFER', status: 'APPROVED', approvedBy: 'Sophia Chen' },
  { id: 'exp4', projectId: 'p1', description: 'Site Sound Level Testing & Acoustic Modeling', category: 'Consulting', amount: 5800, date: '2026-06-22', vendor: 'AeroAcoustics Lab', paymentMethod: 'BANK_TRANSFER', status: 'PENDING' }
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-0401',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    clientEmail: 'eleanor@sterlingholdings.com',
    amount: 250000,
    tax: 20000,
    total: 270000,
    issueDate: '2026-01-20',
    dueDate: '2026-02-05',
    status: 'PAID',
    notes: 'Mobilization deposit and architectural schematic phase completion.',
    items: [
      { description: 'Initial Mobilization & Architectural Design Fee', quantity: 1, unitPrice: 150000, total: 150000 },
      { description: 'Structural Engineering Review & Permits Retainer', quantity: 1, unitPrice: 100000, total: 100000 }
    ]
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-0582',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    clientEmail: 'eleanor@sterlingholdings.com',
    amount: 325000,
    tax: 26000,
    total: 351000,
    issueDate: '2026-05-10',
    dueDate: '2026-05-25',
    status: 'PAID',
    notes: 'Milestone 2 payment: Stone Procurement & Framing Complete.',
    items: [
      { description: 'Stone & Finish Sourcing Milestone (50%)', quantity: 1, unitPrice: 185000, total: 185000 },
      { description: 'Custom Millwork Fabrication Draw (Phase 1)', quantity: 1, unitPrice: 140000, total: 140000 }
    ]
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-0719',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    clientEmail: 'eleanor@sterlingholdings.com',
    amount: 175000,
    tax: 14000,
    total: 189000,
    issueDate: '2026-07-01',
    dueDate: '2026-07-20',
    status: 'PENDING',
    notes: 'Milestone 3 draw: FF&E Furniture deposits & Lutron commissioning.',
    items: [
      { description: 'Curated Designer Furniture Orders (Deposit)', quantity: 1, unitPrice: 125000, total: 125000 },
      { description: 'Automation & AV Hardware Package', quantity: 1, unitPrice: 50000, total: 50000 }
    ]
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2026-0810',
    projectId: 'p2',
    projectName: 'Lumina Corporate Headquarters',
    clientId: 'c2',
    clientName: 'Julian Thorne',
    clientEmail: 'julian@luminagroup.io',
    amount: 420000,
    tax: 33600,
    total: 453600,
    issueDate: '2026-03-15',
    dueDate: '2026-03-30',
    status: 'PAID',
    notes: 'Phase 1 corporate headquarters retainer and space planning approval.',
    items: [
      { description: 'Corporate Space Planning & Interior Architecture Phase', quantity: 1, unitPrice: 420000, total: 420000 }
    ]
  }
];

export const SEED_PAYMENTS: Payment[] = [
  { id: 'pay1', invoiceId: 'inv1', invoiceNumber: 'INV-2026-0401', projectId: 'p1', amount: 270000, paymentMethod: 'Wire Transfer', referenceNumber: 'WT-89472918', paymentDate: '2026-01-28', notes: 'Received in Chase Commercial Escrow' },
  { id: 'pay2', invoiceId: 'inv2', invoiceNumber: 'INV-2026-0582', projectId: 'p1', amount: 351000, paymentMethod: 'Wire Transfer', referenceNumber: 'WT-91048204', paymentDate: '2026-05-18', notes: 'Milestone 2 full settlement' },
  { id: 'pay3', invoiceId: 'inv4', invoiceNumber: 'INV-2026-0810', projectId: 'p2', amount: 453600, paymentMethod: 'Wire Transfer', referenceNumber: 'WT-73629103', paymentDate: '2026-03-24', notes: 'Corporate wire confirmed' }
];

export const SEED_CHANGE_ORDERS: ChangeOrder[] = [
  {
    id: 'co1',
    projectId: 'p1',
    title: 'Master Wine Cellar Custom Cooling Upgrade',
    description: 'Upgrade the walk-in glass wine display with dual-zone climate compressor and backlit alabaster panels.',
    reason: 'Client requested expanded vintage Burgundy capacity and mood-lit presentation.',
    budgetImpact: 28000,
    scheduleImpactDays: 5,
    requestedBy: 'Eleanor Sterling',
    requestedRole: 'Client',
    status: 'APPROVED',
    date: '2026-04-14',
    reviewedBy: 'Alexander Wright',
    reviewNotes: 'Engineering cleared additional HVAC ducting. Approved.'
  },
  {
    id: 'co2',
    projectId: 'p1',
    title: 'Automated Privacy Glass for Terrace Enclosure',
    description: 'Switch from standard low-E double glazing to electrochromic switchable smart glass on the primary sunset terrace.',
    reason: 'Eliminate need for motorized roller blinds to maximize 360 degree panoramic views.',
    budgetImpact: 42000,
    scheduleImpactDays: 8,
    requestedBy: 'Marcus Vance',
    requestedRole: 'Lead Designer',
    status: 'PENDING',
    date: '2026-06-25'
  }
];

export const SEED_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'u1',
    name: 'Alexander Wright',
    role: 'ARCHITECT',
    email: 'admin@vertex.com',
    phone: '+1 (555) 234-5678',
    specialization: 'Principal Architect (AIA, LEED AP)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    activeProjectsCount: 4,
    status: 'ACTIVE'
  },
  {
    id: 'u2',
    name: 'Sophia Chen',
    role: 'PROJECT_MANAGER',
    email: 'sophia.chen@vertex.com',
    phone: '+1 (555) 345-6789',
    specialization: 'PMP Certified Luxury PM',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    activeProjectsCount: 2,
    status: 'ACTIVE'
  },
  {
    id: 'u3',
    name: 'Marcus Vance',
    role: 'DESIGNER',
    email: 'marcus.v@vertex.com',
    phone: '+1 (555) 456-7890',
    specialization: 'High-End Residential Interiors (ASID)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    activeProjectsCount: 3,
    status: 'ACTIVE'
  },
  {
    id: 'u5',
    name: 'David Thorne',
    role: 'SITE_ENGINEER',
    email: 'david.t@vertex.com',
    phone: '+1 (555) 678-9012',
    specialization: 'Structural & Smart Building Integration',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    activeProjectsCount: 2,
    status: 'ACTIVE'
  },
  {
    id: 'u6',
    name: 'Claire Beauchamp',
    role: 'FINANCE',
    email: 'claire.b@vertex.com',
    phone: '+1 (555) 789-0123',
    specialization: 'Procurement & Project Controls',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    activeProjectsCount: 4,
    status: 'ACTIVE'
  }
];

export const SEED_CLIENTS: Client[] = [
  {
    id: 'u4',
    name: 'Eleanor Sterling',
    company: 'Sterling Luxury Holdings',
    email: 'eleanor@sterlingholdings.com',
    phone: '+1 (555) 567-8901',
    address: '1004 Wilshire Blvd, Beverly Hills, CA',
    activeProjectsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'c2',
    name: 'Julian Thorne',
    company: 'Lumina Tech Global',
    email: 'julian@luminagroup.io',
    phone: '+1 (555) 890-1234',
    address: '50 Hudson Yards, Fl 42, New York, NY',
    activeProjectsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  },
  {
    id: 'c3',
    name: 'Victoria Hastings',
    company: 'Hastings Capital Management',
    email: 'vhastings@hastingscap.com',
    phone: '+1 (555) 901-2345',
    address: '2200 Ocean Drive, Miami Beach, FL',
    activeProjectsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'c4',
    name: 'Kenji Takahashi',
    company: 'Zenith Hospitality International',
    email: 'takahashi@zenith-hospitality.jp',
    phone: '+81 3 5555 0192',
    address: 'Gion District, Higashiyama, Kyoto',
    activeProjectsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  }
];

export const SEED_CONCEPTS: DesignConcept[] = [
  {
    id: 'dc1',
    title: 'Minimalist Monolith Living Room',
    roomType: 'Living Room',
    style: 'Minimalist',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80',
    description: 'Crisp architectural lines, micro-cement hearth, floor-to-ceiling glazing, and low-slung Italian modular seating.',
    estimatedCost: '$65,000 - $90,000',
    colorPalette: ['#EAE6E1', '#D4AF37', '#2C2416', '#8C827A'],
    tags: ['Microcement', 'Warm Minimalist', 'Recessed Lighting'],
    isPortfolioItem: true,
    collectionName: 'Contemporary Sanctuaries'
  },
  {
    id: 'dc2',
    title: 'Parisian Haussmann Classic Salon',
    roomType: 'Living Room',
    style: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
    description: 'Heritage wall moldings, herringbone parquet flooring, vintage crystal chandelier, and velvet bouclé accent chairs.',
    estimatedCost: '$80,000 - $120,000',
    colorPalette: ['#FAF8F5', '#C5A059', '#3D342B', '#E5DDD0'],
    tags: ['Herringbone', 'Wainscoting', 'Velvet'],
    isPortfolioItem: true,
    collectionName: 'Timeless Heritage'
  },
  {
    id: 'dc3',
    title: 'Organic Modern Master Suite',
    roomType: 'Bedroom',
    style: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80',
    description: 'Floating fluted oak headboard with integrated wireless nightstand charging, washed linen drapes, and travertine accents.',
    estimatedCost: '$45,000 - $70,000',
    colorPalette: ['#F3EFEA', '#B8860B', '#4A3E31', '#9E9488'],
    tags: ['Fluted Wood', 'Travertine', 'Linen'],
    isPortfolioItem: true,
    collectionName: 'Master Bedrooms'
  },
  {
    id: 'dc4',
    title: 'Japanese Wabi-Sabi Zen Bedroom',
    roomType: 'Bedroom',
    style: 'Minimalist',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
    description: 'Low tatami platform bed, textured lime-wash clay walls, raw edge cedar bench, and ambient paper pendant lamps.',
    estimatedCost: '$35,000 - $55,000',
    colorPalette: ['#EDE8E1', '#8B7355', '#24201C', '#C2B8AA'],
    tags: ['Tatami', 'Limewash', 'Hinoki'],
    isPortfolioItem: true,
    collectionName: 'Master Bedrooms'
  },
  {
    id: 'dc5',
    title: 'Sculptural Calacatta Culinary Kitchen',
    roomType: 'Kitchen',
    style: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    description: 'Seamless monolithic marble island with waterfall edges, push-to-open matte fumed oak cabinetry, and concealed Gaggenau appliances.',
    estimatedCost: '$95,000 - $140,000',
    colorPalette: ['#FFFFFF', '#D4AF37', '#1F1C18', '#786F66'],
    tags: ['Marble Waterfall', 'Concealed Tech', 'Fumed Oak'],
    isPortfolioItem: true,
    collectionName: 'Gourmet Kitchens'
  },
  {
    id: 'dc6',
    title: 'Nordic Spa Master Bathroom',
    roomType: 'Bathroom',
    style: 'Contemporary',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    description: 'Freestanding resin soaking tub surrounded by floor-level pebble runoff channel, brushed gunmetal tapware, and cedar sauna.',
    estimatedCost: '$50,000 - $85,000',
    colorPalette: ['#F5F5F3', '#A67C52', '#33302C', '#BBB3A8'],
    tags: ['Soaking Tub', 'Gunmetal', 'Rainshower'],
    isPortfolioItem: true,
    collectionName: 'Spa Sanctuaries'
  }
];

export const SEED_DESIGN_REQUESTS: DesignRequest[] = [
  {
    id: 'dr1',
    projectName: 'Villa Aurelia Great Hall Redesign',
    clientName: 'Eleanor Sterling',
    clientEmail: 'eleanor@sterlingholdings.com',
    roomType: 'Living Room',
    roomDimensions: '32 x 24 ft (Cathedral Ceiling 18ft)',
    budgetRange: 'Above $100,000',
    stylePreference: 'Modern',
    colorScheme: 'Warm Neutral (Ivory, Brushed Gold, Cognac Leather)',
    designRequirements: 'Needs to accommodate 20 guests for philanthropic cocktail receptions while remaining intimate for family evenings.',
    status: 'GENERATED',
    createdAt: '2026-03-02T11:00:00Z',
    generatedConcepts: [SEED_CONCEPTS[0], SEED_CONCEPTS[1]]
  }
];

export const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'inq1',
    name: 'Seraphina De Luca',
    email: 'seraphina@delucadesign.co',
    phone: '+1 (555) 712-9901',
    companyName: 'De Luca Vineyards',
    inquiryType: 'RESIDENTIAL',
    spaceType: 'Living Room',
    timeline: '3-6 months',
    message: 'We recently acquired an estate in Napa Valley and would like VERTEX to lead the architectural interior renovation of our primary residence and tasting salon.',
    preferredContact: 'BOTH',
    createdAt: '2026-07-02T15:30:00Z',
    status: 'NEW'
  },
  {
    id: 'inq2',
    name: 'Harrison Sterling-Ross',
    email: 'hross@rossadvisors.com',
    phone: '+1 (555) 843-1120',
    companyName: 'Ross Private Wealth',
    inquiryType: 'COMMERCIAL',
    spaceType: 'Office',
    timeline: '1-3 months',
    message: 'Seeking full interior fit-out for our 8,000 sq ft boutique private wealth office in Tribeca, New York.',
    preferredContact: 'EMAIL',
    createdAt: '2026-06-28T09:15:00Z',
    status: 'CONTACTED'
  }
];

export const SEED_ARTICLES: MarketArticle[] = [
  {
    id: 'art1',
    title: 'The Resurgence of Tactile Natural Materials in Luxury Architecture',
    category: 'Material Insights',
    readTime: '5 min read',
    excerpt: 'How honed travertine, unlacquered brass, and acoustic fluted timber are replacing sterile glossy surfaces in modern masterworks.',
    content: `In the contemporary landscape of high-end interior architecture, a profound shift has occurred. Discerning homeowners and visionary architects are moving past hyper-polished, synthetic surfaces in favor of materials that tell a geologic and artisanal story.\n\nFrom bookmatched Calacatta Gold extracted from the Apuan Alps to sustainably harvested Hinoki cypress with natural aromatics, tactile richness provides sensory grounding. Living finishes—such as unlacquered brass and raw vegetable-tanned leathers—develop a graceful patina over decades, imparting authentic soul into modern structural volumes.`,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    author: 'Marcus Vance, Lead Design Director',
    date: 'July 15, 2026',
    tags: ['Architecture', 'Materials', 'Travertine', 'Luxury Living']
  },
  {
    id: 'art2',
    title: 'Architectural Lighting: Sculpting Atmosphere and Circadian Wellness',
    category: 'Design Technology',
    readTime: '4 min read',
    excerpt: 'Exploring indirect cove illumination, warm-dimming Kelvin scales, and discrete architectural channel integration.',
    content: `Lighting is not merely illumination; it is the invisible architect of emotional resonance within a room. In ultra-prime residential projects, visible glare is entirely eliminated in favor of concealed warm-dim coves (2700K transitioning to 1800K at dusk) that sync with human circadian rhythms.\n\nBy layering ambient perimeter grazers with focused narrow-beam art accent spots, volumetric depth is accentuated while maintaining an effortless, tranquil atmosphere throughout every hour of the day.`,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
    author: 'Alexander Wright, AIA',
    date: 'June 28, 2026',
    tags: ['Lighting', 'Wellness', 'Lutron', 'Atmosphere']
  },
  {
    id: 'art3',
    title: 'Global Furniture Forecast: Curated Vintage Italian Originals vs. Bespoke Joinery',
    category: 'Market Trends',
    readTime: '6 min read',
    excerpt: 'Why 1970s Milanese collector pieces and bespoke built-in millwork are the cornerstone of investment-grade interiors.',
    content: `The global collector market has elevated vintage 20th-century Italian design into legitimate blue-chip investment territory. Pieces by Gio Ponti, Afra & Tobia Scarpa, and Mario Bellini are paired alongside custom architectural millwork that is custom-engineered to the millimeter.\n\nThis blend between rare provenance and bespoke architectural precision creates spaces that resist ephemeral micro-trends and appreciate in aesthetic value over generations.`,
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80',
    author: 'Sophia Chen, Senior PM',
    date: 'June 10, 2026',
    tags: ['Trends', 'Italian Design', 'Artisanal Joinery']
  }
];

export const SEED_CHANNELS: ChatChannel[] = [
  {
    id: 'c-all',
    name: 'General Project Operations',
    type: 'GENERAL',
    unreadCount: 0,
    lastMessagePreview: 'All weekly milestone reviews scheduled for Friday 10 AM PST.',
    lastMessageTime: '10:45 AM',
    members: ['Alexander Wright', 'Sophia Chen', 'Marcus Vance', 'David Thorne', 'Claire Beauchamp']
  },
  {
    id: 'c-p1',
    name: 'Villa Aurelia Penthouse',
    type: 'PROJECT',
    projectId: 'p1',
    unreadCount: 2,
    lastMessagePreview: 'The Carrara quarry verified slab cuts 4A and 4B.',
    lastMessageTime: '11:20 AM',
    members: ['Alexander Wright', 'Sophia Chen', 'Marcus Vance', 'Eleanor Sterling', 'David Thorne']
  },
  {
    id: 'c-p2',
    name: 'Lumina Corporate HQ',
    type: 'PROJECT',
    projectId: 'p2',
    unreadCount: 0,
    lastMessagePreview: 'Acoustic sample delivered to 50 Hudson Yards reception.',
    lastMessageTime: 'Yesterday',
    members: ['Sophia Chen', 'Marcus Vance', 'Julian Thorne', 'David Thorne']
  },
  {
    id: 'c-d1',
    name: 'Marcus Vance',
    type: 'DIRECT',
    category: 'DIRECT_MESSAGE',
    subtext: 'Lead Designer',
    unreadCount: 1,
    lastMessagePreview: 'Uploaded the updated colorway mockups for the master lounge.',
    lastMessageTime: '09:12 AM',
    members: ['Marcus Vance', 'Alexander Wright']
  },
  {
    id: 'c-d2',
    name: 'Sophia Chen',
    type: 'DIRECT',
    category: 'CLIENT_SUPPORT',
    subtext: 'Project Director',
    unreadCount: 0,
    lastMessagePreview: 'Confirming site visit for Villa Aurelia this Thursday afternoon.',
    lastMessageTime: '10:15 AM',
    members: ['Eleanor Sterling', 'Sophia Chen']
  },
  {
    id: 'c-d3',
    name: 'Marcus Vance',
    type: 'DIRECT',
    category: 'CLIENT_SUPPORT',
    subtext: 'Principal Design Lead',
    unreadCount: 0,
    lastMessagePreview: 'Sent over the revised executive lounge finish samples.',
    lastMessageTime: 'Yesterday',
    members: ['Julian Thorne', 'Marcus Vance']
  }
];

export const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  'c-all': [
    {
      id: 'm-101',
      channelId: 'c-all',
      senderId: 'u1',
      senderName: 'Alexander Wright',
      senderRole: 'ADMIN',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: 'Good morning team. Please review the updated Q3 project milestone schedules and ensure all procurement orders are logged in Financials.',
      timestamp: '09:00 AM'
    },
    {
      id: 'm-102',
      channelId: 'c-all',
      senderId: 'u2',
      senderName: 'Sophia Chen',
      senderRole: 'PROJECT_MANAGER',
      senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      text: 'All weekly milestone reviews scheduled for Friday 10 AM PST. Link sent to calendars.',
      timestamp: '10:45 AM'
    }
  ],
  'c-p1': [
    {
      id: 'm-201',
      channelId: 'c-p1',
      senderId: 'u4',
      senderName: 'Eleanor Sterling',
      senderRole: 'CLIENT',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      text: 'Hello Marcus and Sophia! Have we received confirmation from the quarry in Carrara regarding the Calacatta Gold slabs for the master foyer?',
      timestamp: '10:15 AM'
    },
    {
      id: 'm-202',
      channelId: 'c-p1',
      senderId: 'u3',
      senderName: 'Marcus Vance',
      senderRole: 'DESIGNER',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Yes @Eleanor! The Carrara quarry verified slab cuts 4A and 4B. The vein matching is exquisite with honey-gold streaks. Inspection photos uploaded.',
      timestamp: '11:20 AM',
      replyToId: 'm-201',
      replySnippet: 'Hello Marcus and Sophia! Have we received confirmation...'
    }
  ],
  'c-p2': [
    {
      id: 'm-301',
      channelId: 'c-p2',
      senderId: 'u5',
      senderName: 'David Thorne',
      senderRole: 'SITE_ENGINEER',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      text: 'Acoustic sample delivered to 50 Hudson Yards reception. Decibel isolation rating tested at 48 STC.',
      timestamp: 'Yesterday 04:30 PM'
    }
  ],
  'c-d1': [
    {
      id: 'm-401',
      channelId: 'c-d1',
      senderId: 'u3',
      senderName: 'Marcus Vance',
      senderRole: 'DESIGNER',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Uploaded the updated colorway mockups for the master lounge. Let me know if you prefer the Cognac or Alabaster leather accents.',
      timestamp: '09:12 AM'
    }
  ],
  'c-d2': [
    {
      id: 'm-501',
      channelId: 'c-d2',
      senderId: 'u2',
      senderName: 'Sophia Chen',
      senderRole: 'PROJECT_MANAGER',
      senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      text: 'Good morning Eleanor! I have coordinated with the general contractor regarding the custom millwork installation.',
      timestamp: '10:00 AM'
    },
    {
      id: 'm-502',
      channelId: 'c-d2',
      senderId: 'u6',
      senderName: 'Eleanor Sterling',
      senderRole: 'CLIENT',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      text: 'Thank you Sophia. Confirming site visit for Villa Aurelia this Thursday afternoon. Looking forward to reviewing the stone mockup.',
      timestamp: '10:15 AM'
    }
  ],
  'c-d3': [
    {
      id: 'm-601',
      channelId: 'c-d3',
      senderId: 'u3',
      senderName: 'Marcus Vance',
      senderRole: 'DESIGNER',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Julian, sent over the revised executive lounge finish samples. The fluted smoked glass samples are ready for review.',
      timestamp: 'Yesterday 05:10 PM'
    }
  ]
};

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud1',
    timestamp: '2026-07-16 11:22:04',
    user: 'marcus.v@vertex.com',
    action: 'CREATE_TASK',
    category: 'PROJECT_MANAGEMENT',
    status: 'SUCCESS',
    ip: '192.168.1.104',
    diagnostics: 'Created task t2 for project p1 (Calacatta Inspection)'
  },
  {
    id: 'aud2',
    timestamp: '2026-07-16 11:05:18',
    user: 'eleanor@sterlingholdings.com',
    action: 'APPROVE_CHANGE_ORDER',
    category: 'FINANCIAL_GOVERNANCE',
    status: 'SUCCESS',
    ip: '74.125.21.19',
    diagnostics: 'Approved CO-1 (Wine Cellar Upgrade) +$28,000'
  },
  {
    id: 'aud3',
    timestamp: '2026-07-16 10:48:32',
    user: 'claire.b@vertex.com',
    action: 'RECORD_PAYMENT',
    category: 'INVOICING',
    status: 'SUCCESS',
    ip: '192.168.1.112',
    diagnostics: 'Logged payment pay2 ($351,000) for INV-2026-0582'
  },
  {
    id: 'aud4',
    timestamp: '2026-07-16 09:14:50',
    user: 'admin@vertex.com',
    action: 'UPDATE_PROJECT_PROGRESS',
    category: 'CORE_SYSTEM',
    status: 'SUCCESS',
    ip: '192.168.1.101',
    diagnostics: 'Set Villa Aurelia Penthouse progress to 70%'
  },
  {
    id: 'aud5',
    timestamp: '2026-07-15 17:30:11',
    user: 'anonymous_client',
    action: 'SUBMIT_INQUIRY',
    category: 'PORTAL',
    status: 'SUCCESS',
    ip: '108.48.91.204',
    diagnostics: 'Created inquiry inq1 from Napa Valley Estate'
  }
];

export const SEED_SYSTEM_LOGS: SystemLog[] = [
  { id: 'sys1', timestamp: '11:24:02.812', level: 'INFO', message: '[Vite:HMR] Client synchronized with VERTEX reactive state store', source: 'client.ts' },
  { id: 'sys2', timestamp: '11:23:45.109', level: 'INFO', message: '[AuditService] User action logged: RECORD_PAYMENT (ref WT-91048204)', source: 'audit.ts' },
  { id: 'sys3', timestamp: '11:20:12.440', level: 'INFO', message: '[ChatEngine] WebSocket message dispatched to channel c-p1', source: 'chat.ts' },
  { id: 'sys4', timestamp: '11:15:00.000', level: 'INFO', message: '[Cron:Metrics] Calculated portfolio budget variance: +3.2%', source: 'analytics.ts' },
  { id: 'sys5', timestamp: '10:58:19.310', level: 'WARN', message: '[GeoLocation] High precision GPS fix acquired with 4.2m horizontal accuracy', source: 'geo.ts' }
];

export const SEED_POS_TRANSACTIONS: POSTransaction[] = [
  {
    id: 'pos_1',
    transactionNumber: 'POS-2026-8841',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    cashierName: 'Claire Beauchamp',
    cashierRole: 'FINANCE',
    terminalId: 'TER-BEVERLY-01 (Stripe WisePOS E)',
    timestamp: '2026-07-18 14:32:10',
    items: [
      { id: 'pos_it_1', description: 'Calacatta Gold Quarry Inspection Pass', category: 'Procurement Sample', quantity: 1, unitPrice: 4500, total: 4500 },
      { id: 'pos_it_2', description: 'VR Spatial Walkthrough Session (4K Render Stills)', category: 'Design Technology', quantity: 1, unitPrice: 3200, total: 3200 },
      { id: 'pos_it_3', description: 'Bespoke Custom Joinery Mockup Box', category: 'Material Fabrication', quantity: 1, unitPrice: 1800, total: 1800 }
    ],
    subtotal: 9500,
    tax: 760,
    contingencyFee: 475,
    total: 10735,
    paymentMethod: 'CARD_TAP',
    cardLastFour: '9012',
    authCode: 'AUTH-983210',
    status: 'SETTLED',
    notes: 'In-studio client review session. Payment cleared via contactless Amex Black.',
    receiptHash: '0x8fbc92182736481029c8e7192840a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'
  },
  {
    id: 'pos_2',
    transactionNumber: 'POS-2026-8842',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    cashierName: 'Claire Beauchamp',
    cashierRole: 'FINANCE',
    terminalId: 'TER-BEVERLY-01 (Stripe WisePOS E)',
    timestamp: '2026-07-20 11:15:40',
    items: [
      { id: 'pos_it_4', description: 'Expedited City Structural Permit Perfection Fee', category: 'Municipal Filing', quantity: 1, unitPrice: 5800, total: 5800 },
      { id: 'pos_it_5', description: 'Acoustic Engineering Stamped Calculation Review', category: 'Engineering Review', quantity: 1, unitPrice: 3500, total: 3500 }
    ],
    subtotal: 9300,
    tax: 744,
    contingencyFee: 0,
    total: 10044,
    paymentMethod: 'WIRE_ESCROW',
    authCode: 'AUTH-WIRE-773019',
    status: 'SETTLED',
    notes: 'Escrow draw clearance authorized by Eleanor Sterling.',
    receiptHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b'
  }
];

export const SEED_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc_1',
    documentNumber: 'DOC-AIA-2026-01',
    title: 'Master Architectural Services Agreement (AIA B101 Standard)',
    category: 'CONTRACT',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    effectiveDate: '2026-01-15',
    status: 'SIGNED_SEALED',
    version: 'v1.4 Final',
    content: `THIS MASTER ARCHITECTURAL SERVICES AGREEMENT (the "Agreement") is entered into as of January 15, 2026, by and between VERTEX Architectural Studio ("Architect") and Eleanor Sterling, Sterling Luxury Holdings ("Owner / Client").\n\n1. SCOPE OF SERVICES: The Architect shall provide comprehensive luxury schematic design, design development, construction documentation, procurement advisory, and construction administration services for the penthouse estate located at Beverly Hills, CA.\n\n2. COMPENSATION & ESCROW DRAWS: Owner shall compensate Architect a fixed architectural design fee of $850,000 payable according to milestone disbursements specified in Schedule B. All funds shall clear through insured institutional escrow.\n\n3. INTELLECTUAL PROPERTY & COPYRIGHT: All architectural schematics, 3D renderings, BIM models, and bespoke joinery specifications remain the intellectual property of VERTEX Studio, licensed exclusively to Owner for execution on this real property.\n\n4. STANDARD OF CARE: Services shall be performed in accordance with the highest standard of professional care exercised by leading luxury architectural firms practicing under similar circumstances.\n\n5. GOVERNING LAW & ARBITRATION: This Agreement shall be governed by the laws of the State of California with disputes resolved via binding AAA Commercial Arbitration.`,
    signers: [
      { id: 's1', name: 'Alexander Wright', email: 'admin@vertex.com', role: 'Principal Architect (VERTEX)', hasSigned: true, signedAt: '2026-01-15 10:00:00' },
      { id: 's2', name: 'Eleanor Sterling', email: 'eleanor@sterlingholdings.com', role: 'Owner / Client (Sterling Holdings)', hasSigned: true, signedAt: '2026-01-15 14:22:00' }
    ],
    signatureCertificate: {
      signedByName: 'Eleanor Sterling & Alexander Wright',
      signedByRole: 'Client & Principal Architect',
      signedAt: '2026-01-15 14:22:00 UTC',
      cryptoHash: 'SHA256:7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      ipAddress: '192.168.1.101 & 108.48.91.204',
      certificateId: 'CERT-VTX-AIA-2026-00918'
    },
    createdAt: '2026-01-10'
  },
  {
    id: 'doc_2',
    documentNumber: 'DOC-ESC-2026-04',
    title: 'Milestone Phase 2 Escrow Draw & Disbursement Authorization',
    category: 'DRAW_AGREEMENT',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    effectiveDate: '2026-06-20',
    status: 'SIGNED_SEALED',
    version: 'v1.0 Stamped',
    content: `DISBURSEMENT AUTHORIZATION FOR ESCROW ACCOUNT #ESC-99201-VTX.\n\nPursuant to the completion and site verification of Milestone 2 (Structural Framing, Acoustic Sub-floor & Primary MEP rough-in inspection approval), the Client Eleanor Sterling hereby authorizes the release of $244,000.00 from the project escrow depository to VERTEX Architectural Studio.\n\nAll subcontractors and material suppliers have delivered unconditional partial lien waivers for work completed through June 20, 2026.`,
    signers: [
      { id: 's3', name: 'Claire Beauchamp', email: 'claire.b@vertex.com', role: 'Finance Director (VERTEX)', hasSigned: true, signedAt: '2026-06-20 09:30:00' },
      { id: 's4', name: 'Eleanor Sterling', email: 'eleanor@sterlingholdings.com', role: 'Client / Estate Owner', hasSigned: true, signedAt: '2026-06-20 11:45:00' }
    ],
    signatureCertificate: {
      signedByName: 'Eleanor Sterling',
      signedByRole: 'Owner / Signatory',
      signedAt: '2026-06-20 11:45:00 UTC',
      cryptoHash: 'SHA256:4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
      ipAddress: '108.48.91.204',
      certificateId: 'CERT-VTX-DRAW-2026-7712'
    },
    createdAt: '2026-06-18'
  },
  {
    id: 'doc_3',
    documentNumber: 'DOC-CO-2026-07',
    title: 'Change Order Legal Addendum #CO-001 (Calacatta Marble Upgrade)',
    category: 'CHANGE_ORDER_ADDENDUM',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    effectiveDate: '2026-07-02',
    status: 'SIGNED_SEALED',
    version: 'v2.1 Addendum',
    content: `LEGAL ADDENDUM TO CONSTRUCTION CONTRACT CO-001.\n\nSubject: Specification change from standard Thassos marble to Bookmatched Calacatta Gold extracted from Carrara, Italy for Master Bathroom & Foyer.\n\nCost Adjustment: +$45,000.00 to Total Contract Sum.\nSchedule Adjustment: +7 Calendar Days for oceanic air-freight transport.\n\nBoth parties acknowledge and agree that this Change Order modifies the original contract documents without invalidating any remaining covenants, warranties, or lien provisions.`,
    signers: [
      { id: 's5', name: 'Sophia Chen', email: 'sophia.chen@vertex.com', role: 'Project Manager (VERTEX)', hasSigned: true, signedAt: '2026-07-02 16:00:00' },
      { id: 's6', name: 'Eleanor Sterling', email: 'eleanor@sterlingholdings.com', role: 'Owner', hasSigned: true, signedAt: '2026-07-02 17:15:00' }
    ],
    signatureCertificate: {
      signedByName: 'Eleanor Sterling',
      signedByRole: 'Owner',
      signedAt: '2026-07-02 17:15:00 UTC',
      cryptoHash: 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      ipAddress: '108.48.91.204',
      certificateId: 'CERT-VTX-CO-2026-0019'
    },
    createdAt: '2026-07-01'
  },
  {
    id: 'doc_4',
    documentNumber: 'DOC-LIEN-2026-12',
    title: 'Trade Partner Partial Lien Waiver & Indemnity Release (Phase 2)',
    category: 'LIEN_WAIVER',
    projectId: 'p1',
    projectName: 'Villa Aurelia Penthouse',
    clientId: 'u4',
    clientName: 'Eleanor Sterling',
    effectiveDate: '2026-07-10',
    status: 'PENDING_SIGNATURE',
    version: 'v1.0 Draft',
    content: `UNCONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT.\n\nThe undersigned artisan contractor/supplier (Apex Millwork & Joinery LLC), upon receipt of progress payment of $78,500.00, hereby waives and releases any and all lien or claim of, or right to, mechanics lien, stop notice, or any right against a labor and material bond for all labor, services, equipment, or materials furnished through the date hereof for the project Villa Aurelia Penthouse.`,
    signers: [
      { id: 's7', name: 'David Thorne', email: 'david.t@vertex.com', role: 'Site Engineer (VERTEX)', hasSigned: false },
      { id: 's8', name: 'Eleanor Sterling', email: 'eleanor@sterlingholdings.com', role: 'Client', hasSigned: false }
    ],
    createdAt: '2026-07-10'
  }
];

export const SEED_COMPANIES: Company[] = [
  {
    id: 'comp-vertex',
    name: 'VERTEX Architectural Studio Inc.',
    legalName: 'VERTEX Architectural Studio & Partners LLC',
    type: 'ARCHITECTURAL_STUDIO',
    registrationNumber: 'EIN-94-3829104',
    licenseNumber: 'AIA-CA-99201',
    email: 'principal@vertex.com',
    phone: '+1 (555) 234-5678',
    website: 'https://vertex-architecture.studio',
    address: '9440 Santa Monica Blvd, Suite 700',
    city: 'Beverly Hills, CA',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'Alexander Wright',
    primaryContactEmail: 'admin@vertex.com',
    primaryContactPhone: '+1 (555) 234-5678',
    assignedProjectIds: ['p1', 'p2', 'p3', 'p4'],
    activeProjectsCount: 4,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2027-01-01',
    ndaStatus: 'SIGNED',
    creditLimit: 5000000,
    riskTier: 'LOW',
    createdAt: '2025-01-10',
    notes: 'Primary Master Studio Corporation'
  },
  {
    id: 'comp-1',
    name: 'Apex Heavy Crane & Rigging Logistics',
    legalName: 'Apex Crane, Carrier & Structural Rigging LLC',
    type: 'LOGISTICS_EQUIPMENT',
    registrationNumber: 'EIN-88-2910471',
    licenseNumber: 'CRN-CAL-884920',
    email: 'dispatch@apexcrane-rigging.com',
    phone: '+1 (555) 678-9012',
    website: 'https://apexcrane-rigging.com',
    address: '1420 Terminal Way, Port of Los Angeles',
    city: 'San Pedro, CA',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'David Thorne (Liaison)',
    primaryContactEmail: 'david.t@vertex.com',
    primaryContactPhone: '+1 (555) 678-9012',
    assignedProjectIds: ['p1', 'p2'],
    activeProjectsCount: 2,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2026-11-30',
    ndaStatus: 'SIGNED',
    creditLimit: 750000,
    riskTier: 'LOW',
    createdAt: '2025-06-15',
    notes: 'Operates 500-ton Liebherr mobile cranes and rooftop glass suction lifters'
  },
  {
    id: 'comp-2',
    name: 'Sterling Luxury Holdings',
    legalName: 'Sterling Family Heritage Investment Trust',
    type: 'CLIENT_HOLDING',
    registrationNumber: 'EIN-12-8849102',
    email: 'legal@sterlingholdings.com',
    phone: '+1 (555) 567-8901',
    website: 'https://sterlingluxuryholdings.com',
    address: '1004 Wilshire Blvd',
    city: 'Beverly Hills, CA',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'Eleanor Sterling',
    primaryContactEmail: 'eleanor@sterlingholdings.com',
    primaryContactPhone: '+1 (555) 567-8901',
    assignedProjectIds: ['p1'],
    activeProjectsCount: 1,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2027-06-15',
    ndaStatus: 'SIGNED',
    creditLimit: 12000000,
    riskTier: 'LOW',
    createdAt: '2025-10-01',
    notes: 'Commissioning Owner entity for Villa Aurelia Penthouse'
  },
  {
    id: 'comp-3',
    name: 'Carrara Elite Quarries Consortium',
    legalName: 'Consorzio Cave di Marmo di Carrara S.r.l.',
    type: 'STONE_QUARRY',
    registrationNumber: 'VAT-IT-099281704',
    licenseNumber: 'MIN-IT-44910',
    email: 'sales@carrara-quarries.it',
    phone: '+39 0585 849201',
    website: 'https://carrara-elitequarries.it',
    address: 'Via dei Marmi 44, Bacino di Gioia',
    city: 'Carrara (MS)',
    country: 'Italy',
    status: 'VERIFIED',
    primaryContactName: 'Gianluigi Moretti',
    primaryContactEmail: 'g.moretti@carrara-quarries.it',
    primaryContactPhone: '+39 0585 849201',
    assignedProjectIds: ['p1', 'p3'],
    activeProjectsCount: 2,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2026-12-31',
    ndaStatus: 'SIGNED',
    creditLimit: 1500000,
    riskTier: 'LOW',
    createdAt: '2025-08-20',
    notes: 'Direct quarry supplier for Calacatta Gold bookmatched slabs'
  },
  {
    id: 'comp-4',
    name: 'Nordic Structural & MEP Engineering',
    legalName: 'Nordic MEP & Building Sciences LLP',
    type: 'MEP_ENGINEERING',
    registrationNumber: 'EIN-44-9102837',
    licenseNumber: 'PE-CA-77192',
    email: 'consulting@nordicengineering.com',
    phone: '+1 (555) 441-2099',
    website: 'https://nordicengineering.com',
    address: '555 California Street, Suite 2200',
    city: 'San Francisco, CA',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'Henrik Lindqvist, PE',
    primaryContactEmail: 'henrik@nordicengineering.com',
    primaryContactPhone: '+1 (555) 441-2099',
    assignedProjectIds: ['p1', 'p2', 'p4'],
    activeProjectsCount: 3,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2026-10-15',
    ndaStatus: 'SIGNED',
    creditLimit: 900000,
    riskTier: 'LOW',
    createdAt: '2025-03-12',
    notes: 'Specialist HVAC acoustic isolation and seismic retrofitting engineers'
  },
  {
    id: 'comp-5',
    name: 'Poliform & Molteni Bespoke Joinery',
    legalName: 'Poliform Contract Luxury Millwork SpA',
    type: 'INTERIOR_FURNISHING',
    registrationNumber: 'EIN-99-1029384',
    licenseNumber: 'FUR-NY-09182',
    email: 'contract@poliform-joinery.com',
    phone: '+1 (212) 555-0182',
    website: 'https://poliform.it',
    address: '112 Greene Street, Soho',
    city: 'New York, NY',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'Matteo Rossi',
    primaryContactEmail: 'm.rossi@poliform-joinery.com',
    primaryContactPhone: '+1 (212) 555-0182',
    assignedProjectIds: ['p1', 'p3'],
    activeProjectsCount: 2,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2026-09-30',
    ndaStatus: 'SIGNED',
    creditLimit: 1200000,
    riskTier: 'LOW',
    createdAt: '2025-07-04',
    notes: 'Custom smoked eucalyptus wardrobes and bronze kitchen islands'
  },
  {
    id: 'comp-6',
    name: 'Blackstone & Co. Architectural Legal',
    legalName: 'Blackstone, Vance & Sterling Attorneys at Law LLP',
    type: 'LEGAL_CONSULTING',
    registrationNumber: 'EIN-77-3819201',
    licenseNumber: 'BAR-CA-449102',
    email: 'counsel@blackstone-legal.com',
    phone: '+1 (555) 890-4411',
    website: 'https://blackstone-legal.com',
    address: '2000 Avenue of the Stars',
    city: 'Los Angeles, CA',
    country: 'United States',
    status: 'VERIFIED',
    primaryContactName: 'Roland Blackstone, Esq.',
    primaryContactEmail: 'rblackstone@blackstone-legal.com',
    primaryContactPhone: '+1 (555) 890-4411',
    assignedProjectIds: ['p1', 'p2', 'p3', 'p4'],
    activeProjectsCount: 4,
    insuranceCOIStatus: 'VALID',
    insuranceExpiryDate: '2027-03-31',
    ndaStatus: 'SIGNED',
    creditLimit: 2500000,
    riskTier: 'LOW',
    createdAt: '2025-02-01',
    notes: 'Retained municipal zoning, CEQA environmental permits, and AIA contract counsel'
  }
];

export const SEED_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-1',
    sku: 'PRC-SLAB-01',
    title: 'Quarry Slab Inspection Pass',
    category: 'Procurement Sample',
    price: 4500,
    unit: 'Per Inspection',
    description: 'On-site physical slab vein inspection and ultrasonic density verification at Carrara or Seravezza marble quarries with certified geologists.',
    leadTime: '3 Business Days',
    tags: ['Marble', 'Quarry', 'Inspection', 'Stone', 'Italy'],
    isCustom: false,
    createdAt: '2025-11-10'
  },
  {
    id: 'cat-2',
    sku: 'DSN-VR-02',
    title: '4K VR Spatial Walkthrough Pass',
    category: 'Design Technology',
    price: 3200,
    unit: 'Per Session',
    description: 'Bespoke Unreal Engine 5.4 immersive spatial walkthrough session in 4K resolution with real-time daylight sun-path raytracing and material toggling.',
    leadTime: '24 Hours',
    tags: ['VR', '3D Render', 'Unreal Engine', 'Simulation', 'Walkthrough'],
    isCustom: false,
    createdAt: '2025-11-12'
  },
  {
    id: 'cat-3',
    sku: 'FAB-JOIN-03',
    title: 'Bespoke Joinery Finish Box',
    category: 'Material Fabrication',
    price: 1800,
    unit: 'Per Sample Box',
    description: 'Hand-crafted physical finish curation containing 8 precision-milled timber species (Smoked Eucalyptus, American Walnut, White Oak) with brushed bronze hardware samples.',
    leadTime: '5 Business Days',
    tags: ['Joinery', 'Wood', 'Cabinetry', 'Samples', 'Hardware'],
    isCustom: false,
    createdAt: '2025-11-15'
  },
  {
    id: 'cat-4',
    sku: 'MUN-PRMT-04',
    title: 'Expedited City Permit Filing Fee',
    category: 'Municipal Filing',
    price: 5800,
    unit: 'Per Filing',
    description: 'Priority courier submission, certified structural engineer plan-check representation, and fast-track municipal liaison service for city planning departments.',
    leadTime: '1-2 Weeks',
    tags: ['Permits', 'City Planning', 'Expedited', 'Zoning', 'Legal'],
    isCustom: false,
    createdAt: '2025-11-18'
  },
  {
    id: 'cat-5',
    sku: 'ENG-ACOU-05',
    title: 'Acoustic Engineering Stamped Calculation',
    category: 'Engineering Review',
    price: 3500,
    unit: 'Fixed Fee',
    description: 'STC 65+ certified sound transmission loss and NC-20 low-frequency HVAC dampening calculation with PE stamped structural engineering report.',
    leadTime: '4 Business Days',
    tags: ['Acoustics', 'Soundproofing', 'PE Stamp', 'HVAC', 'Engineering'],
    isCustom: false,
    createdAt: '2025-11-20'
  },
  {
    id: 'cat-6',
    sku: 'FIN-ESCR-06',
    title: 'Milestone Escrow Advance Draw',
    category: 'Escrow Retainer',
    price: 25000,
    unit: 'Per Draw',
    description: 'Secured smart escrow capital advance deposit for long-lead specialized materials (Italian custom facade glass, titanium-zinc roofing coils).',
    leadTime: 'Immediate',
    tags: ['Escrow', 'Finance', 'Retainer', 'Deposit', 'Draw'],
    isCustom: false,
    createdAt: '2025-11-22'
  },
  {
    id: 'cat-7',
    sku: 'DSN-LUX-07',
    title: 'Luxury Lighting Lux Schedule Review',
    category: 'Electrical Design',
    price: 2800,
    unit: 'Fixed Fee',
    description: 'DIALux Evo photometrical lighting distribution calculation, DALI-2 dimming protocol matrix, and 2700K warm-dim high-CRI fixture specification.',
    leadTime: '3 Business Days',
    tags: ['Lighting', 'DALI', 'Electrical', 'Photometry', 'Lux'],
    isCustom: false,
    createdAt: '2025-11-25'
  },
  {
    id: 'cat-8',
    sku: 'SUR-DRON-08',
    title: 'On-Site Drone Orthomosaic Scan',
    category: 'Site Survey',
    price: 2200,
    unit: 'Per Flight Mission',
    description: 'Sub-centimeter RTK GPS photogrammetric LiDAR drone survey providing georeferenced point cloud, elevation contour lines, and CAD terrain meshes.',
    leadTime: '2 Business Days',
    tags: ['Drone', 'LiDAR', 'Site Survey', 'Terrain', 'Point Cloud'],
    isCustom: false,
    createdAt: '2025-11-28'
  },
  {
    id: 'cat-9',
    sku: 'PRC-CALA-09',
    title: 'Calacatta Gold Bookmatch Lot Curation',
    category: 'Procurement Sample',
    price: 6200,
    unit: 'Per Lot Curation',
    description: 'Direct quarry selection and 3D digital bookmatching alignment of 4 consecutive extra-grade Calacatta Gold slabs with high-definition dry-lay preview.',
    leadTime: '1 Week',
    tags: ['Marble', 'Calacatta', 'Bookmatch', 'Luxury', 'Stone'],
    isCustom: false,
    createdAt: '2025-12-01'
  },
  {
    id: 'cat-10',
    sku: 'ENG-LOAD-10',
    title: 'Structural Load Re-Engineering Addendum',
    category: 'Engineering Review',
    price: 4800,
    unit: 'Fixed Fee',
    description: 'Cantilever balcony and infinity edge structural redesign addendum with finite element stress distribution models for heavy stone load calculations.',
    leadTime: '5 Business Days',
    tags: ['Structural', 'Cantilever', 'Engineering', 'Stress Model'],
    isCustom: false,
    createdAt: '2025-12-05'
  },
  {
    id: 'cat-11',
    sku: 'FAB-BRNZ-11',
    title: 'Custom Bronze Hardware Patina Proofing',
    category: 'Material Fabrication',
    price: 2100,
    unit: 'Per Proof Set',
    description: 'Chemical acid-wash patina aging proofs on solid unlacquered architectural bronze pulls, pocket-door levers, and window cremone hardware.',
    leadTime: '2 Weeks',
    tags: ['Bronze', 'Patina', 'Hardware', 'Fabrication', 'Finishes'],
    isCustom: false,
    createdAt: '2025-12-10'
  },
  {
    id: 'cat-12',
    sku: 'ENG-HVAC-12',
    title: 'HVAC Cleanroom & Wine Cellar Spec Audit',
    category: 'Engineering Review',
    price: 3900,
    unit: 'Fixed Fee',
    description: 'Dual-compressor redundant 55°F / 70% RH vapor-barrier climate engineering verification with whisper-quiet duct acoustic dampeners.',
    leadTime: '3 Business Days',
    tags: ['Wine Cellar', 'HVAC', 'Cleanroom', 'Climate Control'],
    isCustom: false,
    createdAt: '2025-12-15'
  }
];


