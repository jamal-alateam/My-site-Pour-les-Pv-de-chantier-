import { OfficeSettings, Project, SitePV, UserProfile } from '../types';

export const initialProfiles: UserProfile[] = [
  {
    id: 'user_abdelali',
    name: 'ABDELALI MIMAN',
    title: 'Dessinateur-Projeteur / MOE',
    organization: 'ARCHITEXPERT',
    email: 'mimanabdelali@gmail.com',
    phone: '06 75 50 89 07',
    roleTag: 'Architecte',
    color: '#0B1F3A',
    isDefault: true
  },
  {
    id: 'user_marc',
    name: 'Marc DUPONT',
    title: 'Conducteur de Travaux Principal',
    organization: 'BATI-MAROC SARL',
    email: 'm.dupont@batimaroc.ma',
    phone: '06 61 22 33 44',
    roleTag: 'Conducteur de Travaux',
    color: '#10B981'
  },
  {
    id: 'user_sophie',
    name: 'Sophie BENJELLOUN',
    title: 'Ingénieure Structure & BET',
    organization: 'BUREAU D\'ÉTUDES INGENIERIE',
    email: 's.benjelloun@bet-ing.ma',
    phone: '06 62 55 66 77',
    roleTag: 'Ingénieur',
    color: '#6366F1'
  },
  {
    id: 'user_thomas',
    name: 'Thomas LAURENT',
    title: 'Inspecteur & Contrôleur Technique',
    organization: 'SOCOTEC MAROC',
    email: 't.laurent@socotec.ma',
    phone: '06 63 88 99 00',
    roleTag: 'Inspecteur',
    color: '#C9A24B'
  }
];

export const initialOfficeSettings: OfficeSettings = {
  name: 'ABDELALI MIMAN',
  title: 'Dessinateur-Projeteur',
  brand: 'ARCHITEXPERT',
  email: 'mimanabdelali@gmail.com',
  phone: '06 75 50 89 07',
  address: '32 Boulevard Zerktouni, 4ème étage',
  city: 'Casablanca, Maroc',
  logoUrl: 'https://lh3.googleusercontent.com/d/1Z-H4cndN9o7Sthu3e_YsRMzzzYpjjh92',
  legalMention: 'ARCHITEXPERT — Cabinet d\'Études, Maîtrise d\'Œuvre et Suivi de Chantier. Document officiel établi selon les règles de l\'art.'
};

