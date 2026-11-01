/* The three candidates. Every color starts from a sample of the reference stills, lightened or deepened only as far as reading needs. */
window.PALETTES = {
  dust: {
    name: 'Dust', from: 'Hazy sun fading into smoke, from the two sunset stills and the city still',
    sky: ['#ebdfc8', '#dfd0b9', '#d0c0ae', '#c6b6a8'], glow: 'rgba(250,214,148,.5)', paper: '#efe6d4',
    ink: '#221b17', ink2: '#544539', line: '#43352b', lineRest: 'rgba(67,53,43,.68)', accent: '#9c4a1b', grid: 'rgba(67,53,43,.08)',
  },
  smog: {
    name: 'Smog', from: 'Grey-green overcast, from the skyline with the statue',
    sky: ['#d9dacb', '#cdcfbf', '#bfc3b1', '#b1b6a2'], glow: 'rgba(240,233,205,.55)', paper: '#e1e2d5',
    ink: '#14181a', ink2: '#3c4446', line: '#2b3335', lineRest: 'rgba(43,51,53,.7)', accent: '#7f4f12', grid: 'rgba(43,51,53,.085)',
  },
  sodium: {
    name: 'Sodium', from: 'Low orange sun, from the skyline at dusk',
    sky: ['#f3dcbc', '#ebcaa6', '#dfb695', '#cfa487'], glow: 'rgba(255,214,150,.65)', paper: '#f6e6cd',
    ink: '#1f1410', ink2: '#4d3226', line: '#43281b', lineRest: 'rgba(67,40,27,.7)', accent: '#8a3710', grid: 'rgba(67,40,27,.085)',
  },
};
window.contrast = (a, b) => {
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + .05) / (y + .05);
};
