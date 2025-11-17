import React, { useState } from "react";
import { Button, LinearProgress, Stack, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import api from "../api/http";

type Props = {
  userId: number;
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

const ProfileImageUploader: React.FC<Props> = ({ userId, onUploaded, disabled = false }) => {
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
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post(
        "/api/files/presign-upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { imageUrl } = uploadRes.data || {};
      if (!imageUrl) throw new Error("Respuesta inválida del servidor");

      onUploaded(imageUrl);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Error subiendo imagen";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ flexWrap: "wrap", width: "100%" }}
      >
        <Button
          variant="outlined"
          component="label"
          startIcon={<ImageIcon />}
          disabled={loading || disabled}
        >
          Elegir archivo
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={disabled}
          />
        </Button>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
          title={file?.name}
        >
          {file ? file.name : "Ningún archivo seleccionado"}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={handleUpload}
          disabled={loading || !file || disabled}
        >
          {loading ? "Subiendo..." : "Subir imagen"}
        </Button>
        {err && (
          <Typography variant="body2" color="error">
            {err}
          </Typography>
        )}
      </Stack>

      {loading && <LinearProgress />}

      <Typography variant="caption" color="text.secondary">
        Formatos recomendados: JPG/PNG, máximo 5 MB.
      </Typography>
    </Stack>
  );
};

export default ProfileImageUploader;
