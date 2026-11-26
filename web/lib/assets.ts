const root = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/materials/";
export const heroPhoto = root + "studio.webp";
export const mobileHeroPhoto = root + "studio-mobile.webp";
export function materialPhoto(category: string, image?: string) {
  if (image && /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(image))
    return "/media.php?f=" + image;
  return ["sheets", "insulation", "cable", "electrical"].includes(category)
    ? root + category + ".webp"
    : heroPhoto;
}
