import { useState } from "react";
import { downloadVCard, type VCardData } from "@/lib/vcard";
import type { Profile } from "@shared/schema";

interface KonexSaveContactCTAProps {
  profile: Profile;
}

export default function KonexSaveContactCTA({ profile }: KonexSaveContactCTAProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const links = (profile.links || {}) as Record<string, string>;

  const handleSaveContact = () => {
    try {
      const vcardData: VCardData = {
        name: profile.name,
        title: profile.title || undefined,
        company: profile.company || undefined,
        phone: links.phone,
        whatsapp: links.whatsapp,
        email: links.email,
        website: links.website,
        photoUrl: profile.photoUrl || undefined,
      };
      downloadVCard(vcardData);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      console.error("Save contact failed", e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-4" data-testid="konex-save-contact-cta">
      <button
        onClick={handleSaveContact}
        className="konex-save-contact-btn"
        data-testid="button-add-to-contacts"
      >
        Add to Contacts
      </button>

      {status === "success" && (
        <div className="konex-save-contact-feedback konex-save-contact-success" data-testid="text-contact-saved">
          Contact saved.
        </div>
      )}

      {status === "error" && (
        <div className="konex-save-contact-feedback konex-save-contact-error" data-testid="text-contact-error">
          Couldn't save contact. Please try again.
        </div>
      )}
    </div>
  );
}
