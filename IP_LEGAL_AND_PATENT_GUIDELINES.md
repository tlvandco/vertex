# VERTEX Studio — Intellectual Property, Copyright & Patent Filing Guidelines

This document provides complete, step-by-step procedures, legal risk mitigation strategies, and filing blueprints for **VERTEX Architectural Studio** across copyrights, provisional patent drafting, and trademark registration.

---

## 1. Executive Summary & Legal Landscape

VERTEX occupies a unique market space combining **AEC project management**, **BIM-adjacent spatial/CSI finish specification**, and **cryptographically verified contractor onboarding/governance**.

### Primary Market Incumbents & Infringement Risk Matrix

| Incumbent Platform | Overlapping Features | Primary Legal / IP Risk Vector | Risk Level | Mitigation & Technical Differentiation |
| :--- | :--- | :--- | :--- | :--- |
| **Procore Technologies** (NYSE: PCOR) | Contractor Directory, Subcontractor Compliance, Invoicing, Change Orders | Procore holds utility patents on drawing markup and field-to-office submittal workflows. | **Moderate** | Procore’s claims focus on RFI and PDF annotation sync. VERTEX differentiates through a **cryptographic SHA-256 state machine directly binding contractor status (`PENDING` vs. `ONBOARDED`) with 2FA challenges and tamper-evident audit logs**. |
| **Autodesk (BIM 360 / Construction Cloud)** | CSI specifications, spatial takeoffs, document revision control | Autodesk protects proprietary CAD/BIM formats (`.dwg`, `.rvt` APIs). | **Low-Moderate** | VERTEX does not execute proprietary geometry extraction. All calculations use **public domain architectural standards (AIA scale ratios, ASTM testing standards, California Title 24, and CSI MasterFormat)**. |
| **DocuSign / Adobe Acrobat Sign** | Digital signature collection and audit certificate creation | Extensive patent portfolios covering digital signature pad placement and signing envelopes. | **Moderate** | Avoid replicating DocuSign's signature UI placement algorithms. VERTEX relies on **role-authenticated multi-factor challenges and server-side document SHA-256 seal computation**. |
| **Monograph / Harvest / Core by BQE** | Architecture fee burn-down, phase-based invoicing (AIA B101 fee structures) | Copyright claims on standard contract templates and fee billing structures. | **Low** | AIA contract numbers (B101, G702) are industry standards. Ensure contract terms and onboarding clauses use original legal drafts rather than verbatim text from licensed AIA digital documents. |

---

## 2. Immediate Copyright Protection Procedure

Under 17 U.S. Code § 102, copyright protects the specific expression of source code, user interface designs, and textual assets.

### Step 2.1: Add Proprietary Header to Source Files
Ensure all application source files (`.ts`, `.tsx`, `.html`, `.css`) include the formal copyright notice:

```typescript
/**
 * Copyright (c) 2026 VERTEX Architectural Studio Inc.
 * All Rights Reserved. Proprietary and Confidential.
 *
 * This source code and associated documentation files are protected under
 * United States and international copyright laws. Unauthorized reproduction,
 * distribution, or decompilation is strictly prohibited.
 */
```

### Step 2.2: Replace Third-Party Stock Images
- **Audit Requirement:** Inspect `src/components/ArchitecturalTools.tsx` and `src/data/seedData.ts`.
- **Action:** Replace external Unsplash/placeholder image URLs with company-owned architectural renders, licensed commercial stock, or self-hosted vector graphics prior to commercial release.

### Step 2.3: File US Copyright Registration (Form TX - Computer Code)
Registering with the US Copyright Office enables eligibility for **statutory damages (up to $150,000 per willful infringement)** and attorney’s fees.

