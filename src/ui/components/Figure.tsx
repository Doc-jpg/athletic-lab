import React from 'react';
import type { Pose } from '../../engine/types';

/**
 * Original stick-figure demonstrations, drawn from joint positions. Not photos of anyone; the point
 * is the shape of the movement with the key cue arrow. Each pose lists: head, neck, hip, knee, foot
 * (one or two legs), elbow, hand (one or two arms), plus an optional prop (chair, wall, step, floor).
 */
type P = [number, number];
interface Joints {
  head: P; neck: P; hip: P;
  legs: Array<{ knee: P; foot: P }>;
  arms: Array<{ elbow: P; hand: P }>;
  prop?: 'chair' | 'wall' | 'step' | 'floor' | 'dumbbell';
  arrow?: { from: P; to: P };
  caption?: string;
}

const POSES: Record<Pose, Joints> = {
  squat: { head: [50, 22], neck: [50, 32], hip: [44, 58], legs: [{ knee: [62, 66], foot: [58, 90] }, { knee: [56, 68], foot: [50, 92] }], arms: [{ elbow: [62, 40], hand: [78, 40] }], prop: 'floor', arrow: { from: [44, 58], to: [38, 70] }, caption: 'Hips back and down, heels down' },
  chairsquat: { head: [52, 22], neck: [52, 32], hip: [44, 58], legs: [{ knee: [62, 64], foot: [60, 90] }], arms: [{ elbow: [64, 40], hand: [78, 38] }], prop: 'chair', arrow: { from: [44, 58], to: [38, 66] }, caption: 'Tap the seat, do not sit' },
  splitsquat: { head: [50, 18], neck: [50, 28], hip: [50, 56], legs: [{ knee: [68, 66], foot: [68, 90] }, { knee: [40, 80], foot: [26, 90] }], arms: [{ elbow: [40, 40], hand: [30, 52] }], prop: 'floor', arrow: { from: [50, 56], to: [50, 70] }, caption: 'Straight down like an elevator' },
  stepup: { head: [50, 14], neck: [50, 24], hip: [50, 50], legs: [{ knee: [62, 56], foot: [64, 70] }, { knee: [44, 70], foot: [40, 90] }], arms: [{ elbow: [40, 36], hand: [34, 46] }], prop: 'step', arrow: { from: [64, 70], to: [64, 58] }, caption: 'Whole foot on the step' },
  bridge: { head: [16, 78], neck: [26, 76], hip: [52, 60], legs: [{ knee: [68, 56], foot: [76, 88] }], arms: [{ elbow: [34, 84], hand: [44, 88] }], prop: 'floor', arrow: { from: [52, 60], to: [52, 46] }, caption: 'Push through the heels, squeeze' },
  calfraise: { head: [50, 14], neck: [50, 24], hip: [50, 54], legs: [{ knee: [50, 70], foot: [52, 84] }], arms: [{ elbow: [62, 36], hand: [78, 34] }], prop: 'wall', arrow: { from: [52, 90], to: [52, 78] }, caption: 'Up tall, down slow' },
  wallpush: { head: [40, 24], neck: [44, 33], hip: [52, 58], legs: [{ knee: [56, 74], foot: [60, 90] }], arms: [{ elbow: [62, 36], hand: [76, 40] }], prop: 'wall', caption: 'Straight line, chest to the wall' },
  inclinepush: { head: [28, 36], neck: [36, 42], hip: [60, 60], legs: [{ knee: [72, 72], foot: [86, 88] }], arms: [{ elbow: [42, 56], hand: [48, 66] }], prop: 'chair', caption: 'Hands on the seat, body straight' },
  pushup: { head: [14, 62], neck: [24, 66], hip: [52, 70], legs: [{ knee: [70, 73], foot: [88, 78] }], arms: [{ elbow: [30, 80], hand: [36, 90] }], prop: 'floor', caption: 'Plank the whole way' },
  row: { head: [28, 36], neck: [36, 42], hip: [62, 48], legs: [{ knee: [66, 66], foot: [66, 88] }, { knee: [78, 60], foot: [84, 72] }], arms: [{ elbow: [42, 60], hand: [38, 76] }, { elbow: [36, 48], hand: [34, 64] }], prop: 'dumbbell', arrow: { from: [38, 76], to: [40, 58] }, caption: 'Elbow to the back pocket' },
  curl: { head: [50, 14], neck: [50, 24], hip: [50, 54], legs: [{ knee: [46, 72], foot: [44, 90] }, { knee: [56, 72], foot: [58, 90] }], arms: [{ elbow: [62, 42], hand: [64, 28] }], prop: 'dumbbell', arrow: { from: [66, 52], to: [66, 30] }, caption: 'Elbow stays by the side' },
  scap: { head: [50, 14], neck: [50, 24], hip: [50, 54], legs: [{ knee: [50, 72], foot: [50, 90] }], arms: [{ elbow: [34, 26], hand: [34, 10] }, { elbow: [66, 26], hand: [66, 10] }], prop: 'wall', arrow: { from: [66, 14], to: [66, 4] }, caption: 'Slide up, keep contact' },
  deadbug: { head: [14, 70], neck: [24, 70], hip: [50, 70], legs: [{ knee: [60, 56], foot: [78, 56] }, { knee: [58, 54], foot: [60, 38] }], arms: [{ elbow: [30, 54], hand: [36, 40] }, { elbow: [20, 58], hand: [8, 52] }], prop: 'floor', caption: 'Low back flat on the floor' },
  birddog: { head: [16, 46], neck: [26, 50], hip: [58, 50], legs: [{ knee: [62, 70], foot: [62, 88] }, { knee: [76, 48], foot: [92, 46] }], arms: [{ elbow: [30, 68], hand: [30, 88] }, { elbow: [14, 44], hand: [2, 42] }], prop: 'floor', caption: 'Reach long, back flat' },
  sideplank: { head: [14, 52], neck: [24, 58], hip: [52, 66], legs: [{ knee: [70, 72], foot: [88, 78] }], arms: [{ elbow: [26, 88], hand: [20, 88] }, { elbow: [30, 48], hand: [34, 30] }], prop: 'floor', arrow: { from: [52, 76], to: [52, 60] }, caption: 'Hips up, long line' },
  plank: { head: [14, 60], neck: [24, 64], hip: [52, 68], legs: [{ knee: [70, 71], foot: [88, 76] }], arms: [{ elbow: [26, 86], hand: [34, 88] }], prop: 'floor', caption: 'Belly tight, glutes tight' },
  curlup: { head: [24, 62], neck: [32, 66], hip: [56, 74], legs: [{ knee: [66, 56], foot: [78, 82] }, { knee: [72, 74], foot: [92, 76] }], arms: [{ elbow: [44, 80], hand: [52, 86] }], prop: 'floor', caption: 'Small lift, no neck pull' },
  rotation: { head: [50, 14], neck: [50, 24], hip: [50, 54], legs: [{ knee: [44, 72], foot: [42, 90] }, { knee: [56, 72], foot: [58, 90] }], arms: [{ elbow: [40, 34], hand: [60, 30] }, { elbow: [60, 34], hand: [42, 36] }], arrow: { from: [36, 30], to: [20, 36] }, caption: 'Turn the chest, hips still' },
  antirotation: { head: [50, 16], neck: [50, 26], hip: [50, 56], legs: [{ knee: [66, 64], foot: [66, 88] }, { knee: [40, 80], foot: [26, 88] }], arms: [{ elbow: [62, 36], hand: [80, 34] }], prop: 'floor', caption: 'Press out, hold square' },
  balance: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [50, 70], foot: [50, 90] }, { knee: [62, 58], foot: [60, 74] }], arms: [{ elbow: [38, 36], hand: [32, 44] }, { elbow: [62, 36], hand: [68, 44] }], caption: 'Eyes on one spot, tall' },
  heeltoe: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [52, 70], foot: [56, 90] }, { knee: [48, 70], foot: [44, 90] }], arms: [{ elbow: [28, 34], hand: [10, 34] }, { elbow: [72, 34], hand: [90, 34] }], caption: 'Heel to toe on a line' },
  crossbody: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [50, 70], foot: [50, 90] }, { knee: [66, 56], foot: [66, 70] }], arms: [{ elbow: [40, 38], hand: [62, 54] }, { elbow: [62, 36], hand: [70, 44] }], caption: 'Opposite hand, opposite knee' },
  lateral: { head: [40, 20], neck: [42, 30], hip: [50, 58], legs: [{ knee: [66, 66], foot: [74, 90] }, { knee: [36, 72], foot: [28, 90] }], arms: [{ elbow: [30, 42], hand: [24, 52] }], arrow: { from: [20, 70], to: [6, 70] }, caption: 'Step, land soft, stick it' },
  reaction: { head: [50, 18], neck: [50, 28], hip: [50, 56], legs: [{ knee: [62, 68], foot: [66, 90] }, { knee: [38, 68], foot: [34, 90] }], arms: [{ elbow: [36, 40], hand: [30, 30] }, { elbow: [64, 40], hand: [70, 30] }], caption: 'Ready stance, react fast' },
  ankle: { head: [48, 16], neck: [48, 26], hip: [48, 56], legs: [{ knee: [66, 66], foot: [64, 90] }, { knee: [40, 76], foot: [30, 90] }], arms: [{ elbow: [62, 40], hand: [78, 44] }], prop: 'wall', arrow: { from: [66, 66], to: [78, 66] }, caption: 'Knee to the wall, heel down' },
  hip: { head: [50, 16], neck: [50, 26], hip: [50, 56], legs: [{ knee: [66, 64], foot: [66, 88] }, { knee: [40, 80], foot: [26, 88] }], arms: [{ elbow: [40, 40], hand: [36, 52] }], prop: 'floor', arrow: { from: [50, 56], to: [60, 56] }, caption: 'Squeeze the back glute, shift forward' },
  thoracic: { head: [20, 50], neck: [30, 52], hip: [56, 60], legs: [{ knee: [66, 44], foot: [84, 48] }], arms: [{ elbow: [34, 68], hand: [40, 86] }, { elbow: [36, 36], hand: [44, 18] }], prop: 'floor', arrow: { from: [44, 18], to: [60, 14] }, caption: 'Open like a book, knees together' },
  hamstring: { head: [18, 42], neck: [26, 48], hip: [50, 74], legs: [{ knee: [70, 74], foot: [92, 74] }, { knee: [60, 60], foot: [64, 74] }], arms: [{ elbow: [42, 62], hand: [60, 66] }], prop: 'floor', caption: 'Long back, mild stretch' },
  shoulder: { head: [50, 14], neck: [50, 24], hip: [50, 54], legs: [{ knee: [46, 72], foot: [44, 90] }, { knee: [56, 72], foot: [58, 90] }], arms: [{ elbow: [62, 10], hand: [56, 2] }, { elbow: [40, 44], hand: [48, 36] }], caption: 'Reach over and behind, gently' },
  breathe: { head: [14, 60], neck: [24, 62], hip: [52, 66], legs: [{ knee: [66, 52], foot: [80, 80] }], arms: [{ elbow: [34, 72], hand: [44, 60] }], prop: 'floor', caption: 'Belly rises on the breath in' },
  catcow: { head: [16, 54], neck: [26, 54], hip: [58, 50], legs: [{ knee: [62, 70], foot: [62, 88] }], arms: [{ elbow: [30, 70], hand: [30, 88] }], prop: 'floor', arrow: { from: [42, 44], to: [42, 32] }, caption: 'Round up, then let the belly drop' },
  march: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [50, 70], foot: [50, 90] }, { knee: [64, 52], foot: [62, 68] }], arms: [{ elbow: [38, 32], hand: [34, 20] }, { elbow: [60, 40], hand: [66, 50] }], caption: 'Knee up, opposite arm up' },
  skip: { head: [50, 10], neck: [50, 20], hip: [50, 50], legs: [{ knee: [54, 68], foot: [58, 86] }, { knee: [66, 50], foot: [64, 64] }], arms: [{ elbow: [36, 30], hand: [30, 18] }, { elbow: [62, 36], hand: [70, 46] }], arrow: { from: [50, 50], to: [50, 38] }, caption: 'Light, quiet, bouncy' },
  shuffle: { head: [50, 22], neck: [50, 32], hip: [50, 58], legs: [{ knee: [70, 64], foot: [80, 88] }, { knee: [30, 64], foot: [20, 88] }], arms: [{ elbow: [36, 44], hand: [30, 52] }, { elbow: [64, 44], hand: [70, 52] }], arrow: { from: [86, 70], to: [98, 70] }, caption: 'Low and wide, feet never cross' },
  accel: { head: [66, 20], neck: [60, 30], hip: [44, 56], legs: [{ knee: [60, 68], foot: [74, 86] }, { knee: [30, 66], foot: [16, 78] }], arms: [{ elbow: [74, 38], hand: [84, 26] }, { elbow: [46, 44], hand: [36, 54] }], arrow: { from: [82, 60], to: [98, 60] }, caption: 'Lean and push the ground back' },
  landing: { head: [50, 24], neck: [50, 34], hip: [50, 60], legs: [{ knee: [64, 68], foot: [64, 90] }, { knee: [36, 68], foot: [36, 90] }], arms: [{ elbow: [36, 46], hand: [30, 56] }, { elbow: [64, 46], hand: [70, 56] }], prop: 'floor', arrow: { from: [50, 6], to: [50, 20] }, caption: 'Land like a cat, hold still' },
  jog: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [58, 68], foot: [64, 88] }, { knee: [40, 66], foot: [34, 80] }], arms: [{ elbow: [40, 34], hand: [38, 24] }, { elbow: [60, 38], hand: [66, 48] }], caption: 'Easy pace' },
  walk: { head: [50, 12], neck: [50, 22], hip: [50, 52], legs: [{ knee: [56, 70], foot: [60, 90] }, { knee: [44, 70], foot: [40, 90] }], arms: [{ elbow: [44, 38], hand: [42, 50] }, { elbow: [56, 38], hand: [58, 50] }], caption: 'Walk it out' },
  ready: { head: [50, 26], neck: [50, 36], hip: [50, 60], legs: [{ knee: [70, 68], foot: [76, 90] }, { knee: [30, 68], foot: [24, 90] }], arms: [{ elbow: [40, 50], hand: [36, 64] }, { elbow: [60, 50], hand: [64, 64] }], prop: 'floor', arrow: { from: [50, 92], to: [50, 84] }, caption: 'Low and loose, tiny hop, land ready' },
  crossover: { head: [44, 20], neck: [46, 30], hip: [50, 56], legs: [{ knee: [34, 66], foot: [20, 86] }, { knee: [64, 68], foot: [62, 90] }], arms: [{ elbow: [36, 42], hand: [26, 50] }, { elbow: [58, 38], hand: [66, 28] }], prop: 'floor', arrow: { from: [16, 60], to: [4, 60] }, caption: 'Pivot the near foot, cross the far foot, go' },
  dropstep: { head: [56, 18], neck: [54, 28], hip: [50, 54], legs: [{ knee: [38, 64], foot: [28, 84] }, { knee: [62, 66], foot: [70, 90] }], arms: [{ elbow: [42, 40], hand: [34, 30] }, { elbow: [62, 38], hand: [70, 46] }], prop: 'floor', arrow: { from: [24, 70], to: [10, 56] }, caption: 'Drop the foot back, open the hip, turn and run' },
  hipturn: { head: [50, 22], neck: [50, 32], hip: [48, 58], legs: [{ knee: [66, 66], foot: [74, 88] }, { knee: [32, 66], foot: [30, 90] }], arms: [{ elbow: [36, 46], hand: [30, 60] }, { elbow: [62, 46], hand: [68, 58] }], prop: 'floor', arrow: { from: [48, 58], to: [70, 52] }, caption: 'See it, turn the belt buckle, go' },
  latlunge: { head: [44, 24], neck: [46, 34], hip: [38, 62], legs: [{ knee: [30, 72], foot: [24, 90] }, { knee: [56, 74], foot: [80, 90] }], arms: [{ elbow: [56, 46], hand: [64, 54] }], prop: 'floor', arrow: { from: [38, 62], to: [26, 62] }, caption: 'Sit back over one foot, other leg straight' },
  hinge: { head: [22, 42], neck: [30, 46], hip: [56, 56], legs: [{ knee: [58, 72], foot: [58, 90] }, { knee: [54, 72], foot: [52, 90] }], arms: [{ elbow: [34, 58], hand: [30, 70] }], prop: 'floor', arrow: { from: [56, 56], to: [70, 56] }, caption: 'Hips back, back flat, hands out front' },
  skater: { head: [44, 20], neck: [46, 30], hip: [46, 56], legs: [{ knee: [40, 72], foot: [36, 90] }, { knee: [60, 60], foot: [70, 70] }], arms: [{ elbow: [34, 44], hand: [26, 54] }, { elbow: [60, 40], hand: [68, 32] }], prop: 'floor', arrow: { from: [20, 70], to: [8, 70] }, caption: 'Push sideways, land quiet, stick for two' },
  quickfeet: { head: [50, 18], neck: [50, 28], hip: [50, 56], legs: [{ knee: [58, 70], foot: [62, 86] }, { knee: [44, 68], foot: [40, 80] }], arms: [{ elbow: [40, 42], hand: [36, 54] }, { elbow: [60, 42], hand: [64, 54] }], prop: 'floor', arrow: { from: [40, 92], to: [62, 92] }, caption: 'Light quick feet over the line' },
  ninety: { head: [50, 30], neck: [50, 40], hip: [50, 70], legs: [{ knee: [74, 72], foot: [74, 90] }, { knee: [28, 72], foot: [10, 76] }], arms: [{ elbow: [40, 54], hand: [34, 66] }, { elbow: [60, 54], hand: [66, 66] }], prop: 'floor', arrow: { from: [74, 72], to: [84, 60] }, caption: 'Sit tall, swing both knees to the other side' },
  carioca: { head: [50, 14], neck: [50, 24], hip: [50, 52], legs: [{ knee: [64, 64], foot: [38, 86] }, { knee: [42, 70], foot: [60, 90] }], arms: [{ elbow: [36, 38], hand: [30, 48] }, { elbow: [64, 38], hand: [70, 48] }], prop: 'floor', arrow: { from: [80, 70], to: [96, 70] }, caption: 'Front, side, behind, side; hips turn, shoulders stay' }
};

