# BUILD ELI'S ATHLETIC LAB
## A Personal Strength, Mobility, Athleticism & Healthy Habits App

### YOUR ROLE

Act as a senior full-stack developer, progressive web app architect, youth strength and conditioning specialist, pediatric exercise science researcher, athletic performance coach, and excellent designer of apps for children and teenagers.

Your assignment is to **build, test, and deploy a real, functioning personal athletic-development app for my son Eli, born in 2014.**

This must be a complete, growing, personalized training system—not a static workout checklist.

## 1. THE VISION

Create an app that helps Eli develop:

- Full-body strength
- Functional mobility and flexibility
- Speed, agility, and acceleration
- Balance, coordination, and body control
- Age-appropriate power and jumping mechanics
- Endurance and general physical fitness
- Healthy recovery habits
- Good nutrition and hydration awareness
- Independence, consistency, and confidence

The app is for lifelong physical development.

It is NOT specifically a baseball, pitching, or throwing program.

Eli plays sports, including baseball and basketball, so the app must account for how physically demanding those activities have already been.

The ultimate purpose is to make athletic development sustainable, enjoyable, and intelligently individualized as he grows older.

Give the app a modern, energetic, age-appropriate interface that Eli genuinely wants to use.

Working name: **Eli's Athletic Lab**.

## 2. EXISTING TECHNICAL INFRASTRUCTURE

We previously built an application named Dugout Dad using Claude, GitHub, and existing server/hosting infrastructure.

Inspect whatever existing repository, code, deployment, authentication, and offline storage systems you have access to.

Reuse useful infrastructure and patterns, but create Eli's Athletic Lab as its own independent application.

Requirements:

- Its own URL or isolated app deployment
- Its own distinct iPhone Home Screen shortcut
- Its own icon and PWA manifest identifier
- Properly separated database and local storage
- Reliable offline functionality
- A parent account and child account
- Automatic synchronization across authorized devices when connectivity is available
- Exportable backups
- No destructive changes to Dugout Dad or Dugout Lab

If existing infrastructure cannot be accessed, identify what is needed and proceed with an isolated implementation that can be integrated later.

## 3. THE DAILY READINESS ENGINE

This is the most important feature.

Before prescribing any workout, ask Eli what he has already done and how he feels.

Keep the check-in extremely simple.

Inputs should include:

- Sports played today
- Approximate duration and intensity
- Heavy throwing or pitching
- Heavy basketball, sprinting, or running
- Long tournament or physically exhausting day
- Other physical activity, including school PE
- Energy level
- Sleep quality
- Soreness or fatigue
- Pain, illness, or suspected injury

Use these inputs to select an appropriate daily recommendation.

### Training categories

**GREEN — Fresh and ready**

Offer the planned workout if sufficient recovery has occurred.

This may include strength, coordination, or age-appropriate power training.

**YELLOW — Moderate physical workload**

Reduce the volume and intensity.

Offer short mobility, gentle core work, technique practice, or recovery instead of unnecessary additional loading.

**ORANGE — Heavy sports workload**

Default to recovery.

Examples:

- Heavy throwing: no additional loaded shoulder, elbow, forearm, or throwing work.
- Intense basketball: avoid extra sprints, hard leg training, and jumping workouts.
- All-day tournament: no additional strength or conditioning required.

Optional comfortable mobility may be offered.

**RED — Pain, injury concern, illness, dizziness, or significant symptoms**

No workout.

Advise him to notify a parent or responsible adult and seek appropriate medical advice where needed.

Do not diagnose injury or suggest pushing through pain.

The workout generator must consider recent activity across multiple days, not just today's check-in.

Do not interpret the color categories as medical clearance.

## 4. DAILY FOUNDATIONS

Build a short, optional daily movement routine that is reasonable even on many recovery days, provided Eli feels well.

The routine should generally take 3–6 minutes.

Example:

- Relaxed breathing
- Gentle cat-cow movement
- Comfortable trunk rotation
- Ankle mobility
- Hip mobility
- Light balance activity

All activities must be demonstrated clearly with safe movement cues.

Never force stretching or require a daily routine during illness, injury, significant fatigue, or pain.

Separate movement habits from strength training.

**Daily movement does not mean daily muscular overload.**

Include everyday non-exercise habits such as drinking water, eating balanced meals, getting adequate sleep, and enjoying normal physical play.

## 5. THE STRENGTH TRAINING LIBRARY

Build a structured exercise library with beginner, intermediate, and later advanced variations.

Start with:

