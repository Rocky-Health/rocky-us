// Minimal layout for flows
// Simplified to avoid duplication with template components

export const metadata = {
  title: "MyRocky - Your Health Partner",
  description: "Get professional healthcare advice and treatment online",
  openGraph: {
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
  twitter: {
    card: "Get professional healthcare advice and treatment online",
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
};

export default function FlowsLayout({ children }) {
  return <>{children}</>;
}
