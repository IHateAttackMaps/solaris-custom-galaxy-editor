export const MenuStates = [
    'none',
    'settings',
    'star',
    'carrier',
    'selectObject',
    'playerList',
    'player',
    'ruler',
    'select',
    'brush',
    'help',
    'transform',
    'randomise',
    'json'
] as const;

export type MenuState = typeof MenuStates[number];