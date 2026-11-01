/* Four daytime Gotham themes. Every color starts from a sample of the reference stills, lightened or deepened only as far as reading needs. */
window.PALETTES = {
  dust: {
    name: 'Dust', from: 'Hazy sun fading into smoke',
    sky: ['#ebdfc8', '#dfd0b9', '#d0c0ae', '#c6b6a8'], glow: 'rgba(250,214,148,.5)', paper: '#efe6d4',
    ink: '#221b17', ink2: '#544539', line: '#43352b', lineRest: 'rgba(67,53,43,.68)', accent: '#9c4a1b', grid: 'rgba(67,53,43,.08)',
  },
  smog: {
    name: 'Smog', from: 'Overcast grey, with the green pulled back and a little blue haze settling low',
    sky: ['#dddcd5', '#cfd1ce', '#bfc4c6', '#aeb6bb'], glow: 'rgba(238,236,222,.5)', paper: '#e5e5e0',
    ink: '#14181b', ink2: '#3a4347', line: '#2a3338', lineRest: 'rgba(42,51,56,.7)', accent: '#7a4a10', grid: 'rgba(42,51,56,.085)',
  },
  sodium: {
    name: 'Sodium', from: 'Low orange sun, 5% less saturated than the first version',
    sky: ['#f2dcbd', '#e9caa8', '#ddb697', '#cda489'], glow: 'rgba(252,214,154,.62)', paper: '#f5e6ce',
    ink: '#1f1410', ink2: '#4c3227', line: '#42281c', lineRest: 'rgba(66,40,28,.7)', accent: '#873813', grid: 'rgba(66,40,28,.085)',
  },
  storm: {
    name: 'Storm', from: 'The mauve storm clouds on the right of the wide city still, with a trace of yellow sun',
    sky: ['#e8ded6', '#dbcec8', '#cbbcb8', '#bbaaaa'], glow: 'rgba(252,215,148,.34)', paper: '#efe7e0',
    ink: '#201a1d', ink2: '#483b42', line: '#3d3138', lineRest: 'rgba(61,49,56,.7)', accent: '#8f3a1f', grid: 'rgba(61,49,56,.085)',
  },
};
window.contrast = (a, b) => {
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + .05) / (y + .05);
};
