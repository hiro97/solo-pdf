# SOLO PDF

Privacy-first local PDF editor. Zero upload. All processing happens in your browser.

## Features

- **100% Local Processing** - Your files never leave your device
- **No Upload Required** - All PDF operations happen in your browser
- **Privacy Guaranteed** - No server, no tracking, no data collection

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide React](https://lucide.dev/) - Icons
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme switching

## Project Structure

```
solo-pdf/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ads/               # Ad slot components
│   ├── nav/               # Navigation (Navbar, Footer)
│   ├── seo/               # SEO components (JsonLd, Breadcrumbs)
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and constants
├── styles/                # Global styles
└── public/                # Static assets
```

## License

MIT
