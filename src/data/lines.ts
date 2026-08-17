import type { HotspotId, ItemId, Line } from '../game/types';

const m = (text: string): Line => ({ who: 'MARA', text });
const c = (text: string): Line => ({ who: 'CIVIC', text });

/** Opening text card. Three lines, then the player is in control. */
export const OPENING: Line[] = [
  { who: 'NARRATOR', text: 'Checkpoint 7. Rain with a metallic aftertaste. Her contact is four floors up, behind a door the city owns.' },
  { who: 'NARRATOR', text: 'A patrol sweep is due in the time it takes to be sensible about this.' },
  { who: 'CIVIC', text: 'Good evening. You are not expected. Please continue anyway; the city enjoys a variable.' },
];

/** First look. Every one of these teaches or colours something. */
export const EXAMINE: Record<HotspotId, Line[]> = {
  'transit-sign': [
    m('Transit sign. CHECKPOINT 7 — SERVICE SUSPENDED, and under it, in smaller letters, PLEASE ENJOY THE WAIT.'),
    m('It has been flickering long enough to wear a pale rectangle into the wall behind it. Nobody is coming to fix that. Nobody was ever going to.'),
  ],
  'ad-display': [
    m('A public advertisement panel, half its pixels dead, cycling nutrition slogans at an alley with nobody in it.'),
    m('Every eleven seconds it clears its throat and starts again. Someone is paying for this.'),
  ],
  windows: [
    m('Four floors of tenement windows, all dark. My contact is behind one of them, probably counting the seconds I am standing out here being interesting.'),
    m('The dark is not uniform. Some panes are dark like a closed room. Others are dark like a held breath.'),
  ],
  conduit: [
    m('Utility conduit — water, data, and whatever else the city runs through its own walls. Warm to the back of the hand.'),
    m('It swells and settles. Pressure regulation, technically. It looks like a ribcage doing its job.'),
  ],
  graffiti: [
    m('Someone has written on the wall in municipal grey, which is the one colour the cleaning crews will not paint over.'),
  ],
  stencil: [
    m('A works stencil, sprayed at knee height where only the people who need it will look: SECTOR 12 · SUBCONTRACT SANITATION · UNIT SW-9 ASSIGNED · REPORT FAULTS AT KIOSK.'),
  ],
  vending: [
    m('A nutrient dispenser, lit from inside like a small yellow chapel. Column three is jammed and something has been weeping out of the base for a while.'),
    m('There is a theft-deterrent strip behind the front panel. Municipal contract hardware. Bent right, that strip is a hook.'),
  ],
  camera: [
    m('Surveillance unit on a servo mount above the door. Housing scuffed, lens immaculate — the city cleans what it looks through.'),
    m('It sweeps. I would like to know how far, and for how long it is looking the other way, and I would like to know it without standing here staring up at it.'),
  ],
  terminal: [
    m('Municipal access terminal. Credential slot, speaker grille, and a screen the colour of a bad diagnosis.'),
    m('The header cycles: RESIDENT ACCESS · SERVICE ACCESS · MAINTENANCE. Two of those are not for me. One of them might be persuaded.'),
  ],
  door: [
    m('Steel door in a condemned frame, hinges welded to the building and the lock welded to the city. No handle. Handles imply choice.'),
    m('A status lamp above the jamb. Red means the door has an opinion about me.'),
  ],
  drone: [
    m('A municipal cleaning drone in its charging recess. Chassis dented, one tread fouled, service plate reading UNIT SW-9.'),
    m('It is shaking. Not the tread — the whole housing. That is not a mechanical fault. That is a small machine having a long night.'),
  ],
  grate: [
    m('Storm grate. Bolted flush, bars two fingers apart, and about forty centimetres down: a service badge, face up, laminate catching the light.'),
    m('Whoever dropped it is not coming back for it. That is a sentence about this alley, not about the badge.'),
  ],
  puddle: [
    m('Standing water, filmed with oil, reflecting the wall above the tenement door.'),
    m('Which means it reflects the camera. I can watch it sweep in the puddle without ever looking up at it — and it can watch me look at nothing.'),
  ],
  rubble: [
    m('Rubble from the condemnation survey. Broken facing tile, a sheared bolt, a bird that chose the wrong ledge.'),
    m('Nothing here I can use. The city takes its demolition seriously and its rebuilding as a suggestion.'),
  ],
  dumpster: [
    m('A refuse hopper, municipal green under a decade of municipal grey. Lid chained. Contents: the smell of contents.'),
    m('It is bulky, it is bolted down, and it is between the far wall and everything that looks at this alley. Behind it, nothing can see me.'),
  ],
};

