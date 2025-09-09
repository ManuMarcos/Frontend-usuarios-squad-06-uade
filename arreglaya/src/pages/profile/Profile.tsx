import React from "react";
import { useAuth } from "../../auth/AuthProvider";
import CustomerProfile from "./CustomerProfile";
import ContractorProfile from "./ContractorProfile";
import AdminProfile from "./AdminProfile";
import { Paper, Typography } from "@mui/material";
export default function Profile() {
  const { user } = useAuth();
  if (!user)
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Iniciá sesión para ver tu perfil.</Typography>
      </Paper>
    );
  if (user.role === "customer") return <CustomerProfile />;
  if (user.role === "contractor") return <ContractorProfile />;
  return <AdminProfile />;
}
