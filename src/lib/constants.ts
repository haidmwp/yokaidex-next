export const SITE_NAME = "YokaiDex";
export const SITE_TAGLINE = "Where you can find all information from Yokai-Watch games!";
export const SITE_DESCRIPTION =
  "The site contains informations about all the yo-kais, their favorite foods, locations, items, evolutions, stats, etc.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yokaidex.com";
export const OG_IMAGE = "/img/ui/og-image.jpg";

export const RANKS = ["S", "A", "B", "C", "D", "E"] as const;
export const ATTRIBUTES = ["Drain", "Earth", "Fire", "Ice", "Lightning", "Restoration", "Water", "Wind"] as const;
export const TRIBES = [
  "Brave",
  "Charming",
  "Eerie",
  "Enma",
  "Heartful",
  "Mysterious",
  "Shady",
  "Slippery",
  "Tough",
  "Wandroid",
  "Wicked",
] as const;

export const PALETTE = [
  "#E85A3D",
  "#FFC648",
  "#FF8041",
  "#FBA6CC",
  "#6DAA73",
  "#68E7EC",
  "#AA90B4",
  "#5D5DFF",
  "#758EFF",
  "#489999",
  "#4183A4",
];

const TRIBE_IMAGE: Record<string, string> = { Charming: "Charm" };

export const rankImage = (rank: string) => `/img/rank/${rank}.png`;
export const tribeImage = (tribe: string) => `/img/tribe/${TRIBE_IMAGE[tribe] ?? tribe}.png`;
export const attributeImage = (attr: string) => `/img/attribute/${attr}.png`;

/** Medallium theo game: /yokai-watch-1, /yokai-watch-2, /yokai-watch-3 */
export const YOKAI_GAMES = [
  { game: 1, title: "Yo-kai Watch 1", logo: "/img/ui/Yo-kai_Watch_logo.webp" },
  { game: 2, title: "Yo-kai Watch 2", logo: "/img/ui/Yo-kai_Watch_2_logo.webp" },
  { game: 3, title: "Yo-kai Watch 3", logo: "/img/ui/Yo-kai_Watch_3_logo.webp" },
] as const;

export const yokaiGame = (game: number) => YOKAI_GAMES.find((g) => g.game === game) ?? YOKAI_GAMES[2];
export const yokaiListHref = (game: number) => `/yokai-watch-${game}`;
export const yokaiHref = (game: number, slug: string) => `/yokai-watch-${game}/${slug}`;

/** yokaiGame: link đáp án dẫn tới Medallium của game nào */
export const BAFFLE_GAMES = [
  { id: "yw3", title: "Yo-kai Watch 3", hasLocation: true, yokaiGame: 3 },
  { id: "yw2", title: "Yo-kai Watch 2", hasLocation: true, yokaiGame: 2 },
  { id: "gate-of-whimsy", title: "Gate of Whimsy: Quiz Room Baffle Boards", hasLocation: false, yokaiGame: 3 },
] as const;

export const PASSWORD_GAMES = [
  { game: 1, title: "PW Yo-kai Watch 1", color: "#7A9BBF", logo: "/img/ui/Yo-kai_Watch_logo.webp" },
  { game: 2, title: "PW Yo-kai Watch 2", color: "#E85A3D", logo: "/img/ui/Yo-kai_Watch_2_logo.webp" },
  { game: 3, title: "PW Yo-kai Watch 3", color: "#6DAA73", logo: "/img/ui/Yo-kai_Watch_3_logo.webp" },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "icon-home.png", match: ["/"], divider: true },
  { href: "/medallium", label: "Medallium", icon: "icon-medallium.png", match: ["/medallium", "/yokai-watch"] },
  { href: "/qr-code", label: "QR Code", icon: "icon-qr-code.png", match: ["/qr-code"] },
  { href: "/baffle-board", label: "Baffle Board", icon: "icon-baffle-board.png", match: ["/baffle-board"] },
  { href: "/attitudes", label: "Attitudes", icon: "icon-attitudes.png", match: ["/attitudes"], divider: true },
  { href: "/password", label: "Password", icon: "icon-password.png", match: ["/password"] },
  { href: "/rare-special-soul", label: "RARE Special Soul", icon: "icon-soul.png", match: ["/rare-special-soul"] },
  { href: "/food", label: "Food", icon: "icon-food.png", match: ["/food"], divider: true },
  { href: "/contact", label: "Contact Us", icon: "icon-contact.png", match: ["/contact"] },
  { href: "/privacy-policy", label: "Privacy Policy", icon: "icon-policy.png", match: ["/privacy-policy"] },
  { href: "/changelog", label: "Changelog", icon: "icon-changelog.png", match: ["/changelog"] },
];

/** Tiêu đề trang; phần " | <tiêu đề website>" do layout ghép theo Cài đặt chung. */
export const pageTitle = (title?: string) => title;
