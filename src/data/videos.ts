/**
 * Verified demonstration videos, one or more per exercise, played in the app with the official YouTube
 * embed. Every link here passed the oEmbed check when added, and .github/workflows/keepalive.yml checks
 * them every three days and fails loudly when one is gone. Nothing is downloaded or rehosted.
 * Exercises without an entry show the animated drawing only. Progressions can point at a base move's demo.
 */
export type Video = { url: string; title: string; channel: string; note?: string };

export const VIDEOS: Record<string, Video[]> = {
  'ss-ready': [{ url: 'https://www.youtube.com/watch?v=k7Sv9PM3gHc', title: 'Factory 101: Infield Drill Series Part 1 - Ready Position', channel: 'Baseball Factory', note: 'Stance only; the timing hop is in the app drawing' }],
  'ss-crossover': [{ url: 'https://www.youtube.com/watch?v=ZAY_WYVvxmg', title: 'Training Tip: Pivot Crossover', channel: 'Ripken Baseball' }],
  'ss-dropstep': [{ url: 'https://www.youtube.com/watch?v=nIeRMuAK8Ok', title: 'Training Tip: Drop Step', channel: 'Ripken Baseball' }],
  'ss-hipturn': [{ url: 'https://www.youtube.com/watch?v=tAVk_kf-tb4', title: 'Baseball Turn Drill: Master Fast Reaction Time!', channel: 'Schupak Sports', note: 'Reaction turn drill' }],
  'ss-latlunge': [{ url: 'https://www.youtube.com/watch?v=2O0MCU_4STY', title: 'How to Perform a Lateral Lunge', channel: 'The Basketball Doctors' }],
  'ss-hinge': [{ url: 'https://www.youtube.com/watch?v=fvoAfy5Gzys', title: 'Youth Fitness Training teaching the hip hinge athletes 10-13', channel: 'Coach Dave Gleason - Coaches Corner' }],
  'ss-skater': [{ url: 'https://www.youtube.com/watch?v=9_jLW6VkU8A', title: 'Speed Skaters Exercise (Skater Hops): Proper Form', channel: 'BuiltLean®' }],
  'ss-quickfeet': [{ url: 'https://www.youtube.com/watch?v=S1aRerlNobs', title: 'Line Hops - Side to Side (Exercise Library)', channel: 'Horton Barbell' }],
  'ss-ninety': [{ url: 'https://www.youtube.com/watch?v=Ot6EsGs1Wj8', title: 'Hip Mobility - The 90/90 Transition - Guided by Dr. Jacob, DPT', channel: 'Dr. Jacob' }],
  'ss-carioca': [{ url: 'https://www.youtube.com/watch?v=E6SKcfQBZlc', title: 'Running Drill - Carioca - Ask Dr. Abelson', channel: 'Dr. Brian Abelson' }],
  'ath-skipmarch': [{ url: 'https://www.youtube.com/watch?v=ZMEMFLfmmIo', title: 'Running Drills: A-March & A-Skip Progression with Coach Pat', channel: 'The Run Plan' }],
  'ath-shuffle': [{ url: 'https://www.youtube.com/watch?v=DMLstZ_2WJY', title: 'Basketball Defense Drill - Defensive Shuffle (Slide)', channel: 'BreakthroughBBall' }],
  'ath-accel': [{ url: 'https://www.youtube.com/watch?v=MgXvvuMyFfc', title: 'Falling Start Speed Drill Improve Acceleration | Speed Development for Young Athletes', channel: 'Developing Young Athletes Network' }],
  'ath-dirchange': [{ url: 'https://www.youtube.com/watch?v=iNnRUnVCxsQ', title: 'YOUTH ATHLETE DRILLS:  DIRECTIONAL CHANGE', channel: 'Ted Rath NFL Strength Coach' }],
  'ath-landing': [{ url: 'https://www.youtube.com/watch?v=4BkMWe3au9w', title: 'Introduction to Landings: Snap Downs', channel: 'basketball.physio' }],
  'coord-lateral': [{ url: 'https://www.youtube.com/watch?v=KyKbb1fJntE', title: 'SL Lateral Hop and Stick (Lateral Side) - Tutorial', channel: 'Martell Elite Fitness' }],
  'coord-reaction': [{ url: 'https://www.youtube.com/watch?v=iruXJ3KVcEE', title: 'Kids coordination: catching a reaction ball', channel: 'squashdrills' }],
  'coord-crossbody': [{ url: 'https://www.youtube.com/watch?v=u6jiONDwANM', title: 'Cross-Crawl Exercise', channel: 'Rehab My Patient' }],
  'bal-reach': [{ url: 'https://www.youtube.com/watch?v=Mo4P9Y_AQt8', title: 'How to do a  Single Leg Balance Reach Multiplanar', channel: 'National Academy of Sports Medicine (NASM)' }],
  'core-deadbug': [{ url: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws', title: 'Core Exercise: Dead Bug', channel: 'Children\'s Hospital Colorado' }],
  'core-birddog': [{ url: 'https://www.youtube.com/watch?v=NdIxQGpGvWA', title: 'Physical Therapy - Bird Dog', channel: 'Atrius Health' }],
  'core-antirotation': [{ url: 'https://www.youtube.com/watch?v=CRHHSmoakC8', title: 'Half-Kneeling Pallof Press with Band', channel: 'Power Plant Gym', note: 'Shown with a band; do the hold or press without one' }],
  'core-curlup': [{ url: 'https://www.youtube.com/watch?v=I_drRVYlHbc', title: 'The McGill Curl-Up', channel: 'Prime Health Co.' }],
  'lo-splitsquat-assist': [{ url: 'https://www.youtube.com/watch?v=REflwhg0jNs', title: 'Bodyweight Split Squat (Exercise Library)', channel: 'Horton Barbell', note: 'Shown without support; hold a chair or wall' }],
  'lo-stepup-low': [{ url: 'https://www.youtube.com/watch?v=elhu-WC1qk4', title: 'Proper Step Ups/Downs', channel: '[P]rehab' }],
  'lo-bridge': [{ url: 'https://www.youtube.com/watch?v=4cogaFyhWA0', title: 'Bridges For Physical Therapy', channel: 'Potomac Valley Orthopaedic Associates' }],
  'lo-revlunge-assist': [{ url: 'https://www.youtube.com/watch?v=u_zSfK5ZFU4', title: 'Reverse Lunge Exercise: Proper Form', channel: 'BuiltLean®', note: 'Shown without support; hold a chair or wall' }],
  'up-inclinepush': [{ url: 'https://www.youtube.com/watch?v=-9S9gdRwwak', title: 'Incline Push ups (Exercise Library)', channel: 'Horton Barbell' }],
  'up-row': [{ url: 'https://www.youtube.com/watch?v=2AUbzsDCgaQ', title: 'DB One Arm Row (Exercise Library)', channel: 'Horton Barbell', note: 'Use a light dumbbell, lighter than the one shown' }],
  'up-scapslide': [{ url: 'https://www.youtube.com/watch?v=Eaj_NG5_hIo', title: 'Exercises for Shoulder Pain: Wall Slides', channel: 'BESS - British Elbow & Shoulder Society', note: 'Technique demo' }],
  'up-ytraise': [{ url: 'https://www.youtube.com/watch?v=rKVuKuR4SA4', title: 'Prone I\'s, T\'s, Y\'s - Physical Therapy Excercises', channel: 'TSAOG Orthopaedics & Spine' }],
  'mob-thoracic': [{ url: 'https://www.youtube.com/watch?v=e71IP2SLrRc', title: 'Open Book/Thoracic Rotation', channel: 'Momentum Physical Therapy of New Paltz' }],
  'mob-ankle': [{ url: 'https://www.youtube.com/watch?v=MD8nwL36Tqs', title: 'Ankle Mobilization - Knee-to-wall and Band-Resisted Dorsiflexion (for kids!)', channel: 'AltaVie Health & Chiropractic Clinic', note: 'Stop before the band part' }],
  'mob-hip': [{ url: 'https://www.youtube.com/watch?v=F55tzqJggAY', title: 'Half Kneeling Hip Flexor Stretch | B3 Physical Therapy', channel: 'Cara Giusti, PT, DPT' }],
  'mob-catcow': [{ url: 'https://www.youtube.com/watch?v=vuyUwtHl694', title: 'Cat Cow', channel: 'California Department of Public Health' }],
};

/** Progressions that are the same move with support removed or one leg: reuse the base demo. */
export const VIDEO_ALIAS: Record<string, string> = {
  'lo-splitsquat': 'lo-splitsquat-assist',
  'lo-revlunge': 'lo-revlunge-assist',
  'lo-stepup': 'lo-stepup-low',
  'lo-bridge-single': 'lo-bridge',
};

export function videosFor(exerciseId: string): Video[] {
  return VIDEOS[exerciseId] ?? VIDEOS[VIDEO_ALIAS[exerciseId] ?? ''] ?? [];
}
