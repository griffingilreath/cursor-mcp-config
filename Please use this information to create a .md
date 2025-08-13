Please use this information to create a new project.Use it as a starting point and with a grain of salt. Ask questions about things that need clarified. Questions are never bad. 

here’s a cursor-agent friendly build spec that assumes everything is implemented with Apple’s native design system (SwiftUI, UIKit where needed), follows Liquid Glass patterns per iOS 26, and is organized so multiple autonomous agents (in Cursor) can collaborate without stepping on each other.
I’ve split this into:
A) Repo + module layout
B) Agents & responsibilities (with handoff contracts)
C) UI architecture & navigation (iPad vs iPhone)
D) Screens, interactions, layouts (pixel-intended, but code-oriented)
E) Liquid Glass implementation guide (native)
F) Data layer & API contracts
G) Feature logic (hover, tickets, search, PDF, polygon editor)
H) Acceptance tests (agent-runnable)
I) Initial task queue for Cursor agents
No Figma. No external design files. Everything is defined as coded components, tokens, and behaviors.
A) Repo & Module Layout
studio-space-manager/
├─ AppCore/                 # App entry, navigation, auth/session, feature flags
├─ DesignKit/               # Colors, type, materials, glass components, animations
├─ DataKit/                 # Models, JSON codables, caching (Core Data), API client
├─ PlanKit/                 # Plan rendering (PDF/SVG), quadtree, hit-testing, polygons
├─ TicketKit/               # Ticket list/detail, Quick Ticket flow
├─ SearchKit/               # Global search UI/engine
├─ PDFKitPlus/              # 11×17 PDF composer (vector)
├─ AdminTools/              # Polygon editor, plan versioning
├─ Features/                # Major workspace, Studio detail, PDF screen, Settings
├─ Tests/                   # Unit + snapshot + integration tests
└─ Tooling/                 # CI, lint, swift-format config, scripts
Swift toolchain: Xcode 16+, Swift 5.10+, iPadOS 18+/iOS 18+ (target 18 for iOS 26 design language).
B) Agents & Responsibilities
1) Orchestrator Agent
Owns milestone plan, merges PRs after checks pass.
Enforces interface contracts & acceptance tests.
2) DesignKit Agent (native system design)
Exposes tokens (brand colors, typography), materials, glass components, motion helpers.
Output: Swift types only (no images except logos/fonts).
3) DataKit Agent
Models, Core Data schema, API client, sync engine.
Guarantees stable JSON contracts to all features.
4) API Agent (Apps Script)
Implements /v1/* endpoints (see section F).
Provides a stub server for local dev (Node/SwiftNIO optional).
5) PlanKit Agent
Renders PDF/SVG, manages zoom/pan transforms, builds quadtree, hit-tests, polygon editor tools.
6) TicketKit Agent
Quick Ticket sheet + Detailed Ticket screen, timeline updates, filters.
7) PDFKitPlus Agent
11×17 composer (per-area), embeds fonts, footer metadata, share sheet.
8) SearchKit Agent
Global unified search UI/engine (students, studios, tickets), debounced.
9) Feature Teams
MajorWorkspace (map + hover chip + FAB).
StudioDetail (sheet with notes/tickets).
PDFScreen (options → generate).
Settings/Admin (auth, plan import, polygon save).
10) QA/Perf Agent
Snapshot tests, perf harness (hover latency, cold-start), accessibility checks.
11) Security/Release Agent
OAuth, Keychain, entitlements, TestFlight pipeline.
Handoff rule: every module exposes only public protocols + preview fixtures for others to develop against.
C) UI Architecture & Navigation (iPad vs iPhone)
iPad (primary)
NavigationSplitView (three columns):
Sidebar (Major Selector): chips/list of majors (IL, CD, NSP, IAD, FAD, PD, IMAT).
Content (Major Workspace): plan canvas + overlays.
Supplementary: context panel (tickets list or studio detail) as needed.
Glass Dock (floating, bottom-right FAB cluster):
Quick Ticket (+), Filters, Generate PDF (per-area).
Glass Panels: drawers for Filters and Search results.
iPhone
TabView tabs:
Majors (landing → Major Workspace for that major)
Tickets (hub + detailed)
Search (system searchable behavior)
Settings
Liquid Glass Menu (Music/News-style):
A bottom glass bar with compact controls/context.
Swiping up reveals a glass sheet (thick material) with filters, quick actions (Quick Ticket, Generate PDF).
When a studio is selected, the bar shows a mini capsule: Studio label + ellipsis → actions.
State sync: selected major, floor filters, selected studio persist between iPad/iPhone layouts via @Observable store in AppCore.
D) Screens, Interactions, Layouts
1) Major Selector (iPad Sidebar / iPhone List)
iPad: glass sidebar with Major chips (brand color dot + label). Search at top (to jump to student/studio).
iPhone: list of majors → tap pushes Major Workspace.
Interactions
Tap major → Major Workspace loads first relevant floor (or all floors stacked).
Long-press major → context actions (Generate PDF, Open Tickets for Major).
2) Major Workspace (core map screen)
Header: <Major> • <Semester>; buttons: Filters, Generate PDF, Admin toggle.
Canvas: plan PDF/SVG; polygons tinted by Major (or Level when toggled).
Hover/Pointer: Apple Pencil hover + trackpad hover → Hover Chip (capsule on thin material): Student Name (Whyte Bold), line 2 (Level • Major/Minor), Studio label (Space Mono).
Tap: open Studio Detail sheet.
FAB cluster (Glass Dock): Quick Ticket, Filters, Generate PDF (per-area).
Gestures
Two-finger pan/zoom (inertia).
Double-tap to zoom in; two-finger double-tap to zoom out.
3) Studio Detail (glass sheet)
Top: Studio label (mono), dept chip, floor name.
Assignment: name (pref if present), level, majors/minors.
Notes: last 2–3 with “See all”.
Tickets: open tickets (priority bar), then “Closed” collapsible.
Actions: Quick Ticket (fast), Detailed Ticket (push to Tickets tab).
Admin: Edit Polygon, Keys/Locks (if configured).
4) Tickets (hub)
Header chips: Open, In-Progress, Waiting, Closed.
Filters: Priority (Low→Urgent), Type (Maint/Safety/…).
List card: left color bar = priority; right meta = days open; subtitle = studio label.
Detailed Ticket editor: full form, attachment picker, updates timeline.
5) Search (global)
iPad: search field in nav bar; results in a glass panel sliding from right.
iPhone: dedicated Search tab; system .searchable() integration + suggestions.
Results buckets: Students, Studios, Tickets. Selecting a Student jumps to the studio and animates a pulse on the polygon.
6) PDF Screen (per-area)
Options: Paper (11×17 default), Color mode (Major/Level), Include roster?, Sort (By Studio/By Student), Floor (if multiple).
Preview thumbnail (low-res) + Generate button.
On generate: show share sheet; filename {Semester}_{Major}_Floor-{Name}_v01.pdf.
Footer in file: timestamp + generated by user + semester + source.
7) Settings/Admin
Sign-in/out; OAuth scopes view.
Data sync (manual refresh, cache size).
Plan import (choose file); Save Polygon (writes to Sheets).
Accessibility toggles: High-Contrast Outlines, Reduce Motion/Transparency compliance indicators.
E) Liquid Glass Implementation Guide (Native)
Materials & Layers
Chips/tooltips: .ultraThinMaterial
Hover chip/popovers: .thinMaterial
Side drawers/panels: .regularMaterial
Sheets/modals: .thickMaterial
Full overlays (rare): .ultraThickMaterial
Shape & Lighting (reusable modifier)
Continuous corners (16pt default).
Top soft highlight (white @ 10–12% opacity gradient).
Bottom subsurface glow (current major hue @ 6–8%).
Inner edge shadow (black @ 8–10%).
Export as GlassStyle view modifier; never stack >2 blurs.
Motion
Hover “breathe”: scale 1.02×, shadow radius +2, 90–120ms ease-out.
Chip reveal: spring(response: 0.55, dampingFraction: 0.9).
Panel parallax: content backdrop translates −2 to −4pts on present.
Respect Reduce Motion (fall back to crossfade) and Reduce Transparency (swap opaque surfaces).
Typography
Register ABC Whyte (Book/Bold) in UIAppFonts; fallback Helvetica.
Space Mono for studio labels & IDs (slight positive tracking for glass).
F) Data Layer & API Contracts
Sheets Tabs (canonical)
Floors(floor_id, building, floor_name, plan_file_url, plan_width_pt, plan_height_pt, plan_version, active)
Studios(studio_id, floor_id, studio_label, department, capacity, polygon_json, notes, active)
Students(student_id, first_name, last_name, preferred_first, preferred_last, level, status, major_1, major_2, minor_1, minor_2)
Assignments(assignment_id, semester, studio_id, student_id, start_date, end_date, active, source)
Tickets(ticket_id, studio_id, type, priority, status, submitted_by, submitted_at, title, body, assignee, last_update_at, closed_at)
Keys_Locks(optional)
Notes(note_id, entity_type, entity_id, author, created_at, text)
REST (Apps Script) — JSON shapes (stable)
GET /v1/majors
[{ "code":"NSP","name":"New Studio Practice","color":"#8046C2" }]
GET /v1/floors?major=NSP
[{ "floor_id":"F-3N","floor_name":"3 North","plan_file_url":"https://...", "plan_width_pt":842,"plan_height_pt":595,"plan_version":"v3"}]
GET /v1/studios?major=NSP&floor_id=F-3N&active=true
[{ "studio_id":"S-3N-045","studio_label":"3N-045","floor_id":"F-3N","department":"NSP",
   "capacity":1,"polygon":[[123.4,56.7],[...]],"active":true }]
GET /v1/assignments?major=NSP&semester=FA25&active=true
[{ "assignment_id":"ASG-0001","studio_id":"S-3N-045","semester":"FA25","active":true,
   "student":{"id":"A12345","display_name":"Sam Lee","level":"SR","majors":["NSP"],"minors":[]} }]
GET /v1/tickets?major=NSP&status=Open
[{ "ticket_id":"T-0001","studio_id":"S-3N-045","type":"Maint","priority":"High","status":"Open",
   "title":"Outlet broken","submitted_by":"Griffin","submitted_at":"2025-09-01T09:13:00Z",
   "assignee":"Facilities","last_update_at":"2025-09-02T08:01:00Z","closed_at":null }]
POST /v1/tickets (create/update)
{ "studio_id":"S-3N-045","type":"Maint","priority":"Medium","status":"Open",
  "title":"Loose chair","body":"Wobbly leg","assignee":"Facilities" }
POST /v1/studios/polygon
{ "studio_id":"S-3N-045","polygon":[[10,10],[120,10],[120,80],[10,80]] }
Rules
Server enforces: no two active assignments per studio_id, enum validation, trimming.
G) Feature Logic (key flows)
1) Plan Rendering & Hover
Load PDF/SVG → compute plan transform.
Build quadtree of polygon AABBs; cache edges for ray-casting.
On hover/tap:
Map point → plan coords (inverseTransform).
Query quadtree → candidates → ray-cast.
If hit: update hoverStudio, show Hover Chip with GlassStyle + spring.
2) Quick Ticket
Entry: FAB or Studio Detail.
Fields: type, priority, title; auto fill studio_id, submitted_by, submitted_at.
POST; success toast + light haptic; offer “Add details…” to push detailed editor.
3) Detailed Ticket
Full form; timeline from Notes(entity_type="Ticket").
On status=Closed → set closed_at now.
Filters: open, my dept, overdue>N, by floor/type.
4) Global Search
.searchable() with tokenized in-memory index (names, labels, ticket titles).
Debounced update; sections: Students, Studios, Tickets.
Selecting Student centers plan on their studio and pulses outline (glass-friendly outline).
5) PDF Generation (per-area)
Inputs: major, floor, options (11×17 default, color mode, roster include/sort).
Core Graphics context: draw base plan vector; overlay polygons (brand tints); labeler with halo strokes; legend; roster column; footer:
Generated {YYYY-MM-DD HH:MM} by {User} • {Semester} • Source: Studio_Space_Manager
Embed fonts; share sheet; save to Files.
6) Polygon Editor (Admin)
Pencil: tap to add/move vertex; long-press edge to insert; handles squish on drag.
⌘ snap 0/45/90°; Douglas–Peucker simplify on save.
Save → POST /v1/studios/polygon + bump plan_version.
H) Acceptance Tests (agent-runnable)
A1 — Hover latency
Given a loaded NSP floor on M2 iPad Pro,
When pointer hovers over studio area,
Then hover chip appears within ≤ 50 ms and follows within ≤ 80 ms at 45 fps+.
A2 — Quick Ticket
Given a selected studio,
When user taps Quick Ticket and saves minimal fields,
Then a new ticket row exists via GET /v1/tickets and UI shows toast + haptic within ≤ 500 ms.
A3 — Global Search
Given index built,
When user types first 3 chars of a known student,
Then student appears in top 5 results; selecting navigates to studio and pulses outline.
A4 — PDF 11×17
When user taps Generate PDF with defaults,
Then a vector PDF is produced with embedded fonts, roster (if enabled), legend, and footer showing date/time + user; file name matches pattern.
A5 — Polygon Edit
When admin adds a vertex and saves,
Then POST succeeds, plan_version increments, redraw reflects new shape.
A6 — No Dual Assignments
When API receives a second active assignment for same studio,
Then API returns 409 with message; UI displays non-blocking error banner.
A7 — Accessibility
With Reduce Motion on,
Then animations become crossfades; with Reduce Transparency on, materials swap to opaque.
I) Initial Task Queue for Cursor Agents
DesignKit Agent
Implement BrandColor, GlassStyle view modifier (materials, lighting), GlassChip, GlassPanel, motion helpers.
Export typography helpers for Whyte/SpaceMono.
DataKit Agent
Define struct models + Codable for all JSON shapes.
API client with endpoints; Core Data schema + lightweight migration.
Demo fixtures for previews/tests.
API Agent
Apps Script: /v1/majors, /v1/floors, /v1/studios, /v1/assignments, /v1/tickets (GET/POST), /v1/studios/polygon.
Auth: Workspace OAuth; simple validation rules.
Provide mock server (optional) for local dev.
PlanKit Agent
PDF load, transform, quadtree, ray-cast hit test (with unit tests).
Hover chip integration points.
Polygon editor scaffolding.
MajorWorkspace Feature
iPad NavigationSplitView layout; iPhone Tab layout.
Canvas view + hover chip + FAB cluster (Quick Ticket, Filters, Generate PDF).
TicketKit Agent
Quick Ticket sheet → POST; success UI.
Detailed Ticket form, filters, timeline rendering.
SearchKit Agent
Unified search engine + .searchable() UI; results buckets; jump-to-studio pulse.
PDFKitPlus Agent
11×17 composer; legend, roster, footer; share sheet.
AdminTools
Polygon editor interactions, snap, simplify, POST save.
QA/Perf Agent
Implement tests A1–A7; add performance probes; snapshot tests for key glass components.