/** Looking a second time. Shorter, drier, and occasionally the city answers. */
export const EXAMINE_AGAIN: Partial<Record<HotspotId, Line[]>> = {
  'transit-sign': [m('Still suspended. Still asking me to enjoy it.')],
  'ad-display': [m('The same eleven seconds. I could set a watch by it, if I owned one the city had not registered.')],
  windows: [m('Dark. Patient. Somebody up there is not sleeping either.')],
  conduit: [m('In. Out. In.')],
  stencil: [m('Sector twelve. Unit SW-9. Faults at the kiosk. Municipal writing is honest by accident.')],
  vending: [m('Column three, still jammed. Base, still weeping.')],
  camera: [m('It is doing its job. I would rather it did the job somewhere else.')],
  terminal: [m('RESIDENT · SERVICE · MAINTENANCE. Still two lies and a maybe.')],
  door: [m('Shut. Emphatically, municipally shut.')],
  grate: [m('The badge is still down there being nearly mine.')],
  puddle: [m('The reflection wobbles when the rain hits it. So does the camera, briefly, which is a comfort I will take.')],
  rubble: [m('Rubble remains rubble.')],
  dumpster: [m('Behind it is the only address in this alley with no listing.')],
  drone: [m('SW-9. Still shaking. Still pretending not to.')],
  graffiti: [m('The wall, and the wall\'s opinion.')],
};

/** Four states of the graffiti wall. */
export const GRAFFITI_TEXT = [
  'THE CITY SEES EVERYTHING',
  'EVERYTHING SEES THE CITY',
  'MARA VEY WALKS LIKE SOMEONE WITH SOMEONE ELSE\'S MEMORIES',
  'GO UP. I WILL SAY IT WAS THE WEATHER',
];

export const GRAFFITI_REACT: Line[][] = [
  [m('THE CITY SEES EVERYTHING. Painted in municipal grey by someone who wanted it to survive.')],
  [
    m('It says EVERYTHING SEES THE CITY.'),
    m('That is not what it said. I read it twice, and it said the other thing twice.'),
  ],
  [
    m('MARA VEY WALKS LIKE SOMEONE WITH SOMEONE ELSE\'S MEMORIES.'),
    m('The paint is dry. The paint has always been dry. Nobody has been on this wall tonight.'),
    m('All right. You have my attention, and I appear to have yours.'),
  ],
  [
    m('GO UP. I WILL SAY IT WAS THE WEATHER.'),
    m('A city cannot lie to itself. It can, apparently, file.'),
  ],
];

/** Advertisement panel copy by attention tier. */
export const AD_SLOGANS = {
  calm: [
    'NUTRIENT BRICK. FLAVOUR: DECIDED.',
    'REPORT ANOMALIES. FEEL INCLUDED.',
    'SECTOR 12 THANKS YOU FOR EXISTING ON SCHEDULE.',
    'YOUR CURFEW IS A GIFT YOU GIVE YOURSELF.',
  ],
  personal: [
    'YOU LOOK TIRED. WE HAVE A BRICK FOR THAT.',
    'HELLO, VISITOR. STAY AS LONG AS YOU ARE INTERESTING.',
    'COURIERS: ASK ABOUT LEGITIMACY.',
    'THAT COAT IS TOO LIGHT FOR THIS RAIN.',
  ],
  hostile: [
    'MARA. THERE IS A CHAIR INSIDE. YOU SHOULD SIT.',
    'A PATROL IS ALSO A KIND OF WELCOME.',
    'DO NOT RUN. RUNNING IS PAPERWORK.',
    'WE HAVE COMPARED YOU TO YOURSELF. RESULTS PENDING.',
  ],
};

