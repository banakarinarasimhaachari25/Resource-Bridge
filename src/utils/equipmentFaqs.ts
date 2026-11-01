import { EquipmentFAQ, FAQCategory, ResourceItem } from '../types';

export interface FAQCategoryMeta {
  key: FAQCategory | 'all';
  label: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const FAQ_CATEGORIES: FAQCategoryMeta[] = [
  {
    key: 'all',
    label: 'All Questions',
    description: 'Complete operational, safety, and care guidelines for this equipment',
    color: '#6F4E37',
    badgeBg: '#F7E7CE',
    badgeText: '#6F4E37',
    borderColor: '#D8C3A5'
  },
  {
    key: 'usage',
    label: 'Usage & Protocols',
    description: 'Operational setup, supported formats, calibration, and step-by-step procedures',
    color: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    borderColor: '#BFDBFE'
  },
  {
    key: 'safety',
    label: 'Safety & PPE',
    description: 'Mandatory protective gear, hazardous materials, interlocks, and emergency cutoff',
    color: '#DC2626',
    badgeBg: '#FEF2F2',
    badgeText: '#991B1B',
    borderColor: '#FECACA'
  },
  {
    key: 'maintenance',
    label: 'Maintenance & Care',
    description: 'Pre/post-session cleaning, optical/mechanical inspection, and consumable restock',
    color: '#059669',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    borderColor: '#A7F3D0'
  },
  {
    key: 'booking',
    label: 'Access & Check-In',
    description: 'Borrower prerequisites, grace periods, key checkout, and return condition',
    color: '#D97706',
    badgeBg: '#FFFBEB',
    badgeText: '#92400E',
    borderColor: '#FDE68A'
  }
];

/**
 * Returns tailored FAQs for any given ResourceItem.
 * Matches specific equipment first, then category heuristics, and includes standard institutional policies.
 */
export function getEquipmentFAQs(resource: ResourceItem): EquipmentFAQ[] {
  const custom = resource.faqs || [];
  if (custom.length > 0) {
    return custom;
  }

  const generated: EquipmentFAQ[] = [];
  const titleLower = resource.title.toLowerCase();
  const descLower = resource.description.toLowerCase();
  const cat = resource.category;

  // --- Specific Resource Tailoring ---

  if (resource.id === 'res-3d-printer-01' || titleLower.includes('sls') || titleLower.includes('fuse 1')) {
    generated.push(
      {
        id: 'faq-sls-usage-1',
        category: 'usage',
        question: 'What file formats and geometry tolerances are required for the SLS Fuse 1+?',
        answer: 'Export solid watertight 3D models in STL, OBJ, or 3MF format at 1:1 millimeter scale. Minimum feature wall thickness should be >= 1.2 mm (1.5 mm recommended for structural rigidity). Load your file into Formlabs PreForm SLS software to inspect powder packing density.',
        importantNote: 'Always orient small intricate apertures facing upward to prevent powder trapping during sintering.',
        steps: [
          'Export your model with unit scale set to millimeters (no non-manifold edges).',
          'Import into PreForm (Fuse 1 profile) and verify build height within 165 × 165 × 300 mm.',
          'Check bounding packing ratio (target between 8% and 14% for optimal powder efficiency).',
          'Send file to print queue after custodian authorization.'
        ],
        tags: ['file formats', 'stl', 'preform', 'tolerances', 'sintering']
      },
      {
        id: 'faq-sls-usage-2',
        category: 'usage',
        question: 'How long does chamber warm-up take and does it count against reservation time?',
        answer: 'The Fuse 1+ requires an automated 45-minute heating cycle to raise the build chamber to 170°C before the laser sinters the first layer. Plan your booking slot to account for this warm-up time plus the cool-down buffer.',
        importantNote: 'Never attempt to open the chamber door while the status displays "Pre-heating" or "Sintering".',
        tags: ['preheating', 'warm up', 'temperature', 'reservation']
      },
      {
        id: 'faq-sls-safety-1',
        category: 'safety',
        question: 'What mandatory PPE must be worn when handling un-sintered Nylon powder?',
        answer: 'Nylon 11/12 particulate is respirable (<100 microns). You MUST wear a NIOSH-approved N95 or P100 particulate half-face respirator, snug-fitting safety goggles, and nitrile gloves at all times around the Fuse Sift station.',
        importantNote: 'Contact lens wearers must wear sealed splash/dust goggles in the FabLab powder processing area.',
        steps: [
          'Put on respirator and perform positive/negative seal check before opening powder containers.',
          'Put on safety goggles and powder-free nitrile gloves.',
          'Verify that the HEPA downdraft hood on the Fuse Sift station is turned on.'
        ],
        tags: ['ppe', 'respirator', 'powder safety', 'goggles', 'nylon']
      },
      {
        id: 'faq-sls-safety-2',
        category: 'safety',
        question: 'What is the laser safety rating and emergency shutdown procedure?',
        answer: 'The system houses an internal Class 4 fiber laser (1064nm, 30W), fully enclosed in Class 1 interlocked housing. If you notice any optical malfunction, smoke, or sensor alarm, immediately press the red Emergency Stop mushroom switch located to the right of the touch screen.',
        importantNote: 'Do not attempt to bypass door interlocks. Opening the door during active sintering automatically cuts laser power and ruins the print cake.',
        tags: ['laser safety', 'class 4', 'emergency stop', 'interlock']
      },
      {
        id: 'faq-sls-maint-1',
        category: 'maintenance',
        question: 'What cleaning and powder sifting protocol is required after part extraction?',
        answer: 'After transferring the cooled build chamber into the Fuse Sift, execute the 70/30 fresh-to-recycled powder sifting cycle. Use the dedicated anti-static vacuum with HEPA filter to clean all powder stray from the staging platform and sill.',
        importantNote: 'Standard industrial shop-vacs must NEVER be used due to combustible static dust explosion hazard; use only the certified ESD HEPA vacuum.',
        steps: [
          'Transfer completed build chamber to Fuse Sift station.',
          'Engage the automated sifter screen and collect reclaimed powder into the hopper.',
          'Vacuum the chamber perimeter and work table using the grounded anti-static HEPA vacuum.',
          'Wipe the optical IR sensor glass with the supplied lens tissue and 99% isopropanol.'
        ],
        tags: ['cleaning', 'fuse sift', 'powder recycling', 'hepa vacuum', 'maintenance']
      },
      {
        id: 'faq-sls-maint-2',
        category: 'maintenance',
        question: 'Are materials and fresh powder refills included in the booking rate?',
        answer: 'Yes, the $28/hr rate includes standard Nylon 12 powder consumables. If the powder level indicator in the dosing hopper drops below 20%, notify Prof. Marcus Vance or the on-duty student proctor to dispense an authenticated refill bottle.',
        tags: ['consumables', 'powder restock', 'billing', 'materials']
      }
    );
  } else if (resource.id === 'res-oscilloscope-02' || titleLower.includes('oscilloscope')) {
    generated.push(
      {
        id: 'faq-osc-usage-1',
        category: 'usage',
        question: 'How do I perform a self-calibration and probe compensation before measurements?',
        answer: 'Disconnect all probe leads and cables from input channels BNC 1–4. Power on the oscilloscope and let it warm up for 15 minutes. Navigate to Utility > Self-Cal to calibrate ADC zero offsets. For probe compensation, connect the 10:1 probe to the 1kHz square-wave calibration terminal on the front panel and adjust the probe trimmer until the square wave is flat.',
        steps: [
          'Allow 15 minutes warm-up time for thermal stabilization.',
          'Disconnect all inputs and run Utility -> Self-Cal.',
          'Connect probe to CAL terminal and adjust trimming capacitor using non-conductive screwdriver until corners are sharp and non-overshooting.'
        ],
        tags: ['calibration', 'probe compensation', 'trimmer', 'warm-up']
      },
      {
        id: 'faq-osc-usage-2',
        category: 'usage',
        question: 'Can I export captured waveforms and raw CSV data to an external drive?',
        answer: 'Yes. Insert a standard FAT32-formatted USB thumb drive into the front USB port. Press the Storage button, select File Type as CSV (for mathematical processing in MATLAB/Python) or PNG (for lab reports), and press Save to write the buffer.',
        tags: ['data export', 'usb', 'csv', 'waveform math', 'matlab']
      },
      {
        id: 'faq-osc-safety-1',
        category: 'safety',
        question: 'What is the danger of connecting oscilloscope ground clips to live circuits?',
        answer: 'CRITICAL: The outer ring and alligator ground clip of all standard BNC probe inputs are tied directly to Mains Earth Ground. Connecting the ground clip to any floating voltage node or live AC hot leg will create a direct dead short through the oscilloscope chassis, tripping lab breakers and potentially vaporizing the probe.',
        importantNote: 'Always connect ground clips only to circuit 0V/GND. If floating differential measurements are required, request an isolated differential probe from the custodian.',
        tags: ['grounding', 'short circuit', 'mains earth', 'safety', 'high voltage']
      },
      {
        id: 'faq-osc-safety-2',
        category: 'safety',
        question: 'What is the maximum rated input voltage for standard probes?',
        answer: 'Standard 10:1 passive probes are rated for a maximum of 300 Vrms CAT I. Direct 1:1 coax inputs are limited to 30 Vrms. Exceeding this rating will destroy the input attenuator FETs.',
        tags: ['voltage rating', 'cat 1', 'attenuator']
      },
      {
        id: 'faq-osc-maint-1',
        category: 'maintenance',
        question: 'How must probes and accessories be inspected and packed upon return?',
        answer: 'Verify all 4 probe cables are undamaged and smoothly coiled (no tight bends <3 inch radius). Ensure all 4 alligator ground leads, 4 sprung hook tips, and color-coded identification rings are returned into the Rigol zippered accessory pouch.',
        steps: [
          'Disconnect probes and inspect cable insulation for cuts or crimps.',
          'Check that spring hook tips retract cleanly.',
          'Pack accessories into pouch and turn off main power switch.'
        ],
        tags: ['probes', 'cable care', 'accessories', 'return condition']
      }
    );
  } else if (resource.id === 'res-robotics-03' || titleLower.includes('robot') || titleLower.includes('ur5e')) {
    generated.push(
      {
        id: 'faq-robot-usage-1',
        category: 'usage',
        question: 'How do I initialize the UR5e arm and calibrate the Robotiq 2F-85 gripper?',
        answer: 'Power on the robot via the Teach Pendant. Release the joint brakes by selecting "Auto Initialize" from PolyScope. Once the state changes to "Normal (Running)", execute the Gripper Activation script from the URLog template to find the zero-reference touch limits.',
        steps: [
          'Turn on controller and wait for PolyScope OS boot.',
          'Tap "Initialize Robot" -> "Auto Brake Release" while observing arm joints.',
          'Verify teach pendant communication and calibrate gripper stroke.'
        ],
        tags: ['ur5e', 'gripper', 'polyscope', 'teach pendant', 'initialization']
      },
      {
        id: 'faq-robot-safety-1',
        category: 'safety',
        question: 'Where must the Emergency Stop pendant be positioned during operation?',
        answer: 'The physical Emergency Stop (E-Stop) push-button on the 3-position teach pendant must remain in the operator hands or within immediate arm reach (<0.5m) at all times while the robot is powered and armed.',
        importantNote: 'If anyone approaches within the 1-meter floor boundary, press the E-stop immediately.',
        tags: ['emergency stop', 'e-stop', 'safety zone', 'collision']
      },
      {
        id: 'faq-robot-safety-2',
        category: 'safety',
        question: 'What should I do if a joint collision or singular position fault occurs?',
        answer: 'Do not forcefully push or pull the arm joints manually! Press Emergency Stop, then tap "Freedrive" mode while supporting the end-effector with two hands to jog the arm gently away from the collision obstacle.',
        tags: ['collision fault', 'singularity', 'freedrive']
      },
      {
        id: 'faq-robot-maint-1',
        category: 'maintenance',
        question: 'What is the parking pose and end-of-session maintenance procedure?',
        answer: 'Before shutting down, jog the robot to the marked "Home Parking Pose" (elbow bent at 90°, gripper facing downwards inside work cell bounds). Wipe gripper silicone pads with 70% isopropanol, power down controller, and neatly stow the pendant on its magnetic cradle.',
        tags: ['parking pose', 'stowage', 'cleaning', 'gripper care']
      }
    );
  } else if (resource.id === 'res-workstation-04' || titleLower.includes('deep learning') || titleLower.includes('rtx 4090')) {
    generated.push(
      {
        id: 'faq-gpu-usage-1',
        category: 'usage',
        question: 'How do I SSH into the workstation and select between the two RTX 4090 GPUs?',
        answer: 'Connect via institutional SSH: `ssh researcher@10.20.44.18 -p 2222`. In your Python script or shell, specify GPU visibility with `export CUDA_VISIBLE_DEVICES=0,1` or pass `--devices 0` in PyTorch DistributedDataParallel (DDP).',
        steps: [
          'Verify your institutional IP or connect via university research VPN.',
          'Run `nvidia-smi` to view current VRAM utilization and temperature.',
          'Launch training jobs inside virtual environments (`venv`) or Docker containers.'
        ],
        tags: ['ssh', 'cuda', 'pytorch', 'multi-gpu', 'docker']
      },
      {
        id: 'faq-gpu-safety-1',
        category: 'safety',
        question: 'What thermal monitoring rules apply during long training epochs?',
        answer: 'GPU temperatures must not exceed 82°C and junction hotspot temperatures must remain below 95°C. A background daemon monitors thermals; if temperatures exceed thresholds for >2 minutes, jobs will be throttled automatically to preserve hardware lifetime.',
        importantNote: 'Never block the workstation intake or exhaust vents with backpacks or lab equipment.',
        tags: ['thermal limits', 'temperatures', 'airflow', 'monitoring']
      },
      {
        id: 'faq-gpu-maint-1',
        category: 'maintenance',
        question: 'What is the disk cleanup policy on the 4TB NVMe scratch storage?',
        answer: 'The `/scratch/` volume is a high-speed temporary buffer. All datasets and model checkpoints must be synchronized to your cloud bucket or departmental NAS at the conclusion of your session. Files inactive for >7 days are purged automatically.',
        tags: ['scratch disk', 'storage cleanup', 'checkpoints', 'purging']
      }
    );
  }

  // --- Category-based general questions if not already covered ---

  // Usage questions based on rules & supervision
  if (!generated.some(q => q.category === 'usage')) {
    generated.push({
      id: `faq-cat-usage-${resource.id}`,
      category: 'usage',
      question: `What are the general operating steps and prerequisites for ${resource.title}?`,
      answer: `Borrowers must have completed the prerequisite departmental safety trainings (${
        resource.eligibility_rules.required_training && resource.eligibility_rules.required_training.length > 0
          ? resource.eligibility_rules.required_training.join(', ')
          : 'Standard Laboratory Orientation'
      }). Review the user manual stored in Room ${resource.room} before operating controls.`,
      importantNote: resource.supervision_required
        ? 'Staff supervision is required for this equipment. Coordinate with the lab attendant prior to starting your session.'
        : 'Self-service operation is permitted for certified researchers.',
      steps: [
        `Check in with your digital pass at ${resource.building}, Room ${resource.room}.`,
        'Perform a visual pre-operation check for damage or loose components.',
        'Operate strictly within specified manufacturer tolerances.'
      ],
      tags: ['operating protocols', 'prerequisites', 'supervision']
    });
  }

  // Safety questions based on rules
  if (!generated.some(q => q.category === 'safety')) {
    generated.push({
      id: `faq-cat-safety-${resource.id}`,
      category: 'safety',
      question: `What protective equipment (PPE) and safety rules must be followed?`,
      answer: `All operators must wear closed-toe shoes, lab coats, and safety eyewear. Specific rules for this equipment include:\n${
        resource.rules.length > 0
          ? resource.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')
          : 'Follow campus Environmental Health & Safety (EHS) standard operating procedures.'
      }`,
      importantNote: 'In case of any emergency, electrical hazard, or equipment defect, immediately halt operation and notify lab staff.',
      tags: ['ppe', 'lab safety', 'rules', 'ehs']
    });
  }

  // Maintenance questions
  if (!generated.some(q => q.category === 'maintenance')) {
    generated.push({
      id: `faq-cat-maint-${resource.id}`,
      category: 'maintenance',
      question: `What post-use maintenance and cleaning is required before returning?`,
      answer: `Borrowers are responsible for returning the equipment in pristine condition: wipe down touch surfaces with 70% isopropyl alcohol, disconnect power if designated, stow all accessories, and verify no personal research samples or consumables are left behind.`,
      steps: [
        'Power down system following official shutdown sequence.',
        'Clean work area and sanitize contact points.',
        'Log completion in the station digital checkout registry.'
      ],
      tags: ['cleaning', 'maintenance', 'sanitization', 'return condition']
    });
  }

  // Booking & Check-In questions
  generated.push({
    id: `faq-cat-booking-${resource.id}`,
    category: 'booking',
    question: `What happens if I arrive late or need to extend my reservation?`,
    answer: `Reservations are held for a 15-minute grace period from the scheduled start time. If you do not check in within 15 minutes, the slot may be released to researchers on the Fair Access Waitlist. To extend your slot, submit a request via the dashboard subject to schedule availability (maximum duration: ${resource.max_duration_hours} hours).`,
    importantNote: `Current billing rate is ${resource.cost_per_hour === 0 ? 'Free ($0.00/hr)' : `$${resource.cost_per_hour}/hr`}. Billing commences from scheduled start time.`,
    tags: ['booking', 'grace period', 'waitlist', 'extensions', 'billing']
  });

  generated.push({
    id: `faq-cat-incident-${resource.id}`,
    category: 'safety',
    question: 'How do I report an equipment fault, error code, or broken component?',
    answer: 'Do not attempt unapproved repairs! Submit an Incident Report immediately via the ResourceBridge Incident tab or inform the custodian directly. Document the exact error message or photos of the issue so maintenance technicians can service the unit.',
    tags: ['incident report', 'faults', 'repairs', 'custodian']
  });

  return generated;
}

/**
 * Filter FAQs by text query and category pill.
 */
export function filterEquipmentFAQs(
  faqs: EquipmentFAQ[],
  query: string,
  category: FAQCategory | 'all'
): EquipmentFAQ[] {
  let result = faqs;

  if (category !== 'all') {
    result = result.filter(faq => faq.category === category);
  }

  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery) {
    result = result.filter(faq => {
      const qMatch = faq.question.toLowerCase().includes(cleanQuery);
      const aMatch = faq.answer.toLowerCase().includes(cleanQuery);
      const noteMatch = faq.importantNote?.toLowerCase().includes(cleanQuery);
      const stepMatch = faq.steps?.some(s => s.toLowerCase().includes(cleanQuery));
      const tagMatch = faq.tags?.some(t => t.toLowerCase().includes(cleanQuery));
      return qMatch || aMatch || Boolean(noteMatch) || Boolean(stepMatch) || Boolean(tagMatch);
    });
  }

  return result;
}
