/** Default Tailwind config (no theme extensions).
 *  Preflight is off so Tailwind's global reset doesn't restyle the existing notes site;
 *  the hero re-applies the few resets it needs, scoped to .fp (see src/hero.css). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
};
