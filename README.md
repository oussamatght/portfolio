# 🐉 Linux Portfolio — Kali-Inspired Developer Desktop

> **A portfolio with a desktop experience.** Explore my profile, projects, and developer tools through a web interface inspired by the look and feel of a Linux desktop and Kali Linux.

Built with **React, TypeScript, Vite, and Tailwind CSS**.

<!-- Add a screenshot when available:
![Linux Portfolio preview](./public/preview.png)
-->

## ✨ About the Project

Linux Portfolio is a personal portfolio designed to feel more interactive than a traditional portfolio website. Instead of presenting everything as a standard landing page, it uses a desktop-inspired interface where visitors can explore different parts of my developer profile.

The project combines a dark, terminal-inspired visual style with reusable React components and structured data for profile information and projects.

## 🚀 Features

- **Desktop-inspired interface** — a Linux/Kali-inspired visual environment in the browser.
- **Window-based UI** — dedicated windows and components to organize the experience.
- **File Manager** — browse portfolio content and projects through a file-manager-style interface.
- **Terminal-inspired component** — a terminal-style part of the portfolio experience.
- **Intro splash screen** — a branded opening experience before entering the desktop.
- **Project showcase** — project information maintained in a dedicated data module.
- **Profile section** — personal and developer information kept separate from the UI components.
- **Reusable React components** — a component-based structure that makes the interface easier to maintain and extend.
- **TypeScript** — typed code to improve maintainability and catch errors during development.
- **Vite development workflow** — fast local development with Hot Module Replacement (HMR).

> This is a **Kali-inspired portfolio UI**, not a Kali Linux operating system or a real Linux desktop environment.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev/) | Build the user interface with reusable components |
| [TypeScript](https://www.typescriptlang.org/) | Add static types to JavaScript |
| [Vite](https://vite.dev/) | Development server and production build tooling |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| ESLint | Code-quality and linting checks |

## 📁 Project Structure

```text
linuxportfolio/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── Desktop.tsx     # Main desktop experience
│   │   ├── FileManager.tsx # File-manager interface
│   │   ├── LogoSplash.tsx  # Intro splash screen
│   │   ├── TerminalApp.tsx # Terminal-inspired component
│   │   └── WindowFrame.tsx # Reusable application window frame
│   ├── data/
│   │   ├── profile.ts      # Profile information
│   │   └── projects.ts     # Portfolio project data
│   ├── index.css           # Global styles
│   └── ...                 # App entry points and other source files
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

*The structure above reflects the main files currently referenced in the project; additional files may exist in your repository.*

## ⚙️ Getting Started

### Prerequisites

Install a recent version of **Node.js** and a package manager such as **npm** or **pnpm**.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd linuxportfolio
```

Replace `<YOUR_REPOSITORY_URL>` with your repository URL.

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

### 3. Start the development server

Using npm:

```bash
npm run dev
```

Or using pnpm:

```bash
pnpm dev
```

Open the local URL printed in your terminal by Vite, commonly `http://localhost:5173`.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check/build the project for production, according to the configured scripts |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview the production build locally |

Use the equivalent `pnpm` command if you use pnpm. The available commands are defined in `package.json`.

## 🛠️ Customization

### Update profile information

Edit the profile data in:

```text
src/data/profile.ts
```

### Add or update projects

Edit the project entries in:

```text
src/data/projects.ts
```

Follow the existing data shape in those files so the UI can continue to render the content correctly.

### Customize the appearance

Review the components in `src/components/` and the global stylesheet in `src/index.css` to change the desktop layout, window appearance, terminal styling, and other visual details.

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

To preview the generated build locally:

```bash
npm run preview
```

## 🗺️ Roadmap

Possible next improvements for the project include:

- Add screenshots or a short demo GIF to this README.
- Improve keyboard navigation and accessibility.
- Polish mobile and touch interactions.
- Expand file-manager interactions and desktop customization.
- Add a live demo link when the project is deployed.

## 🤝 Contributing

This is a personal portfolio project, but suggestions and constructive feedback are welcome. Open an issue or submit a pull request if contributions are enabled for the repository.

## 📄 License

No license has been specified yet. Add a `LICENSE` file and update this section before allowing others to reuse or redistribute the project.

---

<p align="center">
  Designed with a Linux-inspired mindset and built with React ⚡
</p>
