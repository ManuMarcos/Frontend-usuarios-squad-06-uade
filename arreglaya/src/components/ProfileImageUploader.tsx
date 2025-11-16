import React, { useState } from "react";

type Props = {
  userId: number;
  onUploaded: (url: string) => void;
};

// cast a any para que TS no rompa
const _env = (import.meta as any).env || {};
const API_BASE: string = _env.VITE_API_URL || "http://localhost:8080";

const S3_BASE: string = _env.VITE_S3_PUBLIC_BASE || "";

const ProfileImageUploader: React.FC<Props> = ({ userId, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setErr(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setErr("Elegí una imagen");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const ext = file.type.split("/")[1] || "jpg";
      const wantedKey = `users/${userId}/profile.${ext}`;

      // 1) pedir URL prefirmada al backend
      const presignRes = await fetch(`${API_BASE}/api/files/presign-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: wantedKey,
          contentType: file.type,
          expiresIn: 600,
        }),
      });

      if (!presignRes.ok) {
        throw new Error("No se pudo obtener la URL de subida");
      }

      const presignJson = await presignRes.json();
      const uploadUrl: string = presignJson.url;
      const headers: Record<string, string> = presignJson.headers || {};
      const finalKey: string = presignJson.key || wantedKey;

      // 2) subir a S3 con la URL prefirmada
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers,
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("No se pudo subir la imagen");
      }

      // 3) armar la URL pública
      const publicUrl = S3_BASE ? `${S3_BASE}/${finalKey}` : finalKey;

      onUploaded(publicUrl);
    } catch (e: any) {
      setErr(e.message || "Error subiendo imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input type="file" accept="image/*" onChange={handleChange} />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Subiendo..." : "Subir"}
      </button>
      {err && <span style={{ color: "red", fontSize: 12 }}>{err}</span>}
    </div>
  );
};

export default ProfileImageUploader;
