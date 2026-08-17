import type { ItemId } from '../game/types';

export interface ItemDef {
  id: ItemId;
  name: string;
  /** right-click / examine text */
  examine: string;
  /** short line shown in the HUD while the item is selected */
  hint: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  shard: {
    id: 'shard',
    name: 'Cracked Identity Shard',
    examine:
      'Half a citizen. The residency block is intact, the name field is a burn scar, and the checksum trails off mid-thought. A scanner will read it and decide I am a rounding error.',
    hint: 'Cracked Identity Shard — incomplete credentials.',
  },
  knife: {
    id: 'knife',
    name: 'Ceramic Utility Knife',
    examine:
      'Non-conductive, non-magnetic, invisible to gate sensors. Excellent at cutting, prying and being the wrong tool for almost everything in this alley.',
    hint: 'Ceramic Utility Knife — cuts and pries. Nonconductive.',
  },
  strip: {
    id: 'strip',
    name: 'Magnetic Retrieval Strip',
    examine:
      'A theft-deterrent strip out of a vending machine, bent into a hook. Municipal steel is cheap, which means municipal steel is magnetic.',
    hint: 'Magnetic Retrieval Strip — reaches things hands cannot.',
  },
  badge: {
    id: 'badge',
    name: 'Municipal Service Badge',
    examine:
      'SANITATION SUBCONTRACT · SECTOR 12. Laminate delaminated, holder field scorched blank, validity expired eleven months ago. The city still recognises the shape of its own paperwork.',
    hint: 'Municipal Service Badge — expired, holder field blank.',
  },
  key: {
    id: 'key',
    name: 'Drone Diagnostic Key',
    examine:
      'A stubby maintenance dongle, still warm from SW-9. It carries a live work-order number, which is the only kind of truth a terminal respects.',
    hint: 'Drone Diagnostic Key — carries a live work order.',
  },
  ration: {
    id: 'ration',
    name: 'Nutrient Brick',
    examine:
      'FLAVOUR: DECIDED. Vaguely warm, vaguely orange, technically food. Eating one steadies the hands, which is the whole reason anyone eats them.',
    hint: 'Nutrient Brick — use on myself to steady my nerve.',
  },
};

/** Items every playthrough begins with. */
export const STARTING_ITEMS: ItemId[] = ['shard', 'knife'];
