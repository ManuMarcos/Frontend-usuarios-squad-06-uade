// src/pages/profile/Profile.tsx
import React from "react";
import { useAuth } from "../../auth/AuthProvider";
import CustomerProfile from "./CustomerProfile";
import ContractorProfile from "./ContractorProfile";
import AdminProfile from "./AdminProfile";
import { Paper, Typography } from "@mui/material";
import { toUiRole } from "../../auth/routeUtils";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Iniciá sesión para ver tu perfil.</Typography>
      </Paper>
    );
  }

  const role = toUiRole(user.role);
  if (role === "customer") return <CustomerProfile />;
  if (role === "contractor") return <ContractorProfile />;
  return <AdminProfile />;
}