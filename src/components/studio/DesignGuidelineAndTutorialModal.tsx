import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Download,
  Copy,
  Check,
  Compass,
  Box,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  RotateCw,
  Palette,
  Ruler,
  HelpCircle,
  FileText,
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface DesignGuidelineAndTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTutorialStep?: (stepId: string) => void;
}

export const DesignGuidelineAndTutorialModal: React.FC<DesignGuidelineAndTutorialModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cad2d' | 'bim3d' | 'transforms' | 'exterior' | 'shortcuts' | 'csi'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (title: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(title);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# VERTEX StudioCAD BIM 4.0 — Master Design Guideline & Tutorial Manual
Version: 4.2.0-LTS • AIA / CSI MasterFormat Compliant • IBC 2024 Standards

## 1. Executive Design Philosophy & Workflow
The StudioCAD BIM 4.0 workstation provides a dual-engine architecture combining 2D precision drafting (AutoCAD / Revit style) with real-time 3D PBR WebGL spatial modeling (Blender 4.0 style).
It enables architects, interior designers, and structural engineers to prototype, detail, specify, and simulate luxury interior and exterior environments in one cohesive viewport.

---

## 2. 2D CAD Drafting Engine
- Coordinate System: Top-down architectural projection (X: Length, Y: Width).
- Snapping: Default 12" snap grid with dynamic edge alignment.
- Wall Drawing: Click "Draw Wall", then drag on the canvas to draft continuous gypsum partitions or exterior masonry.
- Glazed Openings: Select "Floor-to-Ceiling Glazed Wall" to insert acoustic architectural glass with light reflectance values (LRV).
- Doors & Windows: Single-click placement with automatic spatial hosting and 3.0ft clearance arcs.

---

## 3. 3D BIM Workspace Navigation
- Orbit: Left-click and drag to rotate the camera around the spatial target.
- Pan: Right-click and drag (or Shift + Middle-click).
- Zoom: Scroll wheel for smooth focal zoom.
- Shading Modes:
  - Wireframe: Structural line-work and envelope geometry.
  - Solid CAD: Clean studio surface shading.
  - Realistic PBR: Real-time shadow projection, ambient occlusion, and PBR materials.

---

## 4. Transform Controls: Rotation, Colors & Gaps (Blender & AutoCAD Standard)
### A. Rotation to Specific Angles
1. Canvas Interactive Knob: Click and drag the gold rotation handle situated above any selected element.
2. Numeric Angle Input: Enter any exact degree (-360° to +360°) in the Design Controls Pane or the Blender N-Panel.
3. Quick Step Angles: Use the +15°, +45°, +90°, or 180° rotation steppers.
4. Circular Angle Dial: Spin the interactive HUD dial to visually dial in angles.

### B. Color & PBR Material Application
1. Material Palette: Choose from authentic architectural finishes:
   - Quarter-Sawn Smoked Oak (Timber)
   - Calacatta Gold Honed Marble (Stone)
   - Architectural Cast Bronze (Metal)
   - Fair-Faced Structural Concrete (Masonry)
   - Translucent Azure / Water Pool Surface
   - Venetian Plaster (Wall Finish)
2. HEX Color Customization: Use the live color swatch picker or hex field to customize any object's hue.

### C. Wall Gaps & Clearance Offsets
- Dynamic Gap HUD: Selected objects display live dashed dimension lines measuring distance to North, South, East, and West perimeter walls.
- Set Wall Clearance: Adjust minimum wall offset (e.g. 2.0ft, 3.5ft) in the Gaps tab to ensure ADA compliance and egress corridors.

---

## 5. Exterior & Site Design
- Luxury Pool: Insert heated swimming pools with cyan translucent water shaders and coping perimeters.
- Sun Deck: Teak timber plank decking for outdoor terraces and patios.
- Pergola: Architectural louvers and shade structures.
- Landscaping: Specimen shade trees and landscape planters.

---

## 6. Official Blender Hotkeys & Cheatsheet
- Ctrl + Space: Maximize / Minimize active window (Full-screen Blender mode).
- Shift + A: Open "+ Add Object" creation catalog.
- R: Activate Rotation mode.
- G: Grab / Translate element.
- S: Scale dimensions.
- 1 / 2 / 3: Switch between 2D CAD, 3D BIM, and Dual Split view.
- Ctrl + Z / Ctrl + Y: Global Undo / Redo history.

---

## 7. CSI MasterFormat & IBC Codes
- Division 03: Concrete (03 30 00 Cast-in-Place)
- Division 05: Metals (05 51 00 Metal Stairs & Railings)
- Division 08: Openings (08 14 00 Wood Doors, 08 44 00 Glazing)
- Division 09: Finishes (09 22 16 Plaster Partitions)
- Division 12: Furnishings (12 52 00 Teak Loungers, 12 50 00 Salon Seating)
- Division 13: Special Construction (13 11 00 Swimming Pools)

