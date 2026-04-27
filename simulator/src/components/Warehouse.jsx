import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { COLORS } from '../data/constants';
import { Rack, AisleLine, ZoneTape, DockDoor, ConveyorBelt, RFIDPortal, Desk, RoboticArm, TabletStand, SecurityCamera, BoxStack, LongTable, WoodenPallet } from './Agents';
import { GlassOffice } from './GlassOffice';


// ── GRAY CONCRETE FLOOR ──
function ConcreteFloor({ width, depth }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#78909c" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Concrete seam lines */}
      {Array.from({ length: Math.floor(width / 8) }).map((_, i) => (
        <mesh key={`h${i}`} position={[-width / 2 + (i + 1) * 8, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, depth]} />
          <meshStandardMaterial color="#607d8b" />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(depth / 8) }).map((_, i) => (
        <mesh key={`v${i}`} position={[0, 0.01, -depth / 2 + (i + 1) * 8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, 0.05]} />
          <meshStandardMaterial color="#607d8b" />
        </mesh>
      ))}
    </>
  );
}

// ── WALL SEGMENT ──
function Wall({ x1, z1, x2, z2, h = 4 }) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  return (
    <mesh position={[(x1 + x2) / 2, h / 2, (z1 + z2) / 2]}
      rotation={[0, -Math.atan2(dz, dx), 0]} castShadow receiveShadow>
      <boxGeometry args={[len, h, 0.28]} />
      <meshStandardMaterial color="#455a64" roughness={0.8} />
    </mesh>
  );
}

