// Nút chia sẻ mạng xã hội (link thuần, không cần thư viện).
const NETWORKS = [
  {
    name: "Facebook",
    color: "#3b5998",
    href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    path: "M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3h-3V9c0-.6.4-1 1-1z",
  },
  {
    name: "X",
    color: "#000",
    href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    path: "M6 5h3.5l3.2 4.5L16.6 5H18l-4.6 5.6L19 19h-3.5l-3.5-5-4.2 5H6.4l5-6L6 5z",
  },
  {
    name: "Telegram",
    color: "#37aee2",
    href: (u: string, t: string) => `https://t.me/share/url?url=${u}&text=${t}`,
    path: "M5 11.5l13-5c.6-.2 1.1.1.9.9l-2.2 10.4c-.2.7-.6.9-1.2.5l-3.3-2.4-1.6 1.5c-.2.2-.3.3-.7.3l.2-3.4 6.2-5.6c.3-.2-.1-.4-.4-.2L8.2 13 5 12c-.7-.2-.7-.7 0-.5z",
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    href: (u: string, t: string) => `https://api.whatsapp.com/send?text=${t}%20${u}`,
    path: "M12 4a8 8 0 0 0-6.9 12l-1.1 4 4.1-1.1A8 8 0 1 0 12 4zm4.2 11.2c-.2.5-1 1-1.5 1-.4.1-.9.1-1.5-.1-3-1.1-4.7-4-4.9-4.2-.1-.2-1-1.3-1-2.5s.6-1.7.9-2c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.6c.1.1.1.3 0 .4l-.3.4-.3.3c-.1.1-.2.3-.1.5.2.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.5.7c.2.1.4.2.4.3.1.1.1.6-.1 1z",
  },
  {
    name: "Reddit",
    color: "#ff5700",
    href: (u: string, t: string) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
    path: "M19 12a1.7 1.7 0 0 0-2.9-1.2 8.3 8.3 0 0 0-4.4-1.4l.8-3.5 2.4.5a1.2 1.2 0 1 0 .1-.7l-2.8-.6-.9 4.3c-1.7 0-3.3.5-4.5 1.4A1.7 1.7 0 1 0 5 13.6v.4c0 2.5 3.1 4.5 7 4.5s7-2 7-4.5v-.4c.6-.3 1-.9 1-1.6zM8.5 13.3a1.1 1.1 0 1 1 2.2 0 1.1 1.1 0 0 1-2.2 0zm6 2.9c-.7.7-2 .8-2.5.8s-1.8-.1-2.5-.8a.3.3 0 0 1 .4-.4c.4.4 1.4.6 2.1.6s1.7-.2 2.1-.6a.3.3 0 0 1 .4.4zm-.1-1.8a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z",
  },
];

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="yokai-socials-wrapper">
      {NETWORKS.map((n) => (
        <a
          key={n.name}
          className="social-share-button"
          href={n.href(u, t)}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${n.name}`}
          aria-label={`Share on ${n.name}`}
        >
          <svg viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="12" fill={n.color} />
            <path d={n.path} fill="#fff" />
          </svg>
        </a>
      ))}
    </div>
  );
}