### Lower body
- Chair squats
- Bodyweight squats
- Assisted split squats
- Controlled step-ups
- Glute bridges
- Calf raises

### Upper body
- Wall push-ups
- Incline push-ups
- Regular push-up progression
- Light supported dumbbell rows
- Light dumbbell curls
- Appropriate shoulder and scapular control exercises

### Core
- Dead bugs
- Bird dogs
- Side planks
- Front planks
- Controlled curl-ups when appropriate
- Gentle trunk rotations
- Anti-rotation control

### Balance and coordination
- Single-leg balance
- Heel-to-toe walking
- Cross-body coordination
- Controlled lateral movement
- Reaction-based games

### Mobility
- Ankle dorsiflexion
- Hip mobility
- Thoracic rotation
- Comfortable hamstring and calf stretches
- Shoulder mobility where appropriate

Include exercise-specific contraindications, substitutions, coaching cues, common form errors, and easier/harder progressions.

For resistance exercise, begin with bodyweight and technique.

Allow 5-pound dumbbells only when appropriate for that particular exercise and his demonstrated ability. Ten-pound dumbbells should be a selectable later option, never an automatic progression.

Require adult instruction and initial form checks for new weighted movements.

Do not prescribe maximum lifts, lifting to failure, aggressive weighted twisting, or advanced explosive loading.

Include clear explanations of what each exercise develops and why it matters beyond sports.

## 6. STARTER WORKOUT PROGRAM

Build an actual starter program into the application.

### Strength Session A

Approximately 20 minutes, including warm-up and cooldown.

- Dynamic warm-up
- Chair squats: 2 × 8
- Incline push-ups: 2 × 6–10
- Glute bridges: 2 × 10
- Dead bugs: 2 × 6 per side
- Single-leg balance: 2 × 20 seconds per side
- Gentle cooldown

### Strength Session B

Approximately 20 minutes.

- Dynamic warm-up
- Low step-ups: 2 × 6 per leg
- Controlled supported dumbbell row: 1–2 × 8 per side, only after technique approval
- Assisted reverse lunges: 1 × 6 per leg
- Bird dogs: 2 × 6 per side
- Side planks: 1–2 × 10–20 seconds per side
- Optional light curls: 1 × 8, only if appropriate
- Gentle cooldown

### Athletic Coordination Session

Approximately 10–15 minutes on a fresh day.

- Dynamic warm-up
- Skipping and controlled marching
- Lateral shuffling
- Short acceleration technique
- Balance and direction-change games
- Low-volume landing practice when appropriate
- Full recovery between short efforts

Use these as editable starting templates, not mandatory prescriptions.

Allow Eli or a parent to shorten, skip, substitute, or postpone exercises without penalty.

Provide at least 48 hours between comparable demanding strength sessions, while adapting to actual sports workloads.

Prioritize good technique and sufficient recovery.

## 7. DEVELOPMENT PROGRESSION

Make the program automatically evolve with Eli's ability, preferences, growth, and age.

Do not base progression only on chronological age.

Track:

- Technique and movement control
- Comfortable repetitions
- Completed sets
- Weight used
- Balance duration
- Mobility milestones
- Enjoyment and confidence
- Recovery and fatigue
- Self-selected goals

### Initial progression

Weeks 1–2: Learn exercises, master movements, establish habits.

Weeks 3–4: Add modest volume or difficulty only where form and recovery support it.

Weeks 5–6: Improve movement quality, introduce appropriate variations, and review baseline skills.

Afterward, continue through adjustable development blocks.

Do not automatically add weight or intensity every week.

When sport schedules become demanding, reduce or postpone supplemental training.

Account for growth spurts, changes in coordination, and different rates of physical maturity.

Eventually, allow the app to grow into more advanced teenage training, with age-appropriate supervision and updated guidance.

## 8. PERSONAL EXERCISE JOURNAL

Eli must be able to log his workouts and see progress over time.

For every workout, support:

- Exercises performed
- Sets and repetitions
- Time or distance where relevant
- Optional resistance used
- Difficulty rating
- Whether the movement felt good
- Notes and reflections
- Exercise modifications
- Personal achievements

Create simple progress charts showing improvements compared with his own previous performance.

Never rank him against other children.

Do not emphasize weight, body-fat measurements, appearance, or dieting.

Celebrate movement quality, consistency, effort, learning, and good recovery decisions.

Include a calendar where Eli can see yesterday's workout, previous notes, and completed activities.

Allow him to write something as simple as:

"Push-ups were easier today."