1. **Visit the US Copyright Office Portal:** Navigate to [copyright.gov](https://www.copyright.gov) and log in to the **Electronic Copyright Office (eCO)**.
2. **Select Application Type:** Choose **Register a Work of the Visual Arts / Computer Program (Form TX)**.
3. **Specify Title:** `VERTEX Architectural Studio Software Application (Version 2.5)`.
4. **Author & Claimant:** Designate your company entity (e.g., `VERTEX Architectural Studio Inc.`) with **Work Made for Hire** checked if developed by employees/contractors.
5. **Prepare the Identifying Material (Code Deposit):**
   - Extract the **first 25 pages** and **last 25 pages** of source code (50 pages total).
   - Redact any trade-secret database connection strings or private keys.
6. **Pay Filing Fee:** ~$45 - $65 (standard online fee).
7. **Submit & Archive:** Store the official Certificate of Registration in your company corporate records.

---

## 3. Patent Strategy & Invention Disclosures

To satisfy the **Alice / Mayo framework (35 U.S.C. § 101)**, software patents must solve a specific technical problem through an inventive technical mechanism rather than claiming an abstract business method.

### Invention 1: Cryptographic Contractor Onboarding & Vault Ingestion

- **Invention Title:** *System and Method for Synchronized Cryptographic Onboarding and Tamper-Evident Legal Document Ingestion in Construction Management Platforms.*
- **Technical Problem:** In traditional AEC management, subcontractor compliance documents are stored as unverified PDFs in cloud buckets, allowing unvetted contractors to be staffed on active project sites before legal criteria are verified.
- **Inventive Step & Novelty:**
  1. A multi-tier state machine enforcing strict transitions: `PENDING_ONBOARDING` &rarr; `ACTIVE_ENROLLED` &rarr; `TIER_VERIFIED`.
  2. Integration of a step-up Multi-Factor Authentication (2FA) challenge trigger directly bound to the document ingestion payload.
  3. Generation of real-time SHA-256 cryptographic hashes calculated over the document stream and persisted in an immutable audit ledger (`auditAction: 'SUBMIT_ONBOARDING_PACKAGE'`).
  4. Real-time RBAC gating that blocks project assignment APIs until the cryptographic seal verification succeeds.

### Invention 2: Bidirectional Architectural Scale Converter & CSI Environmental Takeoff Engine

- **Invention Title:** *Interactive Bidirectional Architectural Blueprint Scale Converter and Dynamic CSI Environmental Takeoff System.*
- **Technical Problem:** Architectural drawing scale conversion (e.g., 1/4" = 1'-0") is traditionally decoupled from building performance calculations (HVAC tonnage, illuminance Lux targets, and CSI Division 09 material schedules), requiring disparate tools and risking calculation discrepancies.
- **Inventive Step & Novelty:**
  1. Real-time bidirectional conversion between paper measurements (imperial fractions or metric) and physical building volumes.
  2. Automated aperture deduction algorithms estimating net wall finishes (stone/plaster) from gross geometric perimeters.
  3. Dynamic cross-referencing of room typology against ASHRAE/IESNA standards for target illuminance (Lux/Lumens), fresh air circulation (CFM), and cooling tonnage.
  4. Automated binding of volumetric takeoffs directly to CSI MasterFormat Division 09 specification schedules and real-time Rough-Order-of-Magnitude (ROM) budget bands.

---

## 4. Step-by-Step Patent Filing Procedure (USPTO Provisional)

A **Provisional Patent Application** secures a priority filing date worldwide for **12 months** under the Paris Convention and Patent Cooperation Treaty (PCT), allowing you to immediately mark the product as **"Patent Pending"**.

```
[Month 0: File Provisional] ───► [Months 1–11: Commercialize / Test] ───► [Month 12: Convert to Non-Provisional / PCT]
```

### Step 4.1: Prepare the Provisional Specification Document
A provisional application requires a written description and drawings that enable someone skilled in the art to replicate the system:

1. **Abstract:** High-level description of the technical architecture (150 words max).
2. **Background of the Invention:** Description of current limitations in AEC project software and compliance race conditions.
3. **Summary of the Invention:** Clear technical description of the system components (`server.ts`, cryptographic vault, scale engine).
4. **Brief Description of the Drawings:** References to architectural block diagrams:
   - *Figure 1:* Overall system architecture (client, API layer, database, cryptographic ledger).
   - *Figure 2:* Flowchart of the multi-tier onboarding and 2FA challenge state machine.
   - *Figure 3:* Logic flow of the bidirectional scale and CSI takeoff engine.
5. **Detailed Description of Preferred Embodiments:** Detailed narrative walking through code data structures, API endpoints, and validation sequences.

### Step 4.2: File Online via USPTO Patent Center
1. Navigate to [patentcenter.uspto.gov](https://patentcenter.uspto.gov).
2. Create an account with a verified USPTO customer number.
3. Select **File a New Application** &rarr; **Provisional Application under 35 U.S.C. 111(b)**.
4. Upload:
   - Written Specification (`.pdf` or `.docx`).
   - Formal Drawing Sheets (Figures 1, 2, and 3).
   - Application Data Sheet (Form PTO/AIA/14).
5. Certify your Entity Status:
   - **Micro Entity (37 CFR 1.29):** Total gross income < 3x national median, fewer than 4 previously filed patents.
   - **Small Entity:** Fewer than 500 employees.
6. Pay Filing Fee:
   - **Micro Entity:** **$60** (approximate USPTO statutory fee).
   - **Small Entity:** **$120**.
   - **Large Entity:** **$300**.
7. Download the **Electronic Filing Receipt** containing your Official Application Number and Priority Filing Date.

---

## 5. Trademark Registration Procedure (Brand Protection)

To prevent competitors from using the **VERTEX** name or confusingly similar branding in construction and architectural software:

1. **Perform Trademark Clearance Search:**
   - Search the USPTO **TESS (Trademark Electronic Search System)** at [uspto.gov](https://www.uspto.gov).
   - Verify that "VERTEX" is not already registered for identical or closely related software services.
2. **Select International Trademark Classes:**
   - **Class 09 (Software):** Downloadable and web-based computer software for architectural project management and construction takeoff calculation.
   - **Class 42 (SaaS):** Providing Software-as-a-Service (SaaS) featuring tools for architectural design portal management, contractor onboarding compliance, and finish specification.
3. **Submit TEAS Plus Application:**
   - Filing fee: **$250 per class** (total: $500 for Classes 09 and 42).
   - Provide a specimen showing the trademark in commercial use (e.g., screenshot of the live application header with the brand name).

---

## 6. Budget & Resource Allocation Matrix

| Protection Phase | Filing Vehicle | Statutory Filing Fee | Professional Legal Preparation | Timeline |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Immediate** | US Copyright Office (Form TX) | $45 - $65 | $0 (Self-filed) | Weeks 1–2 |
| **Phase 1: Immediate** | Source Code Copyright Notices | $0 | $0 (Internal team) | Week 1 |
| **Phase 2: Brand Protection**| USPTO Trademark (Class 09 & 42) | $500 | $500 – $1,500 (Optional counsel) | Months 1–2 |
| **Phase 2: Patent Priority** | USPTO Provisional Patent (x2) | $120 – $240 (Micro/Small) | $2,500 – $5,000 (Attorney review) | Months 1–3 |
| **Phase 3: International** | PCT International / Utility Patent | $2,000 – $3,500 | $8,000 – $15,000 | Month 12 |

---

## 7. Action Checklist for Implementation

- [x] **Compile Intellectual Property Guidelines:** Persisted in `/IP_LEGAL_AND_PATENT_GUIDELINES.md`.
- [ ] **Audit Seed Assets:** Replace third-party stock photo URLs with proprietary renderings.
- [ ] **Review Client/Contractor NDAs:** Ensure contract templates in `seedData.ts` and `AppContext.tsx` use original legal verbiage.
- [ ] **Submit Copyright Deposit:** Package first 25 and last 25 pages of code for US Copyright Form TX.
- [ ] **Draft Provisional Patent Figures:** Create architectural workflow diagrams for the cryptographic vault and takeoff engine.
- [ ] **Submit Provisional Applications:** File with the USPTO under Micro Entity status ($60 fee per invention).