export const initialProjects: Project[] = [
  {
    id: 'prj_anfa',
    code: 'PRJ-2026-01',
    name: 'Résidence Anfa Sky - Villa de Luxe',
    client: 'M. Omar Kettani',
    address: 'Lotissement Anfa Superior, Rue 12',
    city: 'Casablanca',
    status: 'En cours',
    progress: 65,
    startDate: '2026-01-15',
    estimatedEndDate: '2026-11-30',
    lots: [
      { id: 'lot_1', lotName: 'Gros Œuvre', companyName: 'BATI-MAROC SARL', contactName: 'M. El Alami', phone: '06 61 12 34 56', email: 'contact@batimaroc.ma' },
      { id: 'lot_2', lotName: 'Étanchéité', companyName: 'ISOL-ETANCH', contactName: 'M. Bennani', phone: '06 62 98 76 54', email: 'bennani@isoletanch.ma' },
      { id: 'lot_3', lotName: 'Électricité / Domotique', companyName: 'ELEC-PRO CASABLANCA', contactName: 'M. Tazi', phone: '06 63 45 67 89', email: 'tazi@elecpro.ma' },
      { id: 'lot_4', lotName: 'Plomberie / Sanitaire', companyName: 'SANICLIM', contactName: 'M. Chraibi', phone: '06 64 11 22 33', email: 'chraibi@saniclim.ma' },
      { id: 'lot_5', lotName: 'Menuiserie Aluminium & Bois', companyName: 'ALU-DESIGN', contactName: 'M. Berrada', phone: '06 65 33 44 55', email: 'info@aludesign.ma' }
    ],
    notes: 'Chantier haut de gamme. Exigence stricte sur les finitions et la sécurité.'
  },
  {
    id: 'prj_business_tower',
    code: 'PRJ-2026-02',
    name: 'Immeuble Commercial & Bureaux Zerktouni',
    client: 'Groupe Somagec Immo',
    address: '85 Angle Bd Zerktouni et Rue Washington',
    city: 'Casablanca',
    status: 'En cours',
    progress: 40,
    startDate: '2026-02-01',
    estimatedEndDate: '2027-03-15',
    lots: [
      { id: 'lot_bt_1', lotName: 'Gros Œuvre & Structure', companyName: 'SGTM Bâtiment', contactName: 'Ing. Fassi', phone: '06 70 88 99 00' },
      { id: 'lot_bt_2', lotName: 'Climatisation / CVC', companyName: 'CLIMA-TECH', contactName: 'M. Idrissi', phone: '06 71 22 33 44' }
    ],
    notes: 'Projet R+6 avec 2 sous-sols de parking.'
  },
  {
    id: 'prj_riad_medina',
    code: 'PRJ-2025-08',
    name: 'Rénovation & Restauration Riad Medina',
    client: 'Mme Sophia Bennani',
    address: 'Derb Dabachi, Médina',
    city: 'Marrakech',
    status: 'En réception',
    progress: 92,
    startDate: '2025-09-10',
    estimatedEndDate: '2026-08-15',
    lots: [
      { id: 'lot_rm_1', lotName: 'Zellige & Plâtre Traditionnel', companyName: 'Artisans du Sud', contactName: 'Maâlem Ahmed', phone: '06 50 11 22 33' },
      { id: 'lot_rm_2', lotName: 'Peinture & Finitions', companyName: 'DECO-DECOR', contactName: 'M. Mansouri', phone: '06 51 44 55 66' }
    ],
    notes: 'Travaux de restauration traditionnelle des stucs et zelliges.'
  },
  {
    id: 'prj_villa_hamza',
    code: 'PRJ-2026-03',
    name: 'Villa Hamza - Résidence Privée',
    client: 'M. Hamza BENNIS',
    address: 'Route d\'Amezmiz, Km 7',
    city: 'Marrakech',
    status: 'En cours',
    progress: 55,
    startDate: '2026-02-10',
    estimatedEndDate: '2026-12-20',
    lots: [
      { id: 'lot_vh_1', lotName: 'Gros Œuvre & Structure', companyName: 'BATI-PRESTIGE SARL', contactName: 'M. Hamza', phone: '06 61 77 88 99', email: 'hamza@batiprestige.ma' },
      { id: 'lot_vh_2', lotName: 'Étanchéité & Isolation', companyName: 'ISOL-MAROC', contactName: 'M. Larbi', phone: '06 62 11 22 33' },
      { id: 'lot_vh_3', lotName: 'Électricité & Domotique', companyName: 'ELEC-HIGH-TECH', contactName: 'M. Amine', phone: '06 63 99 88 77' },
      { id: 'lot_vh_4', lotName: 'Plomberie & Climatisation', companyName: 'CLIM-PRO', contactName: 'M. Youssef', phone: '06 64 55 44 33' },
      { id: 'lot_vh_5', lotName: 'Piscine & Espaces Verts', companyName: 'AQUA-GARDEN', contactName: 'M. Samir', phone: '06 65 22 11 00' }
    ],
    notes: 'Villa d\'architecte moderne avec piscine à débordement et finitions haut de gamme.'
  },
  {
    id: 'prj_villa_karim',
    code: 'PRJ-2026-04',
    name: 'Villa Karim - Résidence Contemporaine',
    client: 'M. Karim ALAMI',
    address: 'Circuit de la Palmeraie',
    city: 'Marrakech',
    status: 'En cours',
    progress: 40,
    startDate: '2026-03-01',
    estimatedEndDate: '2027-01-30',
    lots: [
      { id: 'lot_vk_1', lotName: 'Gros Œuvre & Fondations', companyName: 'BATI-CONCEPT SARL', contactName: 'M. Karim', phone: '06 61 11 22 33', email: 'karim@baticoncept.ma' },
      { id: 'lot_vk_2', lotName: 'Électricité & Domotique', companyName: 'DOMO-TECH', contactName: 'M. Reda', phone: '06 62 44 55 66' },
      { id: 'lot_vk_3', lotName: 'Menuiserie Aluminium & Vitrage', companyName: 'ALU-DESIGN', contactName: 'M. Hassan', phone: '06 63 77 88 99' }
    ],
    notes: 'Villa contemporaine de plain-pied avec patio végétalisé et grande baie vitrée.'
  },
  {
    id: 'prj_immeuble_claude',
    code: 'PRJ-2026-05',
    name: 'Immeuble Claude - Résidence R+5',
    client: 'M. Claude DUPONT / SCI CLAUDE',
    address: '14 Avenue Hassan II',
    city: 'Casablanca',
    status: 'En cours',
    progress: 68,
    startDate: '2025-11-15',
    estimatedEndDate: '2026-11-30',
    lots: [
      { id: 'lot_ic_1', lotName: 'Gros Œuvre & Structure', companyName: 'SOCIÉTÉ NATIONALE DE BÂTIMENT', contactName: 'M. Claude', phone: '06 70 12 34 56', email: 'claude@sn-batiment.ma' },
      { id: 'lot_ic_2', lotName: 'Ascenseurs & Équipements', companyName: 'OTIS MAROC', contactName: 'M. Mehdi', phone: '06 71 23 45 67' },
      { id: 'lot_ic_3', lotName: 'Revêtements & Carrelage', companyName: 'CERAM-LUX', contactName: 'M. Othmane', phone: '06 72 34 56 78' },
      { id: 'lot_ic_4', lotName: 'Étanchéité & Isolation', companyName: 'ISOL-ETANCHE', contactName: 'M. Tariq', phone: '06 73 45 67 89' }
    ],
    notes: 'Immeuble résidentiel standing R+5 comportant 15 appartements et locaux commerciaux au RDC.'
  },
  {
    id: 'prj_immeuble_galile',
    code: 'PRJ-2026-06',
    name: 'Immeuble Galilée - Centre d\'Affaires R+6',
    client: 'GROUPE GALILÉE IMMOBILIER',
    address: 'Boulevard Galilée, Triangle d\'Or',
    city: 'Casablanca',
    status: 'En cours',
    progress: 50,
    startDate: '2026-01-10',
    estimatedEndDate: '2027-03-15',
    lots: [
      { id: 'lot_ig_1', lotName: 'Gros Œuvre & Génie Civil', companyName: 'GALILÉE CONSTRUCTION', contactName: 'M. Samir', phone: '06 61 88 99 00', email: 's.galilee@construction.ma' },
      { id: 'lot_ig_2', lotName: 'Façade Mur-Rideau & Vitrage', companyName: 'GLASS-TECH MAROC', contactName: 'M. Nabil', phone: '06 62 33 44 55' },
      { id: 'lot_ig_3', lotName: 'CVC & Extraction Fumées', companyName: 'THERMO-AIR', contactName: 'M. Adil', phone: '06 63 22 11 00' },
      { id: 'lot_ig_4', lotName: 'Électricité Courants Forts/Faibles', companyName: 'POWER-SYS', contactName: 'M. Rachid', phone: '06 64 88 77 66' }
    ],
    notes: 'Immeuble de bureaux R+6 avec 2 niveaux de sous-sol, façades en mur-rideau et certifications environnementales.'
  },
  {
    id: 'prj_villa_bennouna',
    code: 'PRJ-2026-07',
    name: 'Villa Bennouna - Résidence de Luxe',
    client: 'M. & Mme BENNOUNA',
    address: 'Anfa Supérieur, Rue des Lilas',
    city: 'Casablanca',
    status: 'En cours',
    progress: 45,
    startDate: '2026-02-15',
    estimatedEndDate: '2027-02-28',
    lots: [
      { id: 'lot_vb_1', lotName: 'Gros Œuvre & Béton Armé', companyName: 'NORD CONSTRUCTION', contactName: 'M. Bennouna', phone: '06 61 22 33 44', email: 'bennouna@nord-construction.ma' },
      { id: 'lot_vb_2', lotName: 'Menuiserie Aluminium & Vitrage', companyName: 'ALU-PRESTIGE', contactName: 'M. Driss', phone: '06 62 55 66 77' },
      { id: 'lot_vb_3', lotName: 'Électricité & Domotique', companyName: 'SMART-HOME MAROC', contactName: 'M. Hicham', phone: '06 63 88 99 00' }
    ],
    notes: 'Villa contemporaine d\'architecte avec sous-sol aménagé et piscine chauffée.'
  },
  {
    id: 'prj_villa_messouadi',
    code: 'PRJ-2026-08',
    name: 'Villa Messouadi - Résidence Privée',
    client: 'M. MESSOUADI',
    address: 'Palmeraie Nord, Km 5',
    city: 'Marrakech',
    status: 'En cours',
    progress: 60,
    startDate: '2026-01-20',
    estimatedEndDate: '2026-12-15',
    lots: [
      { id: 'lot_vm_1', lotName: 'Gros Œuvre & Structure', companyName: 'ATLAS BÂTIMENT SARL', contactName: 'M. Messouadi', phone: '06 64 11 22 33', email: 'messouadi@atlasbat.ma' },
      { id: 'lot_vm_2', lotName: 'Étanchéité & Isolation', companyName: 'ISOL-SOUTH', contactName: 'M. Khalid', phone: '06 65 44 55 66' },
      { id: 'lot_vm_3', lotName: 'Revêtements & Marbre', companyName: 'MARBRE & TRADITION', contactName: 'M. Hassan', phone: '06 66 77 88 99' }
    ],
    notes: 'Projet de villa néo-marocaine alliant matériaux traditionnels et équipements modernes.'
  },
  {
    id: 'prj_salwa_belhachmi',
    code: 'PRJ-2026-09',
    name: 'Villa Salwa Belhachmi',
    client: 'Mme Salwa BELHACHMI',
    address: 'Quartier California, Rue des Jacarandas',
    city: 'Casablanca',
    status: 'En cours',
    progress: 50,
    startDate: '2026-03-05',
    estimatedEndDate: '2027-01-20',
    lots: [
      { id: 'lot_sb_1', lotName: 'Gros Œuvre & Maçonnerie', companyName: 'PRO-BÂTI CASABLANCA', contactName: 'Mme Salwa', phone: '06 67 00 11 22', email: 'salwa.belhachmi@gmail.com' },
      { id: 'lot_sb_2', lotName: 'Plomberie & Sanitaires', companyName: 'HYDRO-FLUIDES', contactName: 'M. Youssef', phone: '06 68 33 44 55' },
      { id: 'lot_sb_3', lotName: 'Peinture & Décoration', companyName: 'DECO-LINE', contactName: 'Mme Houda', phone: '06 69 66 77 88' }
    ],
    notes: 'Réhabilitation lourde et extension d\'une villa individuelle de haut standing.'
  },
  {
    id: 'prj_cpc',
    code: 'PRJ-2026-10',
    name: 'Projet CPC - Centre Professionnel & Commercial',
    client: 'SOCIÉTÉ CPC MAROC',
    address: 'Zone Industrielle Tit Mellil',
    city: 'Casablanca',
    status: 'En cours',
    progress: 35,
    startDate: '2026-04-01',
    estimatedEndDate: '2027-05-30',
    lots: [
      { id: 'lot_cpc_1', lotName: 'Génie Civil & Charpente Métallique', companyName: 'CPC CONSTRUCTION', contactName: 'M. Bennis', phone: '06 70 99 88 77', email: 'contact@cpc-maroc.ma' },
      { id: 'lot_cpc_2', lotName: 'CVC & Extraction Industrielle', companyName: 'AIR-PRO INDUSTRIE', contactName: 'M. Amine', phone: '06 71 22 33 44' },
      { id: 'lot_cpc_3', lotName: 'Électricité TBT & Sécurité', companyName: 'ELEC-SECURE', contactName: 'M. Mehdi', phone: '06 72 55 66 77' }
    ],
    notes: 'Bâtiment industriel et commercial intégrant entrepôts, bureaux et showroom.'
  }
];

