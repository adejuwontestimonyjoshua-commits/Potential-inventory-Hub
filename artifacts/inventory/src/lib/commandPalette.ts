type Listener = () => void;
const listeners: Listener[] = [];
export function openCommandPalette() { listeners.forEach(fn => fn()); }
export function onCommandPaletteOpen(fn: Listener) { 
  listeners.push(fn); 
  return () => { 
    const i = listeners.indexOf(fn); 
    if (i > -1) listeners.splice(i, 1); 
  }; 
}
