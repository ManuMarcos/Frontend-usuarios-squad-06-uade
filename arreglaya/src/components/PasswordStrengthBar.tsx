import React from "react";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { passwordScore, checkPasswordCriteria } from "../utils/validators";
export default function PasswordStrengthBar({
  password,
}: {
  password: string;
}) {
  const score = passwordScore(password);
  const pct = (score / 5) * 100;
  const labels = [
    "Muy débil",
    "Débil",
    "Mejorable",
    "Buena",
    "Fuerte",
    "Fuerte",
  ];
  const colors = [
    "error",
    "error",
    "warning",
    "info",
    "success",
    "success",
  ] as const;
  const label = labels[score];
  const color = colors[score];
  const c = checkPasswordCriteria(password);
  return (
    <Stack spacing={1}>
      <LinearProgress variant="determinate" value={pct} color={color} />
      <Typography variant="caption">
        Seguridad: <b>{label}</b> — Requisitos: {c.length ? "✔️" : "❌"} 8+,
        {c.upper ? "✔️" : "❌"} mayúscula, {c.lower ? "✔️" : "❌"} minúscula,{" "}
        {c.number ? "✔️" : "❌"} número, {c.symbol ? "✔️" : "❌"} símbolo
      </Typography>
    </Stack>
  );
}
