# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Project Installation

1. Ensure you have [Node.js](https://nodejs.org) installed (version 14 or above recommended).
2. Clone the repository and navigate to the project directory.
3. Run the following to install dependencies:

   ```
   npm install
   ```

## Development Server

To run the local development server with hot module replacement, run:

```
npm run dev
```

This starts the server on `http://localhost:3000` (or another available port).

## Build for Production

To create a production build of the app, run:

```
npm run build
```

This outputs static assets to the `dist` folder.

## Preview Production Build

To locally preview the production build, run:

```
npm run preview
```

## Testing

This project uses [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) for component tests.

To run tests, execute:

```
npm run test
```

Ensure tests for UI behavior and accessibility are passing.

## Accessibility Guidelines

- Keyboard focus styles are implemented using visible outlines and shadow.
- Reduced motion support respects user preference to reduce animations.
- Ensure color contrast meets WCAG AA standards.

## Responsive Design

The app is designed to be responsive on common breakpoints: 1440px (desktop), 1024px (tablet), and 375px (mobile).

## Assets

- All assets should be placed in the `src/assets` or `public/assets` folder.
- Assets should be optimized and provided in multiple formats (webp, avif, png) and sizes for performance.

## Packaging for Handoff

Package the entire project directory including:

- Source code (`src/`)
- Public assets (`public/`)
- Dependency manifests (`package.json`, `package-lock.json`)
- Configuration files (`vite.config.js`, `tailwind.config.js`, ESLint config, etc.)
- README.md with installation, build, testing, and usage instructions.

Ensure all extracted and optimized assets are included.

## Support

For issues or questions, please open an issue in the repository or contact the maintainer.
