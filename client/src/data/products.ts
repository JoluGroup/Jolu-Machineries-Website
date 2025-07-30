import tractor1 from "@/assets/tractor-1.png";
import harvester1 from "@/assets/harvester-1.png";
import implements1 from "@/assets/implements-1.jpg";
import tractor2 from "@/assets/tractor-2.png";
import harvester2 from "@/assets/harvester-2.png";
import harvester3 from "@/assets/harvester-3.png";
import tractor3 from "@/assets/tractor-3.png";
import tractor4 from "@/assets/tractor-4.png";
import tractor5 from "@/assets/tractor-5.png";
import tractor6 from "@/assets/tractor-6.png";
import tractor7 from "@/assets/tractor-7.png";



export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  longDescription?: string;
  keySpecs?: { label: string; value: string }[];
  advantages?: string[];
  specTable?: {
    headers: string[];
    rows: string[][];
  };
  ctaHeadline?: string;
  ctaDescription?: string;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "zoomlion-rn904",
    name: "Zoomlion RN904/1104 Wheeled Tractor",
    description: "Heavy-duty tractor for large-scale farming.",
    image: tractor1,
    longDescription: "The Zoomlion RN904/1104 is a high-powered, four-wheel-drive wheeled tractor, suitable for both paddy and dry fields. Designed for intensive agricultural tasks with comfort and reliability.",
    keySpecs: [
      { label: "Horse Power", value: "90–110 hp" },
      { label: "Number of gears", value: "16F+8R" },
      { label: "Weight", value: "4300 kg" }
    ],
    advantages: [
      "Excellent fuel atomization and high-efficiency engine",
      "High-reliability imported friction clutch",
      "Stable operation with quality transmission and hydraulic oil",
      "Strong pressure lifter for composite machinery",
      "150L fuel tank for full-day operations",
      "Three hydraulic outputs for wide adaptability",
      "High-end plug-in parts and low-temperature battery",
      "4.3-inch smart digital instrument panel",
      "Luxury 4-pillar A/C cab with dust/noise insulation and adjustable seat"
    ],
    specTable: {
      headers: ["Model", "RN904Pro/RN1104Pro", "RN904/RN1104 (2025 New)"],
      rows: [
        ["Overall dimensions (L×W×H)", "4600×2095×2950 mm", "4600×2095×2950 mm"],
        ["Wheelbase", "2350 mm", "2350 mm"],
        ["Min. operating mass", "4300 kg", "4300 kg"],
        ["Calibration power", "67/81 kW", "67/81 kW"],
        ["Tire specification", "12.4-24 / 16.9-34", "12.4-24 / 16.9-34"],
        ["Number of gears", "16F + 8R", "12F + 12R"],
        ["Hydraulic output", "3 groups", "3 groups"],
        ["Max. pull force", "≥25", "50"],
        ["Tillage depth control method", "Position adjustment and floating control", "Draft control"]
      ]
    },
    ctaHeadline: "Interested in the Zoomlion RN904/1104?",
    ctaDescription: "Get expert advice, a free quote, or schedule a field demo. Our team is here to help."
  },
  {
    id: "2",
    slug: "zoomlion-zl120",
    name: "Zoomlion ZL120 Harvester",
    description: "High-performance combine harvester engineered for efficient, large-scale harvesting of rice and grains with minimal loss and maximum throughput.",
    image: harvester1,
    longDescription: "The ZL120 Combine Harvester is equipped with a turbocharged engine delivering high horsepower and low fuel consumption. Featuring 360-degree unloading, advanced threshing tech, and a large grain box, it's ideal for high-efficiency field work.",
    keySpecs: [
      { label: "Horse Power", value: "120 hp" },
      { label: "Cutting Width", value: "2360 mm" },
      { label: "Weight", value: "4080 kg" }
    ],
    advantages: [
      "Turbocharged engine with high horsepower and low fuel consumption",
      "8th generation threshing technology for thorough separation",
      "Double-layer vibrating screen with fan and re-shedding cleaner",
      "1800L grain box for increased capacity",
      "336-degree grain unloading cylinder for high efficiency",
      "Header and conveying reversal device for easy blockage clearing",
      "High-strength auger with long service life",
      "X-shaped reinforced chassis for high load and mobility",
      "Can be adapted for corn, sorghum and more crops"
    ],
    specTable: {
      headers: ["Parameter", "Specification"],
      rows: [
        ["Rated HP", "120 hp"],
        ["Rated Speed", "2400 r/min"],
        ["Gauge", "2360 mm"],
        ["Min. Ground Clearance", "350 mm"],
        ["Threshing Drum (Dia × Length)", "φ750×2200 mm"],
        ["Operation Productivity", "0.22–1.2 hm²/h"]
      ]
    },
    ctaHeadline: "Looking to harvest more in less time?",
    ctaDescription: "Request a quote or talk to a specialist about the Zoomlion ZL120 Combine Harvester."
  },
  {
    id: "3",
    slug: "implements-set",
    name: "Agricultural Implements Set",
    description: "Powerful Farm Implements",
    image: implements1,
    longDescription: "A curated set of essential agricultural implements designed to complement your tractors and boost farm productivity. Suitable for ploughing, spraying, cultivating, and harrowing.",
    keySpecs: [
      { label: "Compatibility", value: "80–200 HP Tractors" },
      { label: "Types Included", value: "Plough, Cultivator, Sprayer, Harrow" },
      { label: "Material Strength", value: "High-Grade Steel" }
    ],
    advantages: [
      "Heavy-duty disc plough for breaking up hard soil",
      "Rotary harrow for superior leveling",
      "Boom sprayer for efficient pesticide application",
      "Multi-purpose cultivator for seedbed prep"
    ],
    specTable: {
      headers: ["Implement", "Details"],
      rows: [
        ["Disc Plough", "3-disc, hardened steel"],
        ["Cultivator", "9-tine adjustable frame"],
        ["Rotary Harrow", "Heavy-duty blades, 1.8m width"],
        ["Boom Sprayer", "600L capacity, 10m reach"]
      ]
    },
    ctaHeadline: "Need Implements that Work as Hard as You Do?",
    ctaDescription: "Talk to us about compatible tools for your farm – get a personalized quote today."
  },
  {
  id: "4",
  slug: "zoomlion-pl2304",
  name: "Zoomlion PL2304 Wheeled Tractor",
  description: "World's top concept, features comfortable driving and smart operation.",
  image: tractor2,
  longDescription: "The PL2304 is a premium high-powered wheeled tractor designed with advanced technology and smart operation features. Compliant with European standards, it combines comfort, automation, and power for optimal field performance.",
  keySpecs: [
    { label: "Horse Power", value: "230 hp" },
    { label: "Number of gears", value: "40F+40R" },
    { label: "Weight", value: "8995 kg" }
  ],
  advantages: [
    "Comfortable driving with smart operation features",
    "Meets European technical and emission standards",
    "High pressure common rail high-end diesel engine",
    "40F+40R power shift gearbox with automatic shifting",
    "Power reversal gear shifting without clutch pedal",
    "Advanced power management system for different modes",
    "High torque reserve (33%) and PTO adaptability",
    "APS automatic shift, differential lock, 4WD, clutch switch",
    "Multi-disc hydraulic brake system",
    "All-electric hydraulic system with fault diagnosis",
    "Integrated armrest control and touch screen display",
    "Automatic PTO clutch with auto engagement/disengagement",
    "Closed Load Sensing, Variable Pump system",
    "Optional GPS navigation, driverless control, front PTO/suspension"
  ],
  specTable: {
    headers: ["Model", "PL2304"],
    rows: [
      ["Overall dimension (L×W × H)", "6231×2575×3400 mm"],
      ["Wheelbase", "3085 mm"],
      ["Min. operating mass", "8995 kg"],
      ["Ground clearance", "420 mm"],
      ["Engine emission", "National III"],
      ["Rated power", "169.5 kW"],
      ["Fuel consumption", "≤228 g/kW·h"],
      ["Clutch type", "Multi-disc wet"],
      ["Gearbox", "40F+40R"],
      ["Tyre size (front/rear)", "540/65R30 & 650/65R42 or 420/90R30 & 520/85R42"],
      ["Lifting system", "Split type"],
      ["Max lifting capacity", "90 kN"],
      ["Tillage control", "Hydraulic control"],
      ["Hydraulic output valve", "Three position electro-hydraulic proportional multi-way valve"],
      ["Hydraulic hitch", "Three-point rear suspension, Class III"],
      ["Output flow rate", "110/160 L/min"],
      ["Traction force", "≥74 kN"],
      ["PTO output", "540E/1000N/1000E; 1000 (front PTO)"],
      ["Cab", "Air-conditioned"]
    ]
  },
  ctaHeadline: "Interested in the Zoomlion PL2304?",
  ctaDescription: "Get expert advice, a free quote, or schedule a demo. Contact us now to learn more."
},
{
  id: "5",
  slug: "tf150-combine-harvester",
  name: "Zoomlion TF150 Combine Harvester",
  description: "300hp combine harvester with dual axial flow threshing and advanced cleaning system for large-scale multi-crop harvesting.",
  image: harvester2,
  longDescription: "The Zoomlion TF150 is a high-capacity combine harvester equipped with a 300hp Yuchai engine and a dual axial flow threshing and separation system. With advanced intelligent features like floating bridge control, electronic grain tank management, and precise torque distribution, it offers exceptional performance across varying terrains and crop types. Designed for power and productivity, it supports high-speed unloading, flexible header options, and reduced grain loss, making it a reliable choice for wheat, corn, soybeans, and more.",
  keySpecs: [
    { label: "Horse Power", value: "300 hp" },
    { label: "Grain Tank Capacity", value: "9000 L" },
    { label: "Weight", value: "12650 kg" }
  ],
  advantages: [
    "300hp National III Yuchai engine with Bosch high-pressure fuel system",
    "Double longitudinal axial flow threshing and separation technology",
    "Low wheat loss rate (<0.4%) and corn grain breakage rate (<1%)",
    "Floating bridge system minimizes feeding losses on 10° slopes",
    "Electronically controlled 9000L grain tank with 55L/s unloading speed",
    "High-frequency vibrating screen with 900MPa high-strength steel",
    "Time-sharing hydraulic four-wheel drive for adaptive terrain control",
    "Supports multiple header types for wheat, corn, and flexible crops",
    "Strong planetary gearbox and durable H-drive chassis for better passability",
    "Designed for long operating hours with 600L fuel tank and 3586mm wheelbase"
  ],
  specTable: {
    headers: ["Parameter", "Specification"],
    rows: [
      ["Rated HP", "300 hp"],
      ["Rated Speed", "2200 r/min"],
      ["Fuel Tank Capacity", "600 L"],
      ["Grain Tank Capacity", "9000 L"],
      ["Grain Unloading Speed", "55 L/s"],
      ["Threshing Rollers", "2 (Dual longitudinal axial flow)"],
      ["Roller Size", "Ф480×3180 mm"],
      ["Cleaning Area", "4.3 m²"],
      ["Wheelbase", "3586 mm"],
      ["Minimum Ground Clearance", "380 mm"]
    ]
  },
  ctaHeadline: "Harvest bigger, faster, and smarter with the TF150",
  ctaDescription: "Contact us today to learn how the Zoomlion TF150 can upgrade your harvest operations with unmatched power and efficiency."
},
{
  id: "6",
  slug: "zoomlion-pg2004",
  name: "Zoomlion PG2004 Wheeled Tractor",
  description: "Comfortable, intelligent wheeled tractor with advanced hydraulic and engine systems.",
  image: tractor3,
  longDescription: "The Zoomlion PG2004 is a high-powered wheeled tractor designed for intelligent operations, featuring a Power-Beyond system, advanced hydraulic controls, and a powerful turbocharged engine. Its modern gearbox and electro-hydraulic integration offer both comfort and high productivity in the field.",
  keySpecs: [
    { label: "Horse Power", value: "200 hp" },
    { label: "Number of gears", value: "48F+24R" },
    { label: "Weight", value: "7272 kg" }
  ],
  advantages: [
    "Brand-new design with intelligent operation",
    "Built with top global components and sensors",
    "Power-Beyond system for advanced hydraulic capabilities",
    "High-pressure common rail turbocharged engine",
    "48F+24R gearbox with inter-zone power shifting",
    "Power reversing without clutch pedal",
    "Advanced engine power management with 25% torque reserve",
    "Electro-hydraulic system with fault self-diagnosis",
    "Automatic PTO control for turning and implements",
    "Closed load sensing system for efficient operation",
    "Optional GPS navigation and unmanned driving"
  ],
  specTable: {
    headers: ["Model", "PG2004"],
    rows: [
      ["Overall dimension (L×W × H)", "5482×2317×3077 mm"],
      ["Wheelbase", "2858 mm"],
      ["Min. operating mass", "7272 kg"],
      ["Ground clearance", "410 mm"],
      ["Engine emission", "National III"],
      ["Rated power", "147.5 kW"],
      ["Clutch type", "Multi plate wet"],
      ["Gearbox", "48F+24R"],
      ["Tyre size (front/rear)", "420/85R30 & 520/85R42 or 540/65R28 & 650/65R38"],
      ["Lifting system", "Split type"],
      ["Max lifting capacity", "≥90 kN"],
      ["Tillage control", "Electrohydraulic control"],
      ["Hydraulic output valve", "Three position electro-hydraulic proportional multi-way valve"],
      ["Hydraulic hitch", "Three-point rear suspension, Class III"],
      ["Output flow rate", "160 L/min"],
      ["Traction force", "≥70 kN"],
      ["PTO output", "540/1000 rpm"],
      ["Cab", "Air-conditioned"]
    ]
  },
  ctaHeadline: "Need serious power and comfort?",
  ctaDescription: "Get a quote or speak with our product team about the Zoomlion PG2004 today."
},
{
  id: "7",
  slug: "zoomlion-rd504",
  name: "Zoomlion RD504 Wheeled Tractor",
  description: "Compact and agile tractor designed for small plots and paddy fields.",
  image: tractor4,
  longDescription: "The Zoomlion RD504 is a compact and versatile tractor engineered for tight turns and high efficiency on small plots, greenhouses, and paddy fields. With strong lifting capabilities and a reliable Quanchai engine, it delivers outstanding performance in lightweight field operations and transportation.",
  keySpecs: [
    { label: "Horse Power", value: "50 hp" },
    { label: "Number of gears", value: "8F+8R" },
    { label: "Weight", value: "1900 kg" }
  ],
  advantages: [
    "Short wheelbase with shuttle shift for flexible operation",
    "Strong hydraulic lifting power with dual output valves",
    "Oversized 53L fuel tank for extended operation time",
    "Reliable Quanchai engine with high torque reserve",
    "9.5-inch dual-action dry clutch for reduced effort and high reliability",
    "Imported gearbox seals for enhanced waterproofing",
    "Streamlined, rust-proof, and durable SMC body design",
    "Adjustable rear wheel track for different operational needs",
    "Flat, shock-absorbing floor for improved comfort",
    "Versatile and cost-effective for field work and transport"
  ],
  specTable: {
    headers: ["Model", "RD504"],
    rows: [
      ["Overall dimension (L×W×H)", "3654×1362×2620 mm"],
      ["Wheelbase", "1790 mm"],
      ["Weight", "1900 kg"],
      ["Ground clearance", "420 mm"],
      ["Engine emission", "National II"],
      ["Rated power", "36.8 kW"],
      ["Gearbox", "8F+8R"],
      ["Tyre size (front/rear)", "8.3-20 / 12.4-28 or 8-18 / 13.6-26"],
      ["Max lifting capacity", "1236 kg"],
      ["PTO output power", "30 kW"],
      ["PTO speed", "540/720 rpm"],
      ["Cab", "Safety shelf"]
    ]
  },
  ctaHeadline: "Looking for a compact, capable tractor?",
  ctaDescription: "Request a quote or contact our team to learn more about the Zoomlion RD504 and how it fits your farm."
},
{
  id: "8",
  slug: "zl105-combine-harvester",
  name: "Zoomlion ZL105 Combine Harvester",
  description: "105hp combine harvester with upgraded threshing and smart control for efficient, high-performance field operations.",
  image: harvester3,
  longDescription: "The Zoomlion ZL105 is a compact yet powerful combine harvester equipped with a 105hp engine and a newly upgraded threshing system. Designed for efficiency, reliability, and ease of use, it features a 6kg/s feeding capacity, 660–1800L grain tank options, and a new Smart Edition for automatic power output control. With enhanced cleaning systems, simplified electric controls, and a high-clearance U-shaped chassis, the ZL105 is ideal for diverse terrain and mid-scale farming operations.",
  keySpecs: [
    { label: "Horse Power", value: "105 hp" },
    { label: "Cutting Width", value: "2360 mm" },
    { label: "Weight", value: "3950 kg" }
  ],
  advantages: [
    "Newly upgraded threshing system with improved cleanliness and reduced vibration",
    "6.0 kg/s feeding capacity for faster harvesting",
    "Smart Edition option with automatic power output control to save fuel",
    "Electric handle control for both header and grain unloading simplifies operation",
    "Upgraded cleaning system with 8-blade fan for 30% higher wind speed uniformity",
    "Transparent oil-water separator for easier maintenance",
    "U-shaped chassis with 350mm minimum ground clearance for high passability",
    "Optimized shock absorption reduces vibration by 20–50%",
    "Revised right-side header drive for more efficient load distribution",
    "Reinforced wheel axles and center thrust configuration improve durability"
  ],
  specTable: {
    headers: ["Parameter", "Specification"],
    rows: [
      ["Rated HP", "105 hp"],
      ["Feeding Capacity", "6.0 kg/s"],
      ["Cutting Width", "2360 mm"],
      ["Rated Speed", "2600 r/min"],
      ["Gauge", "1250 mm"],
      ["Minimum Ground Clearance", "350 mm"],
      ["Threshing Drum (Dia × Length)", "φ620×2000 mm"],
      ["Operation Productivity", "0.7–1 hm²/h"]
    ]
  },
  ctaHeadline: "Smarter harvesting starts with the ZL105",
  ctaDescription: "Talk to us today about how the Zoomlion ZL105 can transform your harvest with smarter, cleaner, and more efficient technology."
},
{
  id: "9",
  slug: "zoomlion-rk504-704",
  name: "Zoomlion RK504/704 Wheeled Tractor",
  description: "Versatile tractor with powerful engine options, ideal for various field operations.",
  image: tractor5,
  longDescription:
    "The Zoomlion RK504/704 is a high-performance wheeled tractor equipped with a reliable National II emission-standard engine. Designed for flexibility and durability, it features a 12F+12R shuttle shift gearbox, enhanced chassis, and waterproof wiring harness, making it suitable for diverse farming environments including paddy fields. With a powerful lifting system and adjustable rear track, it supports a wide range of attachments and operations.",
  keySpecs: [
    { label: "Horse Power", value: "50–70 hp" },
    { label: "Number of gears", value: "12F+12R" },
    { label: "Weight", value: "2335–2385 kg" }
  ],
  advantages: [
    "Brand-name, high-quality National II engine offering reliability and economy",
    "Independent double-acting clutch with large torque reserve",
    "Enhanced chassis and waterproof harness for paddy suitability",
    "12F+12R shuttle shift ensures smooth, efficient operation",
    "Double-speed PTO accommodates a variety of implements",
    "Partial-separated lifter with auxiliary oil cylinder for high lifting force",
    "Adjustable rear track for different farming needs",
    "Extra-large fuel tank for extended operation time",
    "Sealed build prevents 'three leaks' and enhances durability",
    "Comfortable operation with safety shelf and sunshade"
  ],
  specTable: {
    headers: ["Model", "RK504-A", "RK704-A"],
    rows: [
      ["Overall dimension (L×W×H)", "3980×1750×2620 mm", "4030×1728×2840 mm"],
      ["Wheelbase", "2020 mm", "2040 mm"],
      ["Minimum operating mass", "2335 kg", "2385 kg"],
      ["Ground clearance", "320 mm", "355 mm"],
      ["Engine emission", "National II", "National II"],
      ["Rated power", "36.8 kW", "51.5 kW"],
      ["Fuel consumption rate", "≤242 g/kW·h", "≤238 g/kW·h"],
      ["Clutch type", "Dry type, independent control double-action", "Dry type, independent control double-action"],
      ["Gearbox", "12F+12R", "12F+12R"],
      ["Tyre size (front/rear)", "8.3-20 / 12.4-28", "8.3-24 / 14.9-30"],
      ["Hydraulic system", "Lifting device with partial separated units", "Lifting device with partial separated units"],
      ["Max lifting capacity", "≥8.8 kN", "≥15 kN"],
      ["Tillage control", "Independent force position & floating control", "Independent force position & floating control"],
      ["Hydraulic valves", "2 groups", "2 groups"],
      ["Hitch", "Three-point rear suspension, Class I", "Three-point rear suspension, Class I"],
      ["Traction force", "12.5 kN", "14 kN"],
      ["PTO speed", "540/1000 rpm", "540/760 rpm"],
      ["Cab", "Safety shelf + sunshade", "Safety shelf + sunshade"]
    ]
  },
  ctaHeadline: "Ready for reliable performance on every terrain?",
  ctaDescription:
    "Contact us today to get a quote or learn how the Zoomlion RK504/704 tractor can boost your productivity.",
},
{
  id: "10",
  slug: "zoomlion-rc904-1104",
  name: "Zoomlion RC904/1104 Wheeled Tractor",
  description: "Heavy-duty tractor built for power and precision in large-scale operations.",
  image: tractor6,
  longDescription:
    "The Zoomlion RC904/1104 is a robust wheeled tractor equipped with a turbocharged inter-cooling four-cylinder engine that meets National II emission standards. It features a 16F+8R meshing sleeve gearshift for optimized speed control across various operations. With a full hydraulic power steering system and an enhanced two-speed power output, this model ensures flexibility, strength, and comfort for intensive fieldwork.",
  keySpecs: [
    { label: "Horse Power", value: "90–110 hp" },
    { label: "Number of gears", value: "16F+8R" },
    { label: "Weight", value: "3790 kg" }
  ],
  advantages: [
    "Four-cylinder turbocharged inter-cooling engine with National II compliance",
    "16F+8R gearbox enables precise speed control for different operations",
    "Full hydraulic steering for smooth and effortless handling",
    "Enhanced dual-speed PTO supports a variety of agricultural implements",
    "High-pressure hydraulic lifting system for reliable load handling",
    "Large ground clearance for superior terrain adaptability",
    "Dry-type, independent control double-action clutch for efficiency and durability",
    "Optional cab or sunshade for operator comfort",
    "Class II three-point suspension for heavy-duty implements",
    "Fuel-efficient engine design with low consumption rate"
  ],
  specTable: {
    headers: ["Model", "RC904-A", "RC1104"],
    rows: [
      ["Overall dimension (L×W×H)", "4390×2095×2950 mm", "4500×2095×2950 mm"],
      ["Wheelbase", "2195 mm", "2195 mm"],
      ["Minimum operating mass", "3790 kg", "3790 kg"],
      ["Ground clearance", "435 mm", "435 mm"],
      ["Engine emission", "National II", "National II"],
      ["Rated power", "66.2 kW", "81 kW"],
      ["Fuel consumption rate", "≤242 g/kW·h", "≤242 g/kW·h"],
      ["Clutch type", "Dry type, independent control double action", "Dry type, independent control double action"],
      ["Gearbox", "16F+8R", "16F+8R"],
      ["Tyre size (front/rear)", "12.4-24 / 16.9-34", "12.4-24(R2) / 18.4-30(R2)"],
      ["Hydraulic system", "High pressure", "High pressure"],
      ["Max lifting capacity", "16 kN", "17.7 kN"],
      ["Tillage control", "Force, Position & Floating Control", "Force, Position & Floating Control"],
      ["Hydraulic valves", "2 groups", "2 groups"],
      ["Hitch", "Three-point rear suspension, Class II", "Three-point rear suspension, Class II"],
      ["Traction force", "25.4 kN", "29.4 kN"],
      ["PTO speed", "540/1000 rpm", "540/1000 rpm"],
      ["Cab", "Safety shelf + sunshade / Cab (optional)", "Safety shelf + sunshade / Cab (optional)"]
    ]
  },
  ctaHeadline: "Need a heavy-duty tractor that handles more?",
  ctaDescription:
    "Reach out to request a quote or speak with our team to see how the RC904/1104 fits your farming operation."
},
{
  id: "11",
  slug: "zoomlion-rs1304-1604",
  name: "Zoomlion RS1304/1604 Wheeled Tractor",
  description: "High-powered, smart farming tractor designed for precision, comfort, and performance.",
  image: tractor7,
  longDescription:
    "The Zoomlion RS1304/1604 is a powerful and intelligent four-wheel drive tractor built for large-scale agricultural operations. Equipped with a 6-cylinder turbocharged engine with high-pressure common rail fuel control technology, it delivers up to 160 HP and features a partially synchronized 16F+8R gearbox. This model includes an air-conditioned Zoomlion Aurora cabin, electronic control systems, and smart monitoring—making it a comfortable, efficient, and tech-forward solution for today's farmers.",
  keySpecs: [
    { label: "Horse Power", value: "130–160 hp" },
    { label: "Number of gears", value: "16F+8R (24F+8R Optional)" },
    { label: "Weight", value: "5810–6500 kg" }
  ],
  advantages: [
    "6-cylinder turbocharged water-cooled engine with high torque (up to 920 N·m)",
    "BOCH high-pressure common rail system with 37% torque reserve",
    "Partially synchronized 16F+8R transmission (optional 24F+8R)",
    "Luxury AC cab with intelligent display, suspension seat, and rearview imaging",
    "Electronic control armrest and digital instrument panel for real-time monitoring",
    "Hydraulic system with 3 output groups (optional expansion), up to 100L/min flow",
    "Minimum lifting force of 28200 kg @ 610mm with Class III hitch",
    "Tillage control via draft and position (electro-hydraulic)",
    "PTO output: 85/105 kW at 540/1000 rpm",
    "Globally supported with service personnel and spare parts warehouses"
  ],
  specTable: {
    headers: ["Model", "RS1304/1604", "RS1304/1604 (2025 New)"],
    rows: [
      ["Dimensions (L×W×H)", "5200×2435×3250 mm", "5200×2435×3250 mm"],
      ["Wheelbase", "2640 mm", "2640 mm"],
      ["Minimum usable mass", "5810 kg", "6500 kg"],
      ["Ground clearance", "450 mm", "490 mm"],
      ["Engine emission", "National III", "National III"],
      ["Calibrated power", "95.5 / 117.6 kW", "95.5 / 117.6 kW"],
      ["Fuel consumption rate", "≤250 g/kW·h", "≤250 g/kW·h"],
      ["Clutch type", "Dry, independently operated double action", "Dry, independently operated double action"],
      ["Gearbox", "16F+8R", "24F+8R"],
      ["Tyre size (front/rear)", "14.9-26 / 18.4-38", "14.9-26 / 18.4-38"],
      ["Hydraulic system", "Lifting device with separated units", "Lifting device with separated units"],
      ["Max lifting force", "28200 kg @ 610mm", "28200 kg @ 610mm"],
      ["Tillage control", "Position control", "Draft & position control (electro-hydraulic)"],
      ["Hydraulic valves", "3 groups", "3 groups"],
      ["Hitch", "Three-point rear suspension, Class III", "Three-point rear suspension, Class III"],
      ["Calibrated traction", "51 kN", "51 kN"],
      ["PTO power output", "85 / 105 kW", "85 / 105 kW"],
      ["PTO speed", "540/1000 rpm", "540/1000 rpm"],
      ["Cab", "Air-conditioned cab", "Air-conditioned cab"]
    ]
  },
  ctaHeadline: "Experience intelligent power and comfort in the field.",
  ctaDescription:
    "Get in touch with us to discover how the Zoomlion RS1304/1604 can transform your farming operations with unmatched power and technology."
}






































];
