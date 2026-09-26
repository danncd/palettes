# Palettes

**Live at [palettes.danncd.com](https://palettes.danncd.com)**

A color palette generator built with TypeScript, HTML, and CSS. Vite handles local development and production builds.

Generate one to eight colors, lock individual colors, edit hex values, choose shades, undo changes, copy colors, and export a PNG.

## Development

Use Node.js 24, then run:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run typecheck
npm run format:check
npm run build
```

The production site is written to `dist/`. Run `npm run preview` to preview it locally.

## Structure

- `config.json`: five named startup presets and default colors for added swatches. A random preset opens on each page load; Reset returns to that visit’s starting preset.
- `src/palette/`: palette state, actions, and history.
- `src/color/`: conversions, shades, contrast, and color names.
- `src/ui/`: swatches, toolbar, editor, and feedback.
- `src/app/`: application setup, icons, and keyboard controls.
- `src/browser/`: clipboard and PNG export.
- `src/styles/`: theme, layout, and component styles.
- `tests/`: color calculations, state transitions, and DOM interactions.

The interface uses system fonts, neutral surfaces, and a constrained palette width. On smaller screens, colors stack vertically. Shades replace the bottom toolbar while editing a color.

Space generates a palette when focus is outside typing fields and ordinary action buttons. Locked colors remain unchanged. Escape closes the editor. Individual undo changes one color; global undo restores the previous palette operation, including its individual histories.

## Deployment

The included GitHub Actions workflow builds and publishes `dist/`. Before deploying this version, change the repository's Pages source to **GitHub Actions**. The existing live site currently uses branch-based publishing. `public/CNAME` preserves the custom domain in the build output.

## Credits

Color naming uses [Name that Color](https://chir.ag/projects/name-that-color/) by Chirag Mehta, licensed under [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/). Its original code and license notice are retained in `public/vendor/ntc.js`.

PNG export uses [html2canvas](https://html2canvas.hertzen.com/) under the MIT license. Its original license notice is retained in `public/vendor/html2canvas.js`.

Icons use [Lucide](https://lucide.dev/) under the ISC license.
