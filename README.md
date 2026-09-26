# Palettes

**Live at [palettes.danncd.com](https://palettes.danncd.com)**

A color palette generator built with TypeScript, HTML, and CSS.

Generate up to eight colors, lock the ones you like, adjust their shades, and export the palette as a PNG. Each visit starts with one of five preset palettes.

## Running locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

To build and preview:

```sh
npm run build
npm run preview
```

## Customizing presets

Edit `presets` in `config.json`. Each preset contains a name and five colors:

```json
{
    "name": "Sage and clay",
    "colors": ["#425566", "#849C94", "#D7DFD3", "#E9DCC8", "#BB8066"]
}
```

A preset is selected randomly on page load. Reset restores that visit’s starting palette.

## Project structure

```text
src/
    app/        Application setup and keyboard controls
    palette/    State, actions, and undo history
    color/      Color calculations and naming
    ui/         Palette, toolbar, and editor
    browser/    Copying and PNG export
    styles/     Theme and layout
```

## Checks

```sh
npm test
npm run typecheck
npm run format:check
```

## Credits

[Name that Color](https://chir.ag/projects/name-that-color/) for color names, [html2canvas](https://html2canvas.hertzen.com/) for PNG export, and [Lucide](https://lucide.dev/) for icons.