export const initialPVs: SitePV[] = [
  {
    id: 'pv_001_anfa',
    number: 'PV-001',
    projectId: 'prj_anfa',
    date: '2026-07-20',
    time: '10:00',
    weather: 'Ensoleillé',
    overallProgress: 60,
    nextMeetingDate: '2026-08-03',
    nextMeetingTime: '10:00',
    generalNotes: 'Réunion hebdomadaire de suivi de chantier. Validation du coulage de la dalle du 1er étage et vérification des attentes électriques.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Dessinateur-Projeteur / Archi', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'Omar Kettani', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent', email: 'kettani@gmail.com' },
      { id: 'p3', name: 'M. El Alami', role: 'Conducteur de Travaux', organization: 'BATI-MAROC SARL', status: 'Présent', phone: '06 61 12 34 56' },
      { id: 'p4', name: 'M. Tazi', role: 'Chef d\'Équipe Élec', organization: 'ELEC-PRO CASABLANCA', status: 'Présent', phone: '06 63 45 67 89' },
      { id: 'p5', name: 'M. Bennani', role: 'Responsable Étanchéité', organization: 'ISOL-ETANCH', status: 'Excusé', phone: '06 62 98 76 54' }
    ],
    observations: [
      {
        id: 'obs_1',
        number: 1,
        lot: 'Gros Œuvre',
        location: '1er Étage - Balcon Façade Principale',
        text: 'Rectifier le coffrage du nez de dalle du balcon Ouest avant coulage. Réserves de réservation pour garde-corps à poser.',
        assignedTo: 'BATI-MAROC SARL',
        dueDate: '2026-07-25',
        status: 'Urgent'
      },
      {
        id: 'obs_2',
        number: 2,
        lot: 'Électricité / Domotique',
        location: 'RDC - Salon Cathédrale',
        text: 'Encastrement des gaines pour le tableau secondaire non conforme au plan Elec V2. Revoir le tracé et reboucher proprement.',
        assignedTo: 'ELEC-PRO CASABLANCA',
        dueDate: '2026-07-28',
        status: 'À faire'
      },
      {
        id: 'obs_3',
        number: 3,
        lot: 'Étanchéité',
        location: 'Toiture Terrasse Accessible',
        text: 'Nettoyage obligatoire de la dalle terrasse avant application du primaire d\'accrochage. Enlever tous les gravois.',
        assignedTo: 'ISOL-ETANCH',
        dueDate: '2026-07-30',
        status: 'À faire'
      },
      {
        id: 'obs_4',
        number: 4,
        lot: 'Plomberie / Sanitaire',
        location: 'Sous-sol - Local Technique',
        text: 'Chape d\'égalisation sous groupe de surpression finalisée et validée par la maîtrise d\'œuvre.',
        assignedTo: 'SANICLIM',
        dueDate: '2026-07-18',
        status: 'En cours',
        resolvedDate: '2026-07-19'
      }
    ],
    galleryPhotos: [
      {
        id: 'photo_anfa_1',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Vue générale structure béton armé et coulage dalle R+1',
        lot: 'Gros Œuvre',
        date: '2026-07-20',
        annotations: [
          {
            id: 'ann_1',
            startX: 25,
            startY: 25,
            targetX: 42,
            targetY: 46,
            text: 'Vérifier le calage des banches',
            color: '#DC2626',
            date: '20/07/2026'
          },
          {
            id: 'ann_2',
            startX: 75,
            startY: 32,
            targetX: 62,
            targetY: 52,
            text: 'Ferraillage conforme plan BET',
            color: '#059669',
            date: '20/07/2026'
          }
        ]
      },
      {
        id: 'photo_anfa_2',
        url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Terrasse accessible — Préparation support d\'étanchéité',
        lot: 'Étanchéité',
        date: '2026-07-20',
        annotations: [
          {
            id: 'ann_3',
            startX: 32,
            startY: 30,
            targetX: 48,
            targetY: 62,
            text: 'Relevé étanchéité h=15cm min',
            color: '#D97706',
            date: '20/07/2026'
          },
          {
            id: 'ann_4',
            startX: 78,
            startY: 35,
            targetX: 68,
            targetY: 55,
            text: 'Nettoyage gravois avant primaire',
            color: '#DC2626',
            date: '20/07/2026'
          }
        ]
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-20'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'Omar Kettani',
        date: '2026-07-20'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'M. El Alami (BATI-MAROC)',
        date: '2026-07-20'
      }
    },
    createdAt: '2026-07-20T11:30:00.000Z',
    updatedAt: '2026-07-20T11:30:00.000Z'
  },
  {
    id: 'pv_002_anfa',
    number: 'PV-002',
    projectId: 'prj_anfa',
    date: '2026-07-27',
    time: '10:30',
    weather: 'Ensoleillé',
    overallProgress: 65,
    nextMeetingDate: '2026-08-10',
    nextMeetingTime: '10:00',
    generalNotes: 'Contrôle des travaux d\'étanchéité terrasse et pose des précadres aluminium.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Dessinateur-Projeteur', organization: 'ARCHITEXPERT', status: 'Présent' },
      { id: 'p2', name: 'M. El Alami', role: 'Conducteur de Travaux', organization: 'BATI-MAROC SARL', status: 'Présent' },
      { id: 'p3', name: 'M. Berrada', role: 'Responsable Alu', organization: 'ALU-DESIGN', status: 'Présent' }
    ],
    observations: [
      {
        id: 'obs_201',
        number: 1,
        lot: 'Menuiserie Aluminium & Bois',
        location: '1er Étage - Suite Parentale',
        text: 'Précadres baie vitrée posés de niveau. Prévoir calutage d\'étanchéité périmétrique avant pose du vitrage isolant.',
        assignedTo: 'ALU-DESIGN',
        dueDate: '2026-08-02',
        status: 'En cours'
      },
      {
        id: 'obs_202',
        number: 2,
        lot: 'Étanchéité',
        location: 'Terrasse R+1',
        text: 'Essai d\'étanchéité par mise en eau pendant 48h requis avant pose de l\'isolant polyuréthane.',
        assignedTo: 'ISOL-ETANCH',
        dueDate: '2026-08-05',
        status: 'À faire'
      }
    ],
    galleryPhotos: [
      {
        id: 'photo_anfa_3',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pose des précadres aluminium et contrôle des aplombs',
        lot: 'Menuiserie Aluminium & Bois',
        date: '2026-07-27',
        annotations: [
          {
            id: 'ann_5',
            startX: 30,
            startY: 28,
            targetX: 48,
            targetY: 52,
            text: 'Précadres alu posés de niveau',
            color: '#2563EB',
            date: '27/07/2026'
          },
          {
            id: 'ann_6',
            startX: 76,
            startY: 32,
            targetX: 65,
            targetY: 60,
            text: 'Calfeutrement silicone périmétrique',
            color: '#D97706',
            date: '27/07/2026'
          }
        ]
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-27'
      }
    },
    createdAt: '2026-07-27T12:00:00.000Z',
    updatedAt: '2026-07-27T12:00:00.000Z'
  },
  {
    id: 'pv_001_hamza',
    number: 'PV-001-VH',
    projectId: 'prj_villa_hamza',
    date: '2026-07-28',
    time: '11:00',
    weather: 'Ensoleillé',
    overallProgress: 55,
    nextMeetingDate: '2026-08-11',
    nextMeetingTime: '10:30',
    generalNotes: 'Visite de chantier pour le suivi du gros œuvre de la Villa Hamza, coulage des voiles béton de la piscine et réservations domotiques.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Dessinateur-Projeteur / Archi', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'Hamza BENNIS', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent' },
      { id: 'p3', name: 'M. Larbi', role: 'Conducteur de Travaux', organization: 'BATI-PRESTIGE SARL', status: 'Présent', phone: '06 61 77 88 99' },
      { id: 'p4', name: 'M. Amine', role: 'Ingénieur Électricien', organization: 'ELEC-HIGH-TECH', status: 'Présent', phone: '06 63 99 88 77' }
    ],
    observations: [
      {
        id: 'obs_vh_1',
        number: 1,
        lot: 'Gros Œuvre & Structure',
        location: 'RDC - Salon Principal & Terrasse Piscine',
        text: 'Vérification du ferraillage des voiles béton de la piscine à débordement. Prévoir cales d\'enrobage supplémentaires avant coulage.',
        assignedTo: 'BATI-PRESTIGE SARL',
        dueDate: '2026-08-01',
        status: 'Urgent'
      },
      {
        id: 'obs_vh_2',
        number: 2,
        lot: 'Électricité & Domotique',
        location: '1er Étage - Suite Parentale Villa Hamza',
        text: 'Emplacement des boîtiers d\'encastrement pour les écrans tactiles domotiques à ajuster selon le plan d\'agencement V3.',
        assignedTo: 'ELEC-HIGH-TECH',
        dueDate: '2026-08-05',
        status: 'À faire'
      },
      {
        id: 'obs_vh_3',
        number: 3,
        lot: 'Plomberie & Climatisation',
        location: 'Sous-sol - Local Technique Villa Hamza',
        text: 'Passage des tuyauteries frigorifiques pour les unités gainables du salon validé par l\'architecte.',
        assignedTo: 'CLIM-PRO',
        dueDate: '2026-07-30',
        status: 'Terminé',
        resolvedDate: '2026-07-29'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-28'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'Hamza BENNIS',
        date: '2026-07-28'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'M. Larbi (BATI-PRESTIGE)',
        date: '2026-07-28'
      }
    },
    createdAt: '2026-07-28T11:00:00.000Z',
    updatedAt: '2026-07-28T11:00:00.000Z'
  },
  {
    id: 'pv_001_karim',
    number: 'PV-001-VK',
    projectId: 'prj_villa_karim',
    date: '2026-07-28',
    time: '09:30',
    weather: 'Ensoleillé',
    overallProgress: 40,
    nextMeetingDate: '2026-08-12',
    nextMeetingTime: '10:00',
    generalNotes: 'Visite de chantier pour la validation du coulage du dallage et l\'implantation des réseaux électriques sous daille de la Villa Karim.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'Karim ALAMI', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent' },
      { id: 'p3', name: 'M. Karim', role: 'Conducteur de Travaux', organization: 'BATI-CONCEPT SARL', status: 'Présent', phone: '06 61 11 22 33' },
      { id: 'p4', name: 'M. Reda', role: 'Ingénieur Électricien', organization: 'DOMO-TECH', status: 'Présent', phone: '06 62 44 55 66' }
    ],
    observations: [
      {
        id: 'obs_vk_1',
        number: 1,
        lot: 'Gros Œuvre & Fondations',
        location: 'Patio Central - Villa Karim',
        text: 'L\'arrosage continu de la dalle béton du patio doit être maintenu pendant 48 heures pour éviter les fissures de retrait.',
        assignedTo: 'BATI-CONCEPT SARL',
        dueDate: '2026-07-30',
        status: 'Urgent'
      },
      {
        id: 'obs_vk_2',
        number: 2,
        lot: 'Menuiserie Aluminium & Vitrage',
        location: 'Séjour - Baie Vitrée Galandage',
        text: 'Réservation du faux-seuil encastré pour la grande baie vitrée à vérifier avec le métreur ALU-DESIGN.',
        assignedTo: 'ALU-DESIGN',
        dueDate: '2026-08-04',
        status: 'À faire'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-28'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'Karim ALAMI',
        date: '2026-07-28'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'M. Karim (BATI-CONCEPT)',
        date: '2026-07-28'
      }
    },
    createdAt: '2026-07-28T09:30:00.000Z',
    updatedAt: '2026-07-28T09:30:00.000Z'
  },
  {
    id: 'pv_001_claude',
    number: 'PV-001-IC',
    projectId: 'prj_immeuble_claude',
    date: '2026-07-27',
    time: '14:30',
    weather: 'Nuageux',
    overallProgress: 68,
    nextMeetingDate: '2026-08-10',
    nextMeetingTime: '15:00',
    generalNotes: 'Inspection de la pose des châssis aluminium au 3ème et 4ème étages de l\'Immeuble Claude, et contrôle d\'étanchéité de la terrasse R+5.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'Claude DUPONT', role: 'Maître d\'Ouvrage', organization: 'SCI CLAUDE', status: 'Présent' },
      { id: 'p3', name: 'M. Mehdi', role: 'Ingénieur', organization: 'OTIS MAROC', status: 'Présent' },
      { id: 'p4', name: 'M. Tariq', role: 'Responsable Étanchéité', organization: 'ISOL-ETANCHE', status: 'Présent' }
    ],
    observations: [
      {
        id: 'obs_ic_1',
        number: 1,
        lot: 'Étanchéité & Isolation',
        location: 'Toiture Terrasse R+5 - Immeuble Claude',
        text: 'Mise en eau de la terrasse technique réalisée sur 48h. Aucune infiltration détectée sous la dalle, mise en œuvre de la protection lourde autorisée.',
        assignedTo: 'ISOL-ETANCHE',
        dueDate: '2026-08-02',
        status: 'Terminé',
        resolvedDate: '2026-07-28'
      },
      {
        id: 'obs_ic_2',
        number: 2,
        lot: 'Ascenseurs & Équipements',
        location: 'Gaine Ascenseur - Du Sous-sol au R+5',
        text: 'Livraison du moteur et des guides d\'ascenseur programmée. Sécuriser la porte de la gaine à tous les niveaux avec barrières de sécurité.',
        assignedTo: 'OTIS MAROC',
        dueDate: '2026-08-08',
        status: 'Urgent'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-27'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'Claude DUPONT',
        date: '2026-07-27'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'SN-BATIMENT',
        date: '2026-07-27'
      }
    },
    createdAt: '2026-07-27T14:30:00.000Z',
    updatedAt: '2026-07-27T14:30:00.000Z'
  },
  {
    id: 'pv_001_galile',
    number: 'PV-001-IG',
    projectId: 'prj_immeuble_galile',
    date: '2026-07-29',
    time: '10:00',
    weather: 'Ensoleillé',
    overallProgress: 50,
    nextMeetingDate: '2026-08-12',
    nextMeetingTime: '10:30',
    generalNotes: 'Visite de chantier et réunion de coordination sur l\'avancement du montage de la structure métallique et de la façade mur-rideau de l\'Immeuble Galilée.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'M. Samir', role: 'Directeur de Projet', organization: 'GALILÉE CONSTRUCTION', status: 'Présent', phone: '06 61 88 99 00' },
      { id: 'p3', name: 'M. Nabil', role: 'Ingénieur Façade', organization: 'GLASS-TECH MAROC', status: 'Présent', phone: '06 62 33 44 55' },
      { id: 'p4', name: 'M. Adil', role: 'Responsable CVC', organization: 'THERMO-AIR', status: 'Présent', phone: '06 63 22 11 00' }
    ],
    observations: [
      {
        id: 'obs_ig_1',
        number: 1,
        lot: 'Façade Mur-Rideau & Vitrage',
        location: 'Façade Principale - Niveaux R+2 et R+3',
        text: 'Ajustement de l\'alignement des profilés aluminium pour les vitrages thermiques double vitrage. Validation des cales de dilatation.',
        assignedTo: 'GLASS-TECH MAROC',
        dueDate: '2026-08-05',
        status: 'Urgent'
      },
      {
        id: 'obs_ig_2',
        number: 2,
        lot: 'Gros Œuvre & Génie Civil',
        location: '2ème Sous-Sol - Parking & Locaux Techniques',
        text: 'Nettoyage des résidus de coffrage et application de la peinture époxy au sol dans la zone de stationnement PMR.',
        assignedTo: 'GALILÉE CONSTRUCTION',
        dueDate: '2026-08-08',
        status: 'À faire'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-29'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'GROUPE GALILÉE IMMOBILIER',
        date: '2026-07-29'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'GALILÉE CONSTRUCTION',
        date: '2026-07-29'
      }
    },
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-07-29T10:00:00.000Z'
  },
  {
    id: 'pv_001_bennouna',
    number: 'PV-001-VB',
    projectId: 'prj_villa_bennouna',
    date: '2026-07-29',
    time: '11:30',
    weather: 'Ensoleillé',
    overallProgress: 45,
    nextMeetingDate: '2026-08-12',
    nextMeetingTime: '11:00',
    generalNotes: 'Suivi des travaux de maçonnerie et préparation du coulage de la dalle supérieure de la Villa Bennouna.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'M. Bennouna', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent' },
      { id: 'p3', name: 'M. Driss', role: 'Conducteur de Travaux', organization: 'NORD CONSTRUCTION', status: 'Présent', phone: '06 61 22 33 44' }
    ],
    observations: [
      {
        id: 'obs_vb_1',
        number: 1,
        lot: 'Gros Œuvre & Béton Armé',
        location: 'Sous-sol & Rez-de-Chaussée - Villa Bennouna',
        text: 'Vérification de la pose de l\'armature du voile périphérique. Prévoir le calage du ferraillage avant coulage.',
        assignedTo: 'NORD CONSTRUCTION',
        dueDate: '2026-08-02',
        status: 'Urgent'
      },
      {
        id: 'obs_vb_2',
        number: 2,
        lot: 'Menuiserie Aluminium & Vitrage',
        location: 'Séjour - Baie Vitrée Principale',
        text: 'Validation du dessin d\'exécution des précadres aluminium pour les baies coulissantes à galandage.',
        assignedTo: 'ALU-PRESTIGE',
        dueDate: '2026-08-06',
        status: 'À faire'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-29'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'M. BENNOUNA',
        date: '2026-07-29'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'NORD CONSTRUCTION',
        date: '2026-07-29'
      }
    },
    createdAt: '2026-07-29T11:30:00.000Z',
    updatedAt: '2026-07-29T11:30:00.000Z'
  },
  {
    id: 'pv_001_messouadi',
    number: 'PV-001-VM',
    projectId: 'prj_villa_messouadi',
    date: '2026-07-28',
    time: '16:00',
    weather: 'Ensoleillé',
    overallProgress: 60,
    nextMeetingDate: '2026-08-11',
    nextMeetingTime: '16:00',
    generalNotes: 'Inspection des travaux d\'étanchéité de la terrasse et pose du calepinage des zelliges du patio de la Villa Messouadi.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'M. MESSOUADI', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent' },
      { id: 'p3', name: 'M. Khalid', role: 'Responsable Étanchéité', organization: 'ISOL-SOUTH', status: 'Présent', phone: '06 65 44 55 66' },
      { id: 'p4', name: 'M. Hassan', role: 'Artisan Maître Zelligeur', organization: 'MARBRE & TRADITION', status: 'Présent', phone: '06 66 77 88 99' }
    ],
    observations: [
      {
        id: 'obs_vm_1',
        number: 1,
        lot: 'Étanchéité & Isolation',
        location: 'Toiture Terrasse Accessible - Villa Messouadi',
        text: 'Essai de mise en eau de la membrane bitumineuse de terrasse réussi. Poursuite des travaux de protection lourde.',
        assignedTo: 'ISOL-SOUTH',
        dueDate: '2026-08-01',
        status: 'Terminé',
        resolvedDate: '2026-07-29'
      },
      {
        id: 'obs_vm_2',
        number: 2,
        lot: 'Revêtements & Marbre',
        location: 'Patio Central & Fontaine',
        text: 'Validation du prototype de calepinage des zelliges traditionnels faits main pour les arcades du patio.',
        assignedTo: 'MARBRE & TRADITION',
        dueDate: '2026-08-04',
        status: 'En cours'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-28'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'M. MESSOUADI',
        date: '2026-07-28'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'ATLAS BÂTIMENT SARL',
        date: '2026-07-28'
      }
    },
    createdAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z'
  },
  {
    id: 'pv_001_salwa_belhachmi',
    number: 'PV-001-SB',
    projectId: 'prj_salwa_belhachmi',
    date: '2026-07-29',
    time: '14:00',
    weather: 'Ensoleillé',
    overallProgress: 50,
    nextMeetingDate: '2026-08-12',
    nextMeetingTime: '14:00',
    generalNotes: 'Contrôle des saignées et encastrements de plomberie et électricité pour la Villa Salwa Belhachmi.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'Salwa BELHACHMI', role: 'Maître d\'Ouvrage', organization: 'Client Particulier', status: 'Présent', email: 'salwa.belhachmi@gmail.com' },
      { id: 'p3', name: 'M. Youssef', role: 'Chef Plombier', organization: 'HYDRO-FLUIDES', status: 'Présent', phone: '06 68 33 44 55' }
    ],
    observations: [
      {
        id: 'obs_sb_1',
        number: 1,
        lot: 'Plomberie & Sanitaires',
        location: 'Salle de Bain Suite Principale - Villa Salwa',
        text: 'Changement de position du bâti-support WC suspendu selon le nouveau plan d\'agencement Sanitaires V2.',
        assignedTo: 'HYDRO-FLUIDES',
        dueDate: '2026-08-03',
        status: 'Urgent'
      },
      {
        id: 'obs_sb_2',
        number: 2,
        lot: 'Peinture & Décoration',
        location: 'Façade Extérieure & Murs de Clôture',
        text: 'Application d\'un échantillon d\'enduit à la chaux teinté dans la masse pour validation par le Maître d\'Ouvrage.',
        assignedTo: 'DECO-LINE',
        dueDate: '2026-08-07',
        status: 'À faire'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-29'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'Salwa BELHACHMI',
        date: '2026-07-29'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'PRO-BÂTI CASABLANCA',
        date: '2026-07-29'
      }
    },
    createdAt: '2026-07-29T14:00:00.000Z',
    updatedAt: '2026-07-29T14:00:00.000Z'
  },
  {
    id: 'pv_001_cpc',
    number: 'PV-001-CPC',
    projectId: 'prj_cpc',
    date: '2026-07-29',
    time: '15:30',
    weather: 'Venteux',
    overallProgress: 35,
    nextMeetingDate: '2026-08-12',
    nextMeetingTime: '15:30',
    generalNotes: 'Réunion de démarrage du levage de la charpente métallique du Projet CPC Tit Mellil.',
    participants: [
      { id: 'p1', name: 'Abdelali Miman', role: 'Architecte / Maître d\'Œuvre', organization: 'ARCHITEXPERT', status: 'Présent', email: 'mimanabdelali@gmail.com', phone: '06 75 50 89 07' },
      { id: 'p2', name: 'M. Bennis', role: 'Représentant CPC', organization: 'SOCIÉTÉ CPC MAROC', status: 'Présent', phone: '06 70 99 88 77' },
      { id: 'p3', name: 'M. Amine', role: 'Conducteur de Travaux', organization: 'CPC CONSTRUCTION', status: 'Présent' }
    ],
    observations: [
      {
        id: 'obs_cpc_1',
        number: 1,
        lot: 'Génie Civil & Charpente Métallique',
        location: 'Zone Entrepôt principal - Projet CPC',
        text: 'Contrôle du serrage des boulons Haute Résistance (HR) sur la ferme n°3. PV de contrôle de serrage à fournir par le bureau de contrôle.',
        assignedTo: 'CPC CONSTRUCTION',
        dueDate: '2026-08-04',
        status: 'Urgent'
      },
      {
        id: 'obs_cpc_2',
        number: 2,
        lot: 'CVC & Extraction Industrielle',
        location: 'Zone Showroom & Bureaux R+1',
        text: 'Réservation des trémies de passage pour les gaines d\'air fraîches en façade Nord à repérer sur les plans d\'exécution.',
        assignedTo: 'AIR-PRO INDUSTRIE',
        dueDate: '2026-08-08',
        status: 'À faire'
      }
    ],
    signatures: {
      architect: {
        roleName: "L'Architecte / Maître d'Œuvre",
        signerName: 'Abdelali Miman',
        date: '2026-07-29'
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: 'CPC MAROC',
        date: '2026-07-29'
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: 'CPC CONSTRUCTION',
        date: '2026-07-29'
      }
    },
    createdAt: '2026-07-29T15:30:00.000Z',
    updatedAt: '2026-07-29T15:30:00.000Z'
  }
];