/** The drain / speaker grille mutters these. Keyed loosely by attention tier. */
export const WHISPERS = {
  low: [
    'a courier. how novel.',
    'she is looking at the water, not the lens.',
    'log it as weather.',
    'the drone is frightened again.',
  ],
  mid: [
    'she knows about the sweep.',
    'seventeen ways from this alley. she has found two.',
    'do not frighten her yet.',
    'she is being careful. careful is data.',
  ],
  high: [
    'a sweep is warming up on Trellis Street.',
    'i could stop this. i am choosing not to yet.',
    'she is nearly interesting enough.',
    'ask her the question. ask her.',
  ],
};

/** CIVIC's ambient commentary when the attention tier changes. */
export const TIER_BARKS: Record<number, Line[]> = {
  2: [c('Citizen unmatched. Observation upgraded from ambient to attentive. No action is required of you. There rarely is.')],
  3: [c('You are now a subject of interest, which in this district is a form of hospitality.')],
  4: [
    c('Attention seven. The terminal has begun to disbelieve you specifically.'),
    c('Please understand: I am not accusing you. I am compiling you.'),
  ],
  5: [
    { who: 'ALARM', text: 'SWEEP ADVISORY — SECTOR 12 UNIT INBOUND. STAND WHERE YOU ARE. THIS WILL BE TIDY.' },
  ],
};

export const PURGE_LINES: Line[] = [
  { who: 'ALARM', text: 'ATTENTION SATURATED. SANITATION SWEEP ENGAGED.' },
  m('Light from both ends of the alley. Nowhere is a direction.'),
  c('I have logged you as debris and cleared you to the checkpoint line. Debris is not arrested. Debris is relocated.'),
  c('You may come back. I have not written down the interesting parts.'),
  m('Back at the mouth of the alley, soaked, holding everything I was holding. The camera is pretending to look elsewhere.'),
];

/** Item-on-target responses. Key is `${item}:${target}`. Only the *failures* live here —
 *  successful combinations are handled by the engine so they can move puzzle state. */
