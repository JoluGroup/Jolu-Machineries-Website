# JOLU MACHINERIES — Owner Business-Information Verification Form (M2-CLAIMS-FINAL-01)

Values below are copied exactly from the claims registry (`client/src/config/business.ts`) and page source at
release candidate `adfb02b`. Where the site shows conflicting values, all are listed: **no value has been chosen**.

For each row, mark **Confirm**, **Correct to …**, or **Remove**. A production release needs at least one verified
phone, one verified monitored email and one verified location, so customers can reach the business.

How a decision is applied: the registry status changes from `pending` to `verified` (shown in production) or to
`unsupported` (never shown). Production builds hide every `pending` value automatically.

## 1. Identity (C1)

| Item | Exact current value(s) | Where shown | Decision |
|---|---|---|---|
| Registered legal entity name | "Jolu Agricultural & Construction Machineries" (index.html author meta). Four name variants exist across the site. | Withheld everywhere | |
| Public-facing brand | "JOLU MACHINERIES" (status: verified per M2-INTEG-02 §7, final confirmation requested) | Page titles, og:site_name, Organization/WebSite JSON-LD | |
| Group name in event and corporate text | "Jolu Group", "Jolu Group of Companies" | News, Nakuru launch, Mud4Fun, Gallery captions (CEO, Directors, Managing Director, Head of Business), Careers | Confirm as historically accurate / correct |

## 2. Contact channels (C2–C6)

| Item | Exact current value(s) | Notes | Decision |
|---|---|---|---|
| Primary phone | +254 705 038 679 (Footer: 0705 038 679) | Used for most WhatsApp links | |
| Secondary phone | +254 743 682 700 (Header/Footer: 0743 682 700) | **Role conflict:** general line in Header/Contact; "Nakuru" office line in Footer. ContactSection WhatsApp uses this number. | Confirm role |
| After-sales phone | 0721 700 393 | Footer only, "After-Sales Department" | |
| WhatsApp number | 254705038679 (most links); 254743682700 (ContactSection) | Two numbers in use | Choose |
| Primary email | info@jolumachineries.com | 10 places. Confirm the mailbox is monitored. | |
| Other emails | jolumachineries@gmail.com (News); info@jolugroup.com (Mud4Fun) | | Keep / remove |

## 3. Locations and hours (C7)

| Item | Exact current value(s) | Notes | Decision |
|---|---|---|---|
| Nairobi | "Head Office", "Thome, Nairobi, Kenya"; FloatingContact labels it "Main Office" | Label conflict | |
| Nakuru | "Regional Office & Showroom", "Along West Road, Opposite Nakuru Athletics, Next to Evans Hospital, Nakuru, Kenya"; map plus code P357+5JP | | |
| Nakuru (second) | "Jolu Office (Machineries & Security)", "KFA Building, Nakuru" | Shared with Jolu Security; not in footer | Keep / remove |
| Migori / Rongo | Footer: "Near KENGAS Rongo, Migori, Kenya"; FloatingContact and map: "Quickfill Rongo Station, Migori, Kenya" | **Address conflict** | Choose |
| Opening hours | "Mon–Fri: 9:00–18:00", "Sat: 9:00-13:00", "Sun: Closed" | **Conflicts with the "24/7 Support" card** | Confirm hours; 24/7 yes/no |

## 4. Social profiles (C8)

| Item | Exact current value | Decision |
|---|---|---|
| Instagram | https://www.instagram.com/jolu_machineries/ | |
| TikTok | https://www.tiktok.com/@jolumachineries | |
| Facebook | Withheld: the site linked to a Facebook search-results URL, not a profile. Supply the official page URL if one exists. | |

## 5. Commercial claims

| Item | Exact current value(s) | Decision |
|---|---|---|
| Zoomlion relationship (C9) | Withheld. Neutral wording in use: "Zoomlion tractors, harvesters and farm implements for Kenyan farmers." Supply the contract-supported wording (for example authorised dealer / distributor, with territory). | |
| Homepage statistics (C10) | 500 Tractors Sold; 5 Years Experience; 480 Happy Customers | Confirm with evidence / remove |
| Experience (C11) | "5+ Years" | |
| Expert Team (C13) | "Certified technicians and agricultural specialists at your service" (card shown only when verified) | Evidence of certification |
| After-sales (C13) | "Complete after-sales support including maintenance and repairs" | |
| Delivery (C13) | "Reliable delivery and installation services across Kenya" | |
| 24/7 support (C13) | "Round-the-clock customer support for all your agricultural needs" | |
| Response time (C15) | "We'll get back to you within 24 hours." | |
| Newsletter offers (C20) | "exclusive offers" — now hidden until a genuine offer programme exists | |
| Testimonials (C12) | News page: customer videos (Richard Nyango, Faith Cherotich) and attributed quotes (Equity Bank, Britam, key client) | Recorded consent? |

## 6. Media and historical events

| Item | Exact current value(s) | Decision |
|---|---|---|
| KTN feature (C19) | "Watch our feature on KTN, where we shared insights about modern agricultural solutions for farmers in Kenya." (hidden in production) | Confirm the KTN broadcast |
| Official launch | "Aug. 23, 2025", "Lowland Estate, Thome, Nairobi"; Jolu Group of Companies launched subsidiaries Jolu Machineries, Jolu Group Security and Jolu Ventures | Confirm accuracy |
| Nakuru offices and showroom launch | "Saturday, 21st February 2026"; venue "Opposite Nakuru Athletics Club, along West Road, Nakuru" | Confirm accuracy |
| Mud4Fun 4x4 Challenge | "Dec 12–15, 2025", "Naivasha, South Lake"; "Security & Equipment Support"; "Jolu Group supporting an unforgettable off-road experience" | Confirm accuracy |

## 7. Brand positioning (no verification needed, per M2-FINAL-03 §5)

"Premium", "Premium Agricultural Machinery" and "Quality Equipment Since Day One" are retained as brand positioning.

## 8. Product specifications (C16)

Handled by M2-PRODUCT-VERIFY-01 (see the product verification matrix); only manufacturer-dependent questions remain for the owner.
