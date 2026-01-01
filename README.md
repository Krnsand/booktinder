<!-- # React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

JSX är ett syntax-tillägg till JavaScript som låter mig skriva HTML-liknande kod direkt i React-komponenter. Det gör UI-utveckling snabbare, tydligare och mer intuitiv.

Varför används JSX?

För att det gör det:

lättare att bygga upp sidor och komponenter

enklare att läsa koden

snabbare att skriva UI

Kortaste förklaringen:
JSX är HTML-liknande kod som man skriver direkt i JavaScript när man bygger React-appar. Det är fortfarande JavaScript — det bara ser ut som HTML för att göra det enklare att jobba med. -->


# Checklist: Requirements for G and VG

## G-Level Requirements (MUST)

### Planning & Research
- [X] Documented target group analysis (personas, needs, scenarios)
- [X] Use GitHub Projects / Trello / Linear for backlog & issues
- [X] Kanban board visible in the repository

### Design & Prototyping
- [X] Wireframes & prototype in Figma (desktop + mobile)
- [X] Responsive design (minimum mobile + desktop)
- [X] Basic WCAG 2.1 A (semantic HTML, alt text, contrast)
- [ ] Documented accessibility measures

### Application Development
- [X] Built with React (Vite/CRA)
- [X] Database (Supabase or Firestore) with CRUD functionality
- [X] State management (Zustand or React Context)
- [X] Dynamic components (swipe UI, filters, library)
- [X] Semantic HTML and basic WCAG implementation
- [X] Responsive web app (mobile + desktop)

### README & Version Control
- [X] GitHub repo with clear commit history
- [X] README with setup instructions
- [X] Public link + checklist included in README

### Final Report
- [X] 2–3 page written report
- [X] Includes abstract (English), tech stack, process, planning & research

### Deploy
- [X] Public deployment (Netlify, Vercel, or Firebase Hosting)
- [X] Working public link in README

### Overall Quality
- [X] No crashes or dead links
- [X] Consistent design system
- [X] Complete navigation and user flow


---

## VG-Level Requirements (EXTRA)

### Design & Prototyping (VG)
- [X] Interactive prototype in Figma (clickable)
- [ ] Full WCAG 2.1 A + AA
- [X] All WebAIM WAVE errors and warnings fixed

### Application Development (VG)
- [ ] Global state via Redux (or similar)
- [X] Full CRUD with secure data handling
- [X] Authentication (Firebase Auth / OAuth / JWT)
- [ ] Performance optimization (lazy loading, code-splitting, image compression)
- [X] Fully responsive from mobile → tablet → desktop

### Version Control & Workflow (VG)
- [X] Feature branches + pull requests
- [X] Clear commit messages
- [X] Documented workflow in repository

### Deploy (VG)
- [X] CI/CD pipeline (GitHub Actions or similar)
- [X] Automatic deploy on merge to main

### Final Report (VG)
- [ ] 3–6 pages
- [ ] Deep process analysis, challenges & solutions
- [ ] Motivation for chosen technologies
- [ ] Documented results from performance & accessibility tests

### Overall Quality (VG)
- [ ] Lighthouse performance & accessibility tests documented
- [ ] Keyboard navigation + accessibility testing completed
- [ ] List of implemented improvements included