or:

"My legs were really tired after basketball."

Use these observations to help personalize future recommendations.

## 9. TRANSPARENT PARENT DASHBOARD

Create two roles:

**Eli Mode**
- See today's recommendations
- Start and complete workouts
- Log sports activity
- Record exercise performance
- Review personal progress
- Choose goals
- See healthy habit reminders
- Write private reflections where permitted

**Parent Mode**
- Review completed workouts and shared logs
- See his sports workload and recovery days
- Review progress over time
- Edit or approve exercises
- Modify training frequency
- Manage reminders
- Approve equipment or resistance changes
- See relevant fatigue and safety alerts
- Export and back up records

Eli should know what information is visible to the parent.

Keep any designated private reflections separate.

Do not implement hidden tracking, secret surveillance, or deceptive interfaces.

Parent access should work from the parent's own device when synchronized.

Do not expose Eli's information to unauthenticated users or other families.

## 10. SMART DAILY HABIT REMINDERS

Create a habit and messaging engine that changes intelligently.

Instead of the same reminders every day, select one fresh, contextually relevant message.

Example categories:

### Hydration
"Basketball day? Remember your water bottle and take regular breaks."

### Nutrition
"Your next upgrade is a balanced meal. Muscles need real food to grow."

### Sleep
"Tomorrow's energy starts tonight. Give yourself time for a good night's sleep."

### Recovery
"You worked hard today. Recovery is part of getting stronger."

### Consistency
"Ten minutes of good movement beats rushing through a workout with sloppy form."

### Confidence
"Your goal isn't to beat yesterday every time. It's to keep learning."

### Mobility
"Your ankles, hips, and shoulders help you move well. Give them some attention today."

Rules:

- No repetitive messages within a configurable rotation window.
- Match messages to today's activities.
- Permit age-appropriate humor, mini-challenges, and encouraging language.
- Avoid guilt, shame, body-image pressure, and manipulative streak mechanics.
- Respect quiet hours.
- Use a visually distinct but non-flashing banner.
- Make notifications optional and user-controlled.

In-app reminders must work offline while the app is open.

Optional iPhone push notifications may be implemented when supported, permission is granted, and the necessary server infrastructure is available. Do not promise scheduled background alerts will work offline.

## 11. FOOD, HYDRATION, AND SUPPLEMENT SAFETY

Include a simple healthy-habits section.

Prioritize:

- Water access and regular hydration
- Balanced meals
- Protein-containing everyday foods
- Carbohydrates for activity
- Fruits and vegetables
- Adequate overall nutrition
- Consistent sleep and recovery

Do not prescribe restrictive calorie goals, weight-loss programs, or bodybuilding macros.

Do not prescribe routine protein powders or creatine for Eli.

The default app must have NO creatine schedule, dosing instructions, or automatic creatine reminders.

Provide an optional parent-managed medication/supplement record only when a clinician has recommended a specific product, dose, and schedule.

Any vitamin or supplement reminder must be explicitly authorized by a parent and based on medical guidance.

The child should not be able to add or change medication or supplement dosages independently.

Avoid claiming that supplements are necessary for athletic progress.

## 12. GAMIFICATION THAT DOES NOT BECOME PRESSURE

Make the experience engaging.

Ideas:

- Athletic skill badges
- New movement achievements
- Personal-best milestones
- Weekly missions
- Balance and coordination challenges
- Unlockable educational tips
- Positive reflection prompts

Reward safe choices such as taking a recovery day when exhausted.

Missing a workout should never trigger punishment, shame, or loss of hard-earned accomplishments.

Allow Eli to choose between playful, minimalist, and more serious sports-oriented visual themes.

## 13. USER EXPERIENCE

Design for an iPhone with large buttons and quick interactions.

Primary navigation:

**Today | Workouts | Progress | Habits | Journal**

Today's page should show:

1. An easy readiness check-in
2. Any sports activity already logged
3. The current workout recommendation
4. A clear Start or Skip Workout action
5. One fresh daily message
6. A quick way to review yesterday's progress

During a workout:

- Show an exercise illustration or appropriate original demonstration
- Display sets, repetitions, and coaching tips
- Allow one-tap completion
- Include optional rest timers
- Offer easier/harder substitutions
- Pause and resume
- Record quick notes
- Stop immediately when pain or concerning symptoms are reported

Keep the app responsive, simple, and encouraging.

## 14. TECHNICAL IMPLEMENTATION

Build as an offline-first Progressive Web App.

Use the existing infrastructure where safe and appropriate.