function Prop({ kind }: { kind?: Joints['prop'] }) {
  switch (kind) {
    case 'chair': return <g stroke="currentColor" strokeWidth="2" opacity=".45" fill="none"><rect x="60" y="60" width="26" height="4" rx="1" /><path d="M64 64v26M82 64v26M82 60V40" /></g>;
    case 'wall': return <g stroke="currentColor" strokeWidth="2" opacity=".45" fill="none"><path d="M86 4v88" /></g>;
    case 'step': return <g stroke="currentColor" strokeWidth="2" opacity=".45" fill="none"><rect x="56" y="70" width="34" height="20" rx="2" /></g>;
    case 'dumbbell': return <g fill="currentColor" opacity=".55"><rect x="30" y="74" width="12" height="5" rx="2" /><rect x="58" y="24" width="12" height="5" rx="2" /></g>;
    case 'floor': return <g stroke="currentColor" strokeWidth="2" opacity=".35"><path d="M2 92h96" /></g>;
    default: return null;
  }
}

export function Figure({ pose, caption = true }: { pose: Pose; caption?: boolean }) {
  const j = POSES[pose] ?? POSES.march;
  const pt = (p: P) => `${p[0]} ${p[1]}`;
  return (
    <div className="figure" aria-label={`Illustration: ${j.caption ?? pose}`} role="img">
      <svg viewBox="0 0 100 96" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--ink)' }}>
        <Prop kind={j.prop} />
        <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={`M${pt(j.neck)} L${pt(j.hip)}`} />
          {j.legs.map((l, i) => <path key={'l' + i} d={`M${pt(j.hip)} L${pt(l.knee)} L${pt(l.foot)}`} />)}
          {j.arms.map((a, i) => <path key={'a' + i} d={`M${pt(j.neck)} L${pt(a.elbow)} L${pt(a.hand)}`} />)}
        </g>
        <circle cx={j.head[0]} cy={j.head[1]} r="6" fill="currentColor" />
        {j.arrow && (
          <g stroke="var(--accent-2)" strokeWidth="2.5" fill="var(--accent-2)" strokeLinecap="round">
            <path d={`M${pt(j.arrow.from)} L${pt(j.arrow.to)}`} />
            <circle cx={j.arrow.to[0]} cy={j.arrow.to[1]} r="2.6" stroke="none" />
          </g>
        )}
      </svg>
      {caption && j.caption && <div className="small muted center" style={{ marginTop: -4 }}>{j.caption}</div>}
    </div>
  );
}
