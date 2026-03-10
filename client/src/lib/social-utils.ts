const platformBaseUrls: Record<string, string> = {
  linkedin: "https://linkedin.com/in/",
  x: "https://x.com/",
  twitter: "https://x.com/",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/@",
  youtube: "https://youtube.com/@",
  snapchat: "https://snapchat.com/add/",
  github: "https://github.com/",
};

const platformPlaceholders: Record<string, string> = {
  linkedin: "@yourhandle",
  x: "@yourhandle",
  twitter: "@yourhandle",
  instagram: "@yourhandle",
  facebook: "@yourhandle",
  tiktok: "@yourhandle",
  youtube: "@yourhandle",
  snapchat: "@yourhandle",
  github: "@yourhandle",
  website: "https://yourwebsite.com",
};

function looksLikeUrl(value: string): boolean {
  return value.includes(".") || value.includes("/") || value.startsWith("www.");
}

export function socialHandleToUrl(platform: string, value: string): string {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (looksLikeUrl(value)) {
    return `https://${value}`;
  }

  const handle = value.replace(/^@/, "");

  const baseUrl = platformBaseUrls[platform];
  if (baseUrl) {
    return `${baseUrl}${handle}`;
  }

  return `https://${value}`;
}

export function getSocialPlaceholder(platform: string): string {
  return platformPlaceholders[platform] || "Username or URL";
}
