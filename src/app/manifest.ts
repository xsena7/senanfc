import type { MetadataRoute } from "next";

// App instalável (PWA): ícone na tela do celular, abre direto no painel, em tela cheia
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/painel",
    name: "Sena NFC",
    short_name: "Sena NFC",
    description: "Ative e configure as placas NFC.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05070d",
    theme_color: "#05070d",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Clientes", url: "/painel/clientes", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Vendas", url: "/painel/vendas", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