Recommended characteristics:

- A maintainable modern frontend
- Clear component organization
- IndexedDB for durable local structured data
- Service worker for offline application files
- Versioned exercise catalog
- Explicit schema migrations
- Independent PWA manifest, ID, icons, start URL, and service-worker scope
- Separate child and parent accounts
- Authenticated server synchronization
- Conflict detection and resolution
- Secure transport and access controls
- Backup export and restoration
- Privacy-preserving data minimization
- No unnecessary analytics or advertising trackers

If cloud synchronization is unavailable, provide fully functioning local training and logging and clearly indicate that remote parent access has not yet been enabled.

Design for unreliable connectivity.

Never silently overwrite offline workout logs.

Do not claim that a Home Screen installation alone ensures data safety.

## 15. IMPORTANT DATA MODELS

Include structured entities for:

- Athlete profile
- Parent/guardian permissions
- Exercise catalog
- Exercise variants
- Workout templates
- Planned sessions
- Completed sessions
- Sets and repetitions
- Sports activity logs
- Readiness check-ins
- Fatigue and safety flags
- Personal goals
- Journal entries
- Habit reminders
- Optional clinician-approved supplement records
- Synchronization and backup metadata

Ensure historical records remain meaningful when an exercise definition or program changes.

## 16. RESEARCH REQUIREMENTS

Use credible current guidance, including:

- American Academy of Pediatrics — Strength Training
- American Academy of Pediatrics — Resistance Training for Children and Adolescents
- CDC Physical Activity Guidelines for Children
- NSCA Youth Training and Long-Term Athletic Development
- American Academy of Pediatrics — Sports Nutrition and Supplement Use
- American Academy of Pediatrics — Creatine and Young Athletes

Also examine the concept of workload-based programming in Armored Heat:
https://armoredheat.com/pages/faqs

Reference the original ChatGPT conversation if accessible:
https://chatgpt.com/share/6ae887c9-5858-83ea-98cf-ab3aa3d5beec

Do not invent details from an inaccessible reference.

Use original content and exercises rather than copying proprietary programs.

Treat the app as a general wellness and physical activity tool, not medical software or a substitute for professional medical advice.

## 17. BUILD ORDER

**Phase 1 — Fully working starter application**

Build and deploy:

- Child profile
- Daily readiness check
- Original exercise library
- Strength A and B
- Mobility and coordination routines
- Sports workload adaptation
- Interactive workout player
- Workout history
- Notes and journal
- Basic progress charts
- Offline-first storage
- Local backup and restoration
- Rotating daily messages

**Phase 2 — Parent experience**

Implement secure, transparent parent access, authorized multi-device synchronization, exercise approvals, and configurable reminders.

**Phase 3 — Long-term intelligence**

Add richer progression, seasonal adjustments, custom exercises, educational content, and more sophisticated progress insights.

Do not let advanced feature ambitions prevent delivering a complete usable Phase 1.

## 18. REQUIRED ACCEPTANCE TESTS

Verify that:

1. Eli can complete and save a full workout entirely offline.
2. He can reopen the app and review yesterday's workout.
3. Logging heavy basketball correctly suppresses additional intense leg work.
4. Logging heavy throwing suppresses additional demanding arm work.
5. Logging an exhausting tournament offers recovery rather than another workout.
6. Reporting pain or illness stops workout recommendations.
7. A missed day does not produce punitive messages.
8. The app does not automatically increase weights.
9. Parent access is properly authenticated and clearly disclosed to Eli.
10. Offline logs synchronize without silent data loss.
11. Creatine and protein supplementation are not added to the default program.
12. The app installs separately from Dugout Dad.
13. Previously stored records survive routine app updates.
14. Workout records can be exported and restored successfully.
15. The actual interface is tested at iPhone screen sizes.

## 19. FINISH THE ACTUAL BUILD

Inspect the existing environment, establish the app architecture, implement the application, test the key workflows, and deploy using available authorized resources.

Do not stop at wireframes or theoretical recommendations.

At completion, provide:

- The application URL
- Repository location
- Implemented features
- Features requiring additional infrastructure
- Any outstanding safety or technical limitations
- Instructions for installing it on Eli's iPhone
- Instructions for installing or accessing the parent dashboard
- Instructions for enabling backups and notifications

**The guiding principle: Build an app that teaches Eli how to care for his body, develop athletic ability, and make good decisions independently—not simply complete more workouts.**

If anything is unclear or you need additional details to improve your response, please ask me for clarification.