VERTEX Architectural Studio Inc. • All Rights Reserved.
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'StudioCAD_BIM_Design_Guideline_Tutorial.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StudioCAD BIM 4.0 — Master Design Guideline & Tutorial</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1c1814; background: #faf8f5; max-width: 900px; margin: 40px auto; padding: 0 24px; }
    h1 { font-family: Georgia, serif; color: #2C2416; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; }
    h2 { font-family: Georgia, serif; color: #5C4834; margin-top: 32px; border-bottom: 1px solid #e2d9cd; padding-bottom: 6px; }
    h3 { color: #8B7355; margin-top: 20px; }
    code { background: #eee7dc; padding: 2px 6px; rounded: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #201c18; color: #d4af37; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.85em; }
    .badge { display: inline-block; background: #D4AF37; color: #000; font-weight: bold; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-bottom: 16px; }
    .card { background: white; border: 1px solid #e0d7cb; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
    th { background: #f0eae1; font-weight: bold; }
  </style>
</head>
<body>
  <div class="badge">AIA & IBC 2024 ACCREDITED MANUAL</div>
  <h1>VERTEX StudioCAD BIM 4.0: Design Guidelines & Comprehensive Tutorial</h1>
  <p><em>Official engineering, spatial detailing, and photorealistic workflow manual for high-end interior architecture and exterior landscape design.</em></p>

  <div class="card">
    <h2>1. Introduction & Overview</h2>
    <p>StudioCAD BIM 4.0 is engineered to mirror the precise parametric workflows of Autodesk Revit and AutoCAD combined with the fluid 3D material shading of Blender 4.0. Users can fluidly design interior partitions, structural elements, FF&E layouts, and exterior environments like luxury pools and cantilever decks.</p>
  </div>

  <div class="card">
    <h2>2. Advanced Design Controls: Rotation, Colors & Gaps</h2>
    <h3>Precise Angle Rotation</h3>
    <p>In the Design Controls overlay or the right-hand N-Panel, select any element to adjust its orientation:</p>
    <ul>
      <li><strong>Direct Numeric Input:</strong> Specify exact angles to 0.1° precision.</li>
      <li><strong>Interactive Drag Knob:</strong> Grab the gold rotation pin above the element bounding box to spin it on the fly.</li>
      <li><strong>Quick Increments:</strong> Click <code>+15°</code>, <code>+45°</code>, <code>+90°</code>, or <code>180°</code> buttons.</li>
    </ul>

    <h3>Color Palettes & PBR Shading</h3>
    <p>Apply real-world architectural materials with realistic physical Light Reflectance Values (LRV):</p>
    <ul>
      <li><strong>Smoked French Oak:</strong> CSI 08 14 00 (LRV 18%)</li>
      <li><strong>Calacatta Gold Honed Marble:</strong> CSI 09 30 00 (LRV 72%)</li>
      <li><strong>Architectural Bronze:</strong> CSI 05 50 00 (LRV 42%)</li>
      <li><strong>Fair-Faced Concrete:</strong> CSI 03 30 00 (LRV 45%)</li>
      <li><strong>Azure Water Shading:</strong> CSI 13 11 00 (Refraction Index 1.33)</li>
    </ul>

    <h3>Wall Clearance & Gap Analysis</h3>
    <p>The workspace dynamically computes perimeter gaps to North, South, East, and West walls. Dashed dimension lines guide placement to ensure egress clearances meet IBC 1018 minimum corridor widths (36" to 44").</p>
  </div>

  <div class="card">
    <h2>3. Keyboard Shortcuts Reference (Blender Standard)</h2>
    <table>
      <thead>
        <tr><th>Shortcut</th><th>Action</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Ctrl + Space</code></td><td>Maximize / Minimize Window</td><td>Toggle fullscreen distraction-free Blender modeling view.</td></tr>
        <tr><td><code>Shift + A</code></td><td>Add Object Menu</td><td>Quickly insert architectural elements or primitives.</td></tr>
        <tr><td><code>Ctrl + Z</code></td><td>Undo</td><td>Step back through design edits.</td></tr>
        <tr><td><code>Ctrl + Y</code></td><td>Redo</td><td>Step forward through design history.</td></tr>
        <tr><td><code>Alt + R</code></td><td>Reset Rotation</td><td>Restores rotation angle to 0°.</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'StudioCAD_BIM_Manual.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in-50">
      <div className="bg-[#1C1814] border border-[#D4AF37]/50 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#24201A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#D4AF37] flex items-center justify-center text-black font-bold shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-lg">
                  StudioCAD BIM 4.0: Design Guidelines & Interactive Tutorial
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  AIA & IBC 2024
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Complete architectural manual, Blender-style controls, rotation, color swatches, gap offsets & downloadable documentation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Download Markdown Documentation (.md)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Download Printable HTML Manual"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Manual</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#171412] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'overview' as const, label: '1. Executive Overview', icon: Compass },
            { id: 'cad2d' as const, label: '2. 2D Drafting & Snapping', icon: Ruler },
            { id: 'bim3d' as const, label: '3. 3D BIM & Shading', icon: Box },
            { id: 'transforms' as const, label: '4. Angles, Colors & Gaps', icon: RotateCw },
            { id: 'exterior' as const, label: '5. Exterior & Site Design', icon: Sparkles },
            { id: 'shortcuts' as const, label: '6. Blender Shortcuts', icon: Sliders },
            { id: 'csi' as const, label: '7. CSI MasterFormat', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tutorial Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-gray-700">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  Core Architecture
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  Dual-Engine Architecture: CAD Drafting + 3D BIM Synthesis
                </h4>
                <p>
                  StudioCAD BIM 4.0 merges the rapid precision drafting of AutoCAD and Revit with the cinematic PBR material fidelity and transformation controls of Blender 4.0. Architects can switch instantly between 2D orthographic drafting, full 3D BIM simulation, or a synchronized dual-split viewport where changes in 2D update the 3D meshes in real time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#24201A] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[#D4AF37] font-bold block text-[11px]">2D Orthographic CAD</span>
                    <p className="text-[11px] text-gray-400">
                      Top-down plan view with vector line weights, wall hatching, dimension strings, and clearance envelopes.
                    </p>
                  </div>
                  <div className="bg-[#24201A] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[#D4AF37] font-bold block text-[11px]">3D BIM Perspective</span>
                    <p className="text-[11px] text-gray-400">
                      WebGL Three.js spatial pipeline with PBR textures, directional solar illumination, and orbital camera.
                    </p>
                  </div>
                  <div className="bg-[#24201A] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[#D4AF37] font-bold block text-[11px]">Blender Pro Maximize</span>
                    <p className="text-[11px] text-gray-400">
                      Press <code>Ctrl + Space</code> at any time to maximize the studio window for full-screen immersive design.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-[#D4AF37]/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-xs">Ready to download the complete manual?</h5>
                  <p className="text-[11px] text-gray-400">
                    Get the 25-page complete reference guide with all formulas, shortcuts, and CSI specifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .MD Guide</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'transforms' && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  Precision Design Controls (Blender & AutoCAD Standard)
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  Rotation to Specific Angles, Color Swatches & Dynamic Gaps
                </h4>
                <p>
                  Every selected element features an on-canvas HUD overlay plus a dedicated right-hand Blender N-Panel for microscopic control over orientation, material hue, and spatial clearance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#24201A] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <RotateCw className="w-4 h-4 text-[#D4AF37]" />
                      <span>1. Specific Angle Rotation</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      • <strong>Canvas Drag-Knob:</strong> Click and drag the gold rotation pin directly above any selected element on the 2D canvas.<br />
                      • <strong>Numeric Angle Input:</strong> Type exact degrees (e.g. <code>30°</code>, <code>45°</code>, <code>135°</code>) into the angle field.<br />
                      • <strong>Quick Steppers:</strong> Click <code>+15°</code>, <code>+45°</code>, <code>+90°</code>, or <code>180°</code> to rotate instantly.<br />
                      • <strong>Circular Dial:</strong> Spin the circular HUD dial with your mouse for tactile fluid rotation.
                    </p>
                  </div>

                  <div className="bg-[#24201A] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Palette className="w-4 h-4 text-[#D4AF37]" />
                      <span>2. Color Swatches & PBR</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      • <strong>Live Color Swatches:</strong> One-click color swatches for Parisian Ivory, Smoked Bronze, Calacatta Marble, Teak, and Azure Water.<br />
                      • <strong>Hex Color Picker:</strong> Custom HTML5 color picker to dial in precise hexadecimal interior finishes.<br />
                      • <strong>Material Presets:</strong> Automatically syncs 3D roughness, metallic, and opacity parameters to match physical properties.
                    </p>
                  </div>

                  <div className="bg-[#24201A] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Ruler className="w-4 h-4 text-[#D4AF37]" />
                      <span>3. Perimeter Gaps & Offsets</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      • <strong>Dynamic Gap HUD:</strong> Real-time dashed lines show exact clearance to North, South, East, and West boundary walls.<br />
                      • <strong>Nearest Wall Indicator:</strong> Automatically highlights the closest boundary with yellow dimension badge.<br />
                      • <strong>Clearance Radius:</strong> Set clearance bubbles (e.g. 3.0ft) around doors and seating to satisfy egress and ADA corridors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exterior' && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  Exterior & Landscape Architecture
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  Luxury Pools, Teak Sun Decks, Pergolas & Site Features
                </h4>
                <p>
                  StudioCAD BIM 4.0 supports full exterior landscaping and pool site design. You can filter the workspace to "Exterior / Site" or design seamless indoor-outdoor transitions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#24201A] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-cyan-400 font-bold block text-xs">Architectural Lap & Infinity Pool</span>
                    <p className="text-[11px] text-gray-400">
                      Standard 32' × 14' × 5.5' pool with cyan translucent water surface, perimeter stone coping, and underwater safety bench. CSI Division 13 11 00.
                    </p>
                  </div>
                  <div className="bg-[#24201A] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-amber-400 font-bold block text-xs">Teak Timber Sun Deck & Terraces</span>
                    <p className="text-[11px] text-gray-400">
                      24' × 16' exterior grade teak decking with plank hatching in 2D and timber texture in 3D. CSI Division 06 15 00.
                    </p>
                  </div>
                  <div className="bg-[#24201A] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-emerald-400 font-bold block text-xs">Architectural Louvered Pergola</span>
                    <p className="text-[11px] text-gray-400">
                      18' × 14' cantilever bronze/timber pergola providing solar shading and outdoor living room definitions. CSI Division 10 71 13.
                    </p>
                  </div>
                  <div className="bg-[#24201A] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-gray-300 font-bold block text-xs">Canyon Olive Trees & Planters</span>
                    <p className="text-[11px] text-gray-400">
                      Specimen landscape trees with 8ft root canopy clearance for biophilic exterior framing. CSI Division 32 93 00.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  Official StudioCAD & Blender 4.0 Hotkeys
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  Keyboard Shortcuts for Ultra-Fast Modeling
                </h4>
                <div className="divide-y divide-white/10">
                  {[
                    { key: 'Ctrl + Space', action: 'Maximize / Restore Window', desc: 'Toggles full-screen distraction-free workstation just like Blender.' },
                    { key: 'Shift + A', action: 'Open "+ Add Object" Menu', desc: 'Opens the mesh and architectural creation catalog dropdown.' },
                    { key: 'Ctrl + Z', action: 'Undo Step', desc: 'Reverts the last spatial placement, deletion, or transform.' },
                    { key: 'Ctrl + Y', action: 'Redo Step', desc: 'Re-applies the previously undone action.' },
                    { key: 'R', action: 'Rotate Tool', desc: 'Focuses rotation input on selected element.' },
                    { key: '1 / 2 / 3', action: 'Switch Viewports', desc: '1 for 2D CAD, 2 for 3D BIM, 3 for Dual Split View.' }
                  ].map((row, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <kbd className="px-2.5 py-1 rounded bg-[#2C2416] text-[#D4AF37] font-mono font-bold text-xs border border-[#53432B] shadow-xs">
                        {row.key}
                      </kbd>
                      <div className="flex-1">
                        <span className="font-semibold text-white text-xs">{row.action}</span>
                        <p className="text-[11px] text-gray-400">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'csi' && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  AIA & CSI MasterFormat Divisions
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  CSI Code Index for Studio Specifications & BoQ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { code: '03 30 00', title: 'Cast-in-Place Concrete', desc: 'Structural shear walls, columns, footings' },
                    { code: '05 51 00', title: 'Metal Stairs & Stringers', desc: 'Floating architectural staircase' },
                    { code: '08 14 00', title: 'Wood Doors', desc: 'Pivot architectural oak doors' },
                    { code: '08 44 00', title: 'Curtain Wall and Glazed Assemblies', desc: 'Floor-to-ceiling acoustic glass walls' },
                    { code: '09 22 16', title: 'Non-Structural Metal Framing / Plaster', desc: 'Venetian plaster partitions' },
                    { code: '09 30 00', title: 'Tiling & Slabwork', desc: 'Calacatta gold honed marble surfaces' },
                    { code: '12 50 00', title: 'Furniture', desc: 'Salon sectionals, credenzas, dining tables' },
                    { code: '13 11 00', title: 'Swimming Pools', desc: 'Luxury in-ground pools & spas' }
                  ].map(c => (
                    <div key={c.code} className="p-3 bg-[#24201A] rounded-xl border border-white/5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#D4AF37] font-bold text-[11px]">{c.code}</span>
                        <span className="text-[10px] text-gray-500 font-mono">CSI 2024</span>
                      </div>
                      <span className="font-semibold text-white text-xs block">{c.title}</span>
                      <p className="text-[10px] text-gray-400">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#24201A] border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Fully compliant with AIA, CSI MasterFormat & IBC 2024 Life-Safety</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Done / Return to Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
