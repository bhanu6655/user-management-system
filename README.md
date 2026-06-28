# User Management Dashboard

A lightweight React + Vite application for managing users: view, search, filter, add, edit, and delete user records.

## Features
- Responsive users table with sorting and filtering
- Add / edit users via modal forms
- Delete confirmation modal
- Toast notifications and stats bar

## Tech Stack
- React (JSX)
- Vite (dev server + build)
- CSS for styles

## Quick Start

Prerequisites: Node.js (14+), npm or yarn.

1. Install dependencies

```bash
npm install
# or
yarn
```

2. Run the dev server

```bash
npm run dev
# or
yarn dev
```

3. Open the app

Open http://localhost:5173 in your browser (Vite will show the exact URL).

## Scripts
- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
- `npm test` — run tests (if available)

## Testing
Run the test suite (Jest + Testing Library are used in this repo):

```bash
npm test
```

See the [tests](tests/) folder for unit tests and setup files.

## Project Structure

- [src](src/) — application source
  - `App.jsx`, `main.jsx` — app entry
  - `api.js` — API helpers
  - `hooks.js` — custom hooks
  - `utils.js` — shared utilities
  - components/ — React components (e.g. `UsersTable.jsx`, `UserModal.jsx`)
- [public](public/) — static assets
- [tests](tests/) — test files and test setup

## Contributing
- Fork the repo and open a PR with a clear description.
- Keep changes focused and add tests for new features or bug fixes.

## Notes
- This project uses Vite for fast development and build workflows.
- Adjust ports and scripts in `vite.config.js` and `package.json` if needed.

## License
Specify your license here (e.g., MIT). If you want, I can add a `LICENSE` file.

---

If you'd like, I can also:
- add badges (build / test / coverage),
- add a `CONTRIBUTING.md`, or
- commit and push these changes for you.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
