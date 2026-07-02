// Client-only : on redimensionne + ré-encode toute image uploadée AVANT de l'envoyer.
// Triple but : garder le payload petit (limite de body Vercel ~4.5 Mo), et NORMALISER
// le type (HEIC/SVG/… → JPEG) car l'API Anthropic n'accepte que jpeg/png/gif/webp.

export type LoadedImage = { media_type: string; data: string; url: string };

const MAX_DIM = 1400;
const QUALITY = 0.82;

export function fileToImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier échouée."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible (format non supporté ?)."));
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_DIM / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round((img.width || 1) * scale));
          const h = Math.max(1, Math.round((img.height || 1) * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas indisponible."));
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL("image/jpeg", QUALITY);
          resolve({ media_type: "image/jpeg", data: out.slice(out.indexOf(",") + 1), url: out });
        } catch (e: any) {
          reject(new Error(e?.message || "Conversion image échouée."));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