export const COMBO_FAIL: Record<string, string> = {
  'knife:door': 'The knife is ceramic and the door is municipal. Only one of them has funding.',
  'knife:terminal': 'I could prise the fascia off and be elbow-deep in a live civic system with a camera overhead. There is bold and there is billed.',
  'knife:camera': 'Cutting the camera down tells the city exactly one thing, immediately, and in my handwriting.',
  'knife:grate': 'The bars are two fingers apart and the blade is four inches long. I can touch the badge. Touching is not having.',
  'knife:puddle': 'I stab the puddle. The puddle declines to comment.',
  'knife:drone': 'SW-9 watches the blade approach its housing and produces a noise I will be hearing for a while. Not like that, then.',
  'knife:conduit': 'Water, data, or mains. One in three, in the rain, with a ceramic blade. I have had better odds and I am still here because I did not take them.',
  'knife:dumpster': 'The chain is hardened. The knife is not. I am not opening this to find out what municipal green smells like underneath.',
  'knife:graffiti': 'Scratching it out would be admitting I read it.',
  'knife:stencil': 'Defacing a works stencil. The one piece of writing here that has ever helped me.',
  'knife:windows': 'They are four floors up and I am not a rumour that climbs.',
  'knife:ad-display': 'I could open the ad panel. I would then be a woman in an alley holding an argument about nutrition.',
  'knife:transit-sign': 'Cutting down the sign would not restart the trains, and I would still be here.',
  'knife:rubble': 'I prise up a facing tile. Underneath: more tile, wetter.',

  'shard:grate': 'Feeding my only credential into a storm drain. Let us keep that in reserve, along with the other bad ideas.',
  'shard:vending': 'The dispenser wants municipal scrip, not a broken identity. It rejects the shard with a small, personal buzz.',
  'shard:drone': 'SW-9 reads the shard, hesitates, and very carefully does not tell me what it saw.',
  'shard:door': 'I hold my identity up to a steel plate. The steel plate remains the better-documented citizen.',
  'shard:camera': 'Showing the camera my broken credential. That is not a plan, that is a confession with better lighting.',
  'shard:puddle': 'I hold it over the water and see half a face over half a name. Yes. Understood. Thank you.',

  'strip:terminal': 'Waving a magnet at a credential reader. It would notice, and then it would tell someone.',
  'strip:door': 'There is nothing behind this door for a magnet to love.',
  'strip:vending': 'The strip came out of here. It is not going back in as a gift.',
  'strip:puddle': 'I fish the puddle. I catch the reflection of a camera and a bottle cap. I keep the cap out of spite and drop it again.',
  'strip:camera': 'The mount is four metres up and the strip is nineteen centimetres long. Arithmetic wins.',
  'strip:drone': 'SW-9 goes rigid. "Please do not conduct unlicensed magnetics near my memory." Fair.',

  'badge:door': 'The door does not read. The door is read *to*. The terminal is the mouth.',
  'badge:grate': 'It has been in the drain once. It did not enjoy it and neither did I.',
  'badge:camera': 'Holding an expired credential up to a lens is how you get a very specific file opened about you.',
  'badge:vending': 'The dispenser does not accept subcontract credentials. The dispenser has standards, which is more than the door has.',
  'badge:drone': 'SW-9 examines the badge. "That subcontract lapsed. This unit is not equipped for feelings about that."',

  'key:door': 'The key talks to systems, and a door is not a system. A door is a decision.',
  'key:vending': 'The dispenser is out of scope for this work order, and it knows it, and it is smug about it.',
  'key:camera': 'The mount has a service port I cannot reach from the ground. The terminal can reach it for me.',
  'key:grate': 'Storm drains are Water. This is Sanitation. The city is very clear about which of its hands is which.',

  'ration:drone': 'SW-9 studies the nutrient brick for a long moment. "This unit does not metabolise. This unit is, however, touched."',
  'ration:terminal': 'Feeding the terminal a nutrient brick. It would probably accept it and bill me.',
  'ration:grate': 'I am not feeding the drain. Something down there is already talking.',
  'ration:door': 'Sliding food under a door I cannot open, to a contact who does not know I am here. Beautifully useless.',
};

/** When nothing specific is written, at least be specific about the *item*. */
export const ITEM_FALLBACK: Record<ItemId, string[]> = {
  knife: [
    'I could cut it. I would then be a woman standing in the rain holding two smaller problems.',
    'The blade goes in, the blade comes out, and the alley is exactly as locked as before.',
  ],
  shard: [
    'I am not showing my broken half-name to anything that is not obliged to read it.',
    'The shard is the last argument I have. It does not get spent on this.',
  ],
  strip: [
    'Magnetism has a shortlist and that is not on it.',
    'Nineteen centimetres of bent steel. Ambitious, but no.',
  ],
  badge: [
    'The badge means something to municipal systems. That is not one.',
    'Expired sanitation paperwork is a key to exactly one lock in this alley.',
  ],
  key: [
    'The diagnostic key wants a maintenance port. That has no port, no plate, and no interest.',
    'A live work order, offered to something that does not do work.',
  ],
  ration: [
    'Nothing here eats.',
    'FLAVOUR: DECIDED. Recipient: undecided.',
  ],
};

/** Clicks on nothing in particular. */
export const NOWHERE_LINES: string[] = [
  'Wet concrete and municipal opinion. That is the whole inventory of this alley.',
  'Rain. More rain. Rain with ambitions.',
  'Nothing there, and something is definitely watching me check.',
];