// ── ZONE LABEL ON FLOOR ──
function ZoneLabel({ position, text, color = 'white', size = 0.7 }) {
  return (
    <Text position={[position[0], 0.06, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={size} color={color}
      anchorX="center" anchorY="middle"
      outlineWidth={0.04} outlineColor="black"
      maxWidth={14}>
      {text}
    </Text>
  );
}

// ══════════════════════════════════════════
//  AS-IS WAREHOUSE  (50 × 35, hw=25, hd=17.5)
// ══════════════════════════════════════════
// Zones (approx):
//   Reception:  x=-25..-18  z=1..17.5
//   Storage:    x=-18..5    z=-17.5..8    (general, no ABC)
//   Picking:    x=5..17     z=-8..6
//   Dispatch:   x=15..25    z=1..17.5
//
// Aisles (yellow center line):
//   Horizontal:  z=-12, z=-6, z=0
//   Vertical:    x=-16, x=-10, x=-4, x=2
// ══════════════════════════════════════════
export function AsIsWarehouse() {
  const hw = 25, hd = 17.5;
  const W = hw * 2, D = hd * 2;

  // Rack grid: 5 cols × 4 rows inside storage area
  const rackCols = [-21, -16, -11, -6, -1];
  const rackRows = [-14, -9, -4, 1];
  const categories = ['standard', 'standard', 'fragile', 'electronic', 'standard', 'electronic', 'fragile', 'standard'];

  const allRacks = [];
  rackCols.forEach((x, ci) => {
    rackRows.forEach((z, ri) => {
      allRacks.push({ x, z, cat: categories[(ci * 4 + ri) % categories.length] });
    });
  });

  // Extra racks (red circles from previous request)
  const extraRacks = [
    { x: 4, z: -14, cat: 'standard' }, { x: 9, z: -14, cat: 'fragile' }, { x: 14, z: -14, cat: 'electronic' },
    { x: 4, z: -9, cat: 'fragile' }, { x: 9, z: -9, cat: 'standard' }, { x: 14, z: -9, cat: 'standard' },
    { x: 4, z: -4, cat: 'electronic' },
    { x: 4, z: 6, cat: 'standard' },
  ];
  extraRacks.forEach(r => allRacks.push(r));

  // Aisle-blocking racks (white circles from user drawing)
  const aisleRacks = [
    { x: -18.5, z: -14, cat: 'standard' },
    { x: -13.5, z: -14, cat: 'fragile' },
    { x: -8.5, z: -14, cat: 'electronic' },
    { x: -8.5, z: -9, cat: 'standard' },
    { x: -18.5, z: -4, cat: 'fragile' },
    { x: -23.5, z: -4, cat: 'standard' },
  ];
  aisleRacks.forEach(r => allRacks.push(r));

  // Green-circle racks (user markings on screenshot) — fill grid gaps
  // NOTE: racks at x=9,14 inside picking zone (z≥-8) are intentionally excluded
  const greenCircleRacks = [
    // Extend main columns (x=-21..−1) to row z=6
    { x: -21, z: 6, cat: 'standard' },
    { x: -16, z: 6, cat: 'fragile' },
    { x: -11, z: 6, cat: 'standard' },
    { x:  -6, z: 6, cat: 'electronic' },
    { x:  -1, z: 6, cat: 'standard' },
    // Complete column x=4 (missing z=1 — storage boundary, not in picking zone)
    { x: 4, z: 1, cat: 'fragile' },
  ];
  greenCircleRacks.forEach(r => allRacks.push(r));

  return (
    <group>
      <ConcreteFloor width={W} depth={D} />

      {/* ── WALLS WITH DOCK GAPS ── */}
      <Wall x1={-hw} z1={-hd} x2={hw} z2={-hd} /> {/* Top */}
      <Wall x1={-hw} z1={hd} x2={hw} z2={hd} /> {/* Bottom */}
      
      {/* Left Wall (Reception) */}
      <Wall x1={-hw} z1={-hd} x2={-hw} z2={6} />
      <Wall x1={-hw} z1={15} x2={-hw} z2={hd} />
      
      {/* Right Wall (Dispatch) */}
      <Wall x1={hw} z1={-hd} x2={hw} z2={6} />
      <Wall x1={hw} z1={12} x2={hw} z2={hd} />

      {/* ── ZONE FLOOR COLORS (subtle) ── */}
      {/* Reception - orange tint */}
      <mesh position={[-21.5, 0.02, 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 17]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.25} />
      </mesh>
      {/* Picking - cyan tint */}
      <mesh position={[10, 0.02, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.2} />
      </mesh>
      {/* Dispatch - blue tint */}
      <mesh position={[20, 0.02, 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 17]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>

      {/* ── ZONE BORDER TAPES ── */}
      <ZoneTape position={[-21.5, 0, 9]} size={[7, 17]} color="#f97316" />
      <ZoneTape position={[10, 0, -1]} size={[12, 14]} color="#06b6d4" />
      <ZoneTape position={[20, 0, 9]} size={[10, 17]} color="#3b82f6" />

      {/* ── AISLE YELLOW CENTER LINES ── */}
      {/* Horizontal aisles */}
      <AisleLine x1={-25} z1={-12} x2={15} z2={-12} />
      <AisleLine x1={-25} z1={-6} x2={15} z2={-6} />
      <AisleLine x1={-25} z1={0} x2={5} z2={0} />
      {/* Vertical aisles (between rack columns) */}
      <AisleLine x1={-18.5} z1={-17} x2={-18.5} z2={8} />
      <AisleLine x1={-13.5} z1={-17} x2={-13.5} z2={8} />
      <AisleLine x1={-8.5} z1={-17} x2={-8.5} z2={8} />
      <AisleLine x1={-3.5} z1={-17} x2={-3.5} z2={8} />
      <AisleLine x1={5} z1={-8} x2={5} z2={6} />
      {/* Aisle zone stripes (gray) */}
      {[-18.5, -13.5, -8.5, -3.5].map((x, i) => (
        <mesh key={i} position={[x, 0.015, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 25]} />
          <meshStandardMaterial color="#90a4ae" transparent opacity={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.015, -9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 2.5]} />
        <meshStandardMaterial color="#90a4ae" transparent opacity={0.35} />
      </mesh>

      {/* ── RACKS (dense, mixed categories = no order) ── */}
      {allRacks.map((r, i) => (
        <Rack key={i} position={[r.x, 0, r.z]} category={r.cat} showSign={i % 3 === 0} height={2.2} />
      ))}

      {/* ── FORMER FLAMMABLE ZONE (now just a rack, no markings) ── */}
      <Rack position={[-22, 0, -14]} category="standard" showSign={false} height={2.2} />

      {/* ── DOCK DOORS ── */}
      {/* Reception + dispatch share left wall — chaotic */}
      <DockDoor position={[-hw, 0, 9]} rotation={[0, Math.PI / 2, 0]} label="MUELLE ENTRADA/SALIDA" color="#f97316" />
      <DockDoor position={[-hw, 0, 12]} rotation={[0, Math.PI / 2, 0]} label="MUELLE ENTRADA/SALIDA" color="#f97316" />
      {/* Dispatch dock (right wall) */}
      <DockDoor position={[hw, 0, 9]} rotation={[0, -Math.PI / 2, 0]} label="DESPACHO" color="#3b82f6" />
      <DockDoor position={[hw, 0, 12]} rotation={[0, -Math.PI / 2, 0]} label="DESPACHO" color="#3b82f6" />

      {/* ── MESSY BOX STACKS & TABLES (AS-IS Obstructions) ── */}
      {/* Reception area boxes */}
      <BoxStack position={[-20, 0, 8]} rows={3} cols={2} height={4} rotation={[0, 0.2, 0]} />
      <BoxStack position={[-22, 0, 11]} rows={2} cols={4} height={3} rotation={[0, -0.1, 0]} />
      <BoxStack position={[-19, 0, 14]} rows={3} cols={3} height={3} rotation={[0, 0.4, 0]} />
      
      {/* Dispatch area boxes */}
      <BoxStack position={[20, 0, 8]} rows={4} cols={2} height={4} rotation={[0, -0.2, 0]} />
      <BoxStack position={[22, 0, 11]} rows={2} cols={3} height={3} rotation={[0, 0.1, 0]} />

      {/* Front edge boxes (White circles) */}
      <BoxStack position={[-12, 0, 15]} rows={2} cols={3} height={2} rotation={[0, 0.1, 0]} />
      <BoxStack position={[-4, 0, 15]} rows={3} cols={2} height={3} rotation={[0, -0.2, 0]} />
      <BoxStack position={[4, 0, 15]} rows={2} cols={4} height={2} rotation={[0, 0.3, 0]} />
      <BoxStack position={[12, 0, 15]} rows={3} cols={3} height={3} rotation={[0, -0.1, 0]} />

      {/* ── WOODEN PALLETS (Green and Brown circles) ── */}
      {/* Brown circles (top edge, z=-17) */}
      <WoodenPallet position={[-13, 0, -16.5]} hasBoxes={true} rotation={[0, 0.1, 0]} />
      <WoodenPallet position={[-7, 0, -16.8]} hasBoxes={false} rotation={[0, -0.2, 0]} />
      <WoodenPallet position={[-1, 0, -16.5]} hasBoxes={true} rotation={[0, 0.05, 0]} />
      
      {/* Green circles (aisle blockages near storage) */}
      <WoodenPallet position={[10, 0, -12]} hasBoxes={true} rotation={[0, 0.4, 0]} />
      <WoodenPallet position={[1, 0, -7]} hasBoxes={true} rotation={[0, -0.1, 0]} />
      <WoodenPallet position={[9, 0, 3]} hasBoxes={true} rotation={[0, 0.2, 0]} />

      {/* NEW Green circles (open area blockages between docks, z ~ 12-15) */}
      <WoodenPallet position={[0, 0, 13]} hasBoxes={true} rotation={[0, 0.5, 0]} />
      <WoodenPallet position={[-8, 0, 12.5]} hasBoxes={true} rotation={[0, -0.3, 0]} />
      <WoodenPallet position={[8, 0, 14]} hasBoxes={true} rotation={[0, 0.1, 0]} />
      <WoodenPallet position={[-15, 0, 13.5]} hasBoxes={true} rotation={[0, -0.6, 0]} />
      
      {/* Picking zone tables (LongTables without PC/Chair) */}
      <LongTable position={[10, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
      <LongTable position={[10, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
      <LongTable position={[14, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
      <LongTable position={[14, 0, 2]} rotation={[0, Math.PI / 2, 0]} />

      {/* ── GLASS OFFICE (Top Right) ── */}
      <GlassOffice position={[15, 0, -15]} width={8} depth={7} wallH={2.6} label="OFICINA" />
      <Desk position={[18, 0, -13.25]} rotation={[0, Math.PI, 0]} />
      <Desk position={[18, 0, -9.75]} rotation={[0, Math.PI, 0]} />


      {/* ── ZONE LABELS ── */}
      <ZoneLabel position={[-21.5, 0, 13]} text="RECEPCIÓN Y DESCARGA" color="#fed7aa" size={0.6} />
      <ZoneLabel position={[10, 0, -1]} text="PICKING Y PACKING (MANUAL)" color="#a5f3fc" size={0.55} />
      <ZoneLabel position={[20, 0, 13]} text="DESPACHO" color="#93c5fd" size={0.7} />
      <ZoneLabel position={[-6, 0, -6]} text="ALMACENAMIENTO GENERAL" color="#fed7aa" size={0.65} />
      <ZoneLabel position={[-6, 0, -4]} text="(Sin clasificación ABC)" color="#fca5a5" size={0.45} />

      {/* ── CHAOS FLOW ARROWS (dashed red line) ── */}
      <ChaosFlowLine />
    </group>
  );
}

function ChaosFlowLine() {
  const pts = [
    [-24, 0.1, 9], [-18, 0.1, 9], [-18, 0.1, 0],
    [-6, 0.1, -6], [5, 0.1, -2], [10, 0.1, 0],
    [10, 0.1, -4], [-6, 0.1, -12], [-18, 0.1, -6],
    [-18, 0.1, 4], [-24, 0.1, 9],
  ].map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(pts);
  const geom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  return (
    <line geometry={geom}>
      <lineDashedMaterial color="#ef4444" dashSize={0.9} gapSize={0.45} linewidth={2} />
    </line>
  );
}


// ══════════════════════════════════════════
//  TO-BE U-SHAPE  (55 × 70, hw=27.5, hh=35)
// ══════════════════════════════════════════
// ── PROPOSAL (TO-BE) WAREHOUSE: U-FLOW AUTOMATED ──
export function ToBeWarehouse() {
  const hw = 40; // Total width = 80
  const hh = 25; // Total depth = 50

  // 7 Vertical columns of back-to-back racks (like blueprint)
  const xCols = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5, 17.5];

  // Product types per zone for a chip manufacturing company
  const ZONE_PRODUCTS = {
    A: ['Procesadores CPU', 'Memorias RAM', 'Microcontroladores'],
    B: ['Sensores Ópticos', 'Módulos WiFi', 'PCBs'],
    C: ['Capacitores SMD', 'Resistencias', 'Conectores'],
  };

  // Generate dense continuous blocks of racks
  const generateRacksZ = (startZ, count, category, sector) => {
    const racks = [];
    const productList = ZONE_PRODUCTS[sector] || [];
    const mid = Math.floor(count / 2);
    xCols.forEach((col, ci) => {
      const productIdx = ci < 2 ? 0 : ci < 5 ? 1 : 2;
      const product = productList[productIdx] || '';
      const aisleLeft = ci + 1;
      const aisleRight = ci + 2;
      const x1 = col - 0.275;
      const x2 = col + 0.275;
      for (let i = 0; i < count; i++) {
        const z = startZ + i * 1.4;
        const showSign = i === mid;
        racks.push({ x: x1, z, cat: category, showSign, label: `${sector}${aisleLeft}-${product}` });
        racks.push({ x: x2, z, cat: category, showSign, label: `${sector}${aisleRight}-${product}` });
      }
    });
    return racks;
  };

  // Zones following the flow (Top to Bottom)
  // Zone C: 10 racks = 14m length
  const rackZoneC = generateRacksZ(-22, 10, 'cool', 'C');
  // Zone B: 9 racks = 12.6m length (starts after 3m cross aisle)
  const rackZoneB = generateRacksZ(-5, 9, 'fresh', 'B');
  // Zone A: 8 racks = 11.2m length (High Rotation - Blue FIFO)
  const rackZoneA = generateRacksZ(10, 8, 'fragile', 'A');  

  return (
    <group>
      {/* ── BUILDING PERIMETER ── */}
      <ConcreteFloor width={hw * 2} depth={hh * 2} />
      
      {/* Top Wall with 2 gaps for Reception at x=-35, x=-25 and 2 gaps for Dispatch at x=26, x=34 */}
      <Wall x1={-hw} z1={-hh} x2={-38} z2={-hh} />
      <Wall x1={-32} z1={-hh} x2={-28} z2={-hh} />
      <Wall x1={-22} z1={-hh} x2={23} z2={-hh} />
      <Wall x1={29} z1={-hh} x2={31} z2={-hh} />
      <Wall x1={37} z1={-hh} x2={hw} z2={-hh} />
      
      {/* Bottom Wall */}
      <Wall x1={-hw} z1={hh} x2={hw} z2={hh} />
      
      {/* Left Wall */}
      <Wall x1={-hw} z1={-hh} x2={-hw} z2={hh} />
      
      {/* Right Wall (Solid) */}
      <Wall x1={hw} z1={-hh} x2={hw} z2={hh} />

      {/* ── INTERNAL WALLS / DIVIDERS ── */}
      {/* Divider for Reception Area */}
      <Wall x1={-18} z1={-hh} x2={-18} z2={-2} />

      {/* ── 1. RECEPCIÓN Y DESCARGA (TOP LEFT) ── */}
      <mesh position={[-29, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 38]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.2} />
      </mesh>
      <ZoneLabel position={[-29, 0, 10]} text="ÁREA DE RECEPCIÓN Y DESCARGA AUTOMATIZADA" color="#e5e7eb" size={0.6} />

      {/* Reception Conveyors (Vertical lines from Docks) */}
      {/* Dock 1 (x=-35) down to Machine (z=2) */}
      <ConveyorBelt position={[-35, 0, -11]} rotation={[0, Math.PI/2, 0]} size={[26, 0.8]} speed={-1.5} />
      <ConveyorBelt position={[-32.5, 0, 2]} rotation={[0, 0, 0]} size={[5, 0.8]} speed={1.5} />
      
      {/* Dock 2 (x=-25) down to Machine (z=2) */}
      <ConveyorBelt position={[-25, 0, -11]} rotation={[0, Math.PI/2, 0]} size={[26, 0.8]} speed={-1.5} />
      <ConveyorBelt position={[-27.5, 0, 2]} rotation={[0, 0, 0]} size={[5, 0.8]} speed={-1.5} />

      {/* Processing Machine (Green Square) */}
      <mesh position={[-30, 0.5, 2]}>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Text position={[-30, 1.1, 2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#ffffff">PROC</Text>

      {/* ── NEW CONVEYOR ROUTING (FROM CLASSIFICATION TO ZONE A) ── */}
      {/* Downward belt from Machine (stops before bottom aisle) */}
      <ConveyorBelt position={[-30, 0, 10]} rotation={[0, Math.PI/2, 0]} size={[16, 0.8]} speed={-1.5} />
      
      {/* Branch to the right before transition */}
      <ConveyorBelt position={[-28.5, 0, 18]} rotation={[0, 0, 0]} size={[3, 0.8]} speed={1.5} />
      <RoboticArm position={[-26, 0, 18]} />

      {/* New Transition Area (moved up to avoid aisle) */}
      <ZoneTape position={[-30, 0, 19]} size={[8, 4]} color="#facc15" />
      <Text position={[-30, 0.05, 19]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#facc15" anchorX="center">
        ÁREA DE TRANSICIÓN FIFO
      </Text>

      {/* AGV Transfer Point (Bottom Left) */}
      <ZoneTape position={[-29, 0, 6]} size={[10, 8]} color="#facc15" />
      <Text position={[-29, 0.05, 6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#facc15" anchorX="center">
        SISTEMA ROBÓTICO DE CLASIFICACIÓN
      </Text>
      <RoboticArm position={[-29, 0, 6]} />
      
      <DockDoor position={[-35, 0, -hh]} rotation={[0, 0, 0]} label="RECIBO 1" color="#64748b" />
      <DockDoor position={[-25, 0, -hh]} rotation={[0, 0, 0]} label="RECIBO 2" color="#64748b" />

      {/* ── ROBOTIC ARMS IN STORAGE AISLES (pick from shelves → AGV) ── */}
      {/* Solo 1 brazo robótico en el almacén como se solicitó */}
      <RoboticArm position={[-10, 0,  -2]} rotation={[0,  Math.PI / 4, 0]} />

      {/* ── 2. ALMACENAMIENTO ABC (CENTER) ── */}
      {/* Zone Backgrounds */}
      <mesh position={[2.5, 0.01, -15]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[36, 14.5]} /><meshStandardMaterial color="#fef08a" transparent opacity={0.2} /></mesh>
      <mesh position={[2.5, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[36, 13.5]} /><meshStandardMaterial color="#fed7aa" transparent opacity={0.2} /></mesh>
      <mesh position={[2.5, 0.01, 15.5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[36, 12]} /><meshStandardMaterial color="#fca5a5" transparent opacity={0.2} /></mesh>
      
      {/* Continuous Rack Blocks */}
      {rackZoneC.map((r, i) => <Rack key={`c${i}`} position={[r.x, 0, r.z]} rotation={[0, Math.PI/2, 0]} category={r.cat} height={2.5} showSign={r.showSign} label={r.label} />)}
      {rackZoneB.map((r, i) => <Rack key={`b${i}`} position={[r.x, 0, r.z]} rotation={[0, Math.PI/2, 0]} category={r.cat} height={2.5} showSign={r.showSign} label={r.label} />)}
      {/* Zone A Racks (FIFO) */}
      {rackZoneA.map((r, i) => (
        <group key={`a-fifo-${i}`}>
          <Rack position={[r.x, 0, r.z]} rotation={[0, Math.PI/2, 0]} category="fragile" height={2.0} showSign={r.showSign} label={r.label} />
          {/* FIFO Feeding Belt behind the rack (without support legs blocking aisles) */}
          <mesh position={[r.x, 0.48, r.z - 0.6]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[1.3, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[r.x, 0.4, r.z - 0.6]} castShadow>
            <boxGeometry args={[1.4, 0.15, 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Vertical Aisles (double yellow lines) */}
      {[-10, -5, 0, 5, 10, 15].map(x => (
        <group key={`v-aisle-${x}`}>
          <AisleLine x1={x - 1} z1={-22} x2={x - 1} z2={21} width={0.15} />
          <AisleLine x1={x + 1} z1={-22} x2={x + 1} z2={21} width={0.15} />
        </group>
      ))}
      {/* Horizontal Cross Aisles */}
      <AisleLine x1={-15} z1={-6.5} x2={20} z2={-6.5} />
      <AisleLine x1={-15} z1={8.8} x2={20} z2={8.8} />

      {/* Main Bottom Highway for U-Flow (The bottom empty space) */}
      <mesh position={[0, 0.01, 23]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[75, 4]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.15} /></mesh>
      <AisleLine x1={-38} z1={22} x2={38} z2={22} color="#38bdf8" />
      <AisleLine x1={-38} z1={24} x2={38} z2={24} color="#38bdf8" />
      <ZoneLabel position={[0, 0, 23]} text="RED DE FLUJO DE MATERIALES EN FORMA DE 'U' - SIN CRUCES" color="#38bdf8" size={0.6} />

      {/* ── 3. PICKING Y PACKING (RIGHT SIDE) ── */}
      <mesh position={[32, 0.02, 12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 24]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} />
      </mesh>
      
      {/* Main Vertical Picking Belt (starts above bottom aisle) */}
      <ConveyorBelt position={[26, 0, 11.25]} rotation={[0, Math.PI/2, 0]} size={[15.5, 0.8]} speed={1.5} />
      
      {/* Single robotic arm in picking area */}
      <RoboticArm position={[28, 0, 15]} />

      {/* Desks with blue mats */}
      {[10, 18].map((z, i) => (
        <group key={`pick${i}`}>
          <mesh position={[33, 0.01, z]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <Desk position={[33, 0, z]} rotation={[0, -Math.PI/2, 0]} />
        </group>
      ))}

      {/* Orange Processor Box */}
      <mesh position={[26, 0.5, 1.5]}>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <Text position={[26, 1.1, 1.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#ffffff">PROC</Text>

      {/* ── 4. DESPACHO (TOP RIGHT) ── */}
      <mesh position={[32, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.2} />
      </mesh>
      
      {/* Belts from Processor to Top Docks */}
      {/* Belt straight UP to Dock 1 (x=26) */}
      <ConveyorBelt position={[26, 0, -12.5]} rotation={[0, Math.PI/2, 0]} size={[24, 0.8]} speed={1.5} />
      
      {/* Belt right to Dock 2 (x=34) then UP */}
      <ConveyorBelt position={[30, 0, -0.5]} rotation={[0, 0, 0]} size={[8, 0.8]} speed={1.5} />
      <ConveyorBelt position={[34, 0, -12.5]} rotation={[0, Math.PI/2, 0]} size={[24, 0.8]} speed={1.5} />

      {/* Dock Doors on Top Wall */}
      <DockDoor position={[26, 0, -hh]} rotation={[0, 0, 0]} label="DESPACHO 1" color="#64748b" />
      <DockDoor position={[34, 0, -hh]} rotation={[0, 0, 0]} label="DESPACHO 2" color="#64748b" />
      
      {/* Trucks (White Boxes outside the top wall) removed */}

      {/* ── 5. FLUJO DE MATERIALES (AGV PATHS) ── */}
      <AisleLine x1={-20} z1={-5} x2={-20} z2={19} color="#3b82f6" width={0.3} /> {/* Down from Rec */}
      <AisleLine x1={-20} z1={19} x2={26} z2={19} color="#3b82f6" width={0.3} />  {/* Across bottom to Blue Racks */}
      
      {/* ── ZONE LABELS ── */}
      <ZoneLabel position={[-29, 8.5, -22]} text="ÁREA DE RECEPCIÓN Y DESCARGA AUTOMATIZADA" color="#9ca3af" size={0.7} />
      <ZoneLabel position={[4, 8.5, -22]} text="ÁREA DE ALMACENAMIENTO AUTOMATIZADO - ZONIFICACIÓN ABC" color="#9ca3af" size={0.7} />
      {/* Zone labels float above the racks of each sector */}
      <ZoneLabel position={[4, 8.5, -15]} text="C – BAJA ROTACIÓN" color="#fcd34d" size={0.75} />
      <ZoneLabel position={[4, 8.5, -0.5]} text="B – MEDIA ROTACIÓN" color="#fb923c" size={0.75} />
      <ZoneLabel position={[4, 8.5, 15.5]} text="A – ALTA ROTACIÓN" color="#f87171" size={0.75} />
      <ZoneLabel position={[32, 8.5, 23]} text="ÁREA DE PREPARACIÓN DE PEDIDOS (Picking/Packing)" color="#0284c7" size={0.65} />
      <ZoneLabel position={[32, 8.5, -22]} text="ÁREA DE DESPACHO Y ENVÍO AUTOMATIZADO" color="#9ca3af" size={0.7} />

      {/* ── TABLETS (4) ── */}
      <TabletStand position={[-28, 0, -6]} rotation={[0, Math.PI / 4, 0]} />
      <TabletStand position={[2.5, 0, -7]} rotation={[0, -Math.PI / 4, 0]} />
      <TabletStand position={[30, 0, 8]} rotation={[0, Math.PI, 0]} />
      <TabletStand position={[30, 0, -18]} rotation={[0, Math.PI, 0]} />

      {/* ── SECURITY CAMERAS (8) ── */}
      {/* Reception area: 2 */}
      <SecurityCamera position={[-33, 3.8, -20]} />
      <SecurityCamera position={[-22, 3.8, -8]} />
      {/* Picking area: 2 */}
      <SecurityCamera position={[28, 3.8, 18]} />
      <SecurityCamera position={[28, 3.8, 6]} />
      {/* Storage aisles: 4 */}
      <SecurityCamera position={[-10, 3.8, -14]} />
      <SecurityCamera position={[0, 3.8, 2]} />
      <SecurityCamera position={[10, 3.8, -16]} />
      <SecurityCamera position={[5, 3.8, 10]} />
      {/* ── GLASS OFFICE (encloses the two desk stations) ── */}
      {/* Desks are at x=33, z=10 and z=18 with rotation [0,-PI/2,0]            */}
      {/* Office front wall faces -x direction (entrance accessible from aisle)  */}
      {/* position = front-left corner: x=30.5, z=7 | width=8 depth=14          */}
      <GlassOffice position={[30.5, 0, 7]} width={8} depth={14} wallH={2.6} label="OFICINA" />
    </group>
  );
}
