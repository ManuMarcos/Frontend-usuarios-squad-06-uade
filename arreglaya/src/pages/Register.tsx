import React from "react";
import {
  Paper, Stack, Typography, Button, Grid, FormControl, InputLabel, Select,
  MenuItem, Alert
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { registerUser } from "../api/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { BARRIOS_CABA, PROFESSIONS } from "../constants";
import PasswordField from "../components/PasswordField";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { isValidEmail, checkPasswordCriteria } from "../utils/validators";
import { saveProfile } from "../utils/profile";

export default function Register() {
  const navigate = useNavigate();

  // Form state
  const [role, setRole] = React.useState<"customer" | "contractor">("customer");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [barrio, setBarrio] = React.useState("");
  const [profession, setProfession] = React.useState("");

  // UX: touched para mostrar errores solo después de interactuar
  const [touched, setTouched] = React.useState<{[k: string]: boolean}>({});

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Validaciones amigables
  const criteria = checkPasswordCriteria(password);
  const pwOk = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol;
  const emailOk = isValidEmail(email);
  const nameErr = name.trim().length < 2;
  const emailErr = !!email && !emailOk;
  const passErr = !!password && !pwOk;
  const confirmErr = !!confirm && password !== confirm;
  const formOk = !nameErr && !emailErr && !passErr && !confirmErr && !!name && !!email && !!password && !!confirm;

  // Helpers
  function splitName(full: string) {
    const parts = full.trim().split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ") || firstName;
    return { firstName, lastName };
  }
  function mapRoleToApi(r: "customer" | "contractor") {
    return (r === "customer" ? "CLIENTE" : "PROVEEDOR") as "CLIENTE" | "PROVEEDOR";
  }
  function parseError(err: any): string {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err?.message;
    if (status === 409 || /exist/i.test(msg) || /ya existe/i.test(msg)) return "Ya existe una cuenta con ese correo.";
    if (status === 400) return "Revisá los datos ingresados.";
    if (!err?.response) return "No se pudo conectar con el servidor. Probá de nuevo.";
    return msg || "No se pudo crear la cuenta.";
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true }); // UX: forzamos mostrar errores si faltan
    if (!formOk) { setError("Revisá los campos marcados."); return; }

    setError(null);
    setLoading(true);
    try {
      const { firstName, lastName } = splitName(name);
      const roleApi = mapRoleToApi(role);

      await registerUser({ email, password, firstName, lastName, role: roleApi });

      saveProfile(email, { name, email, role, barrio, profession });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 900);
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3 }}>
          {/* UX: acción secundaria como link arriba */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            ¿Ya tenés cuenta? <RouterLink to="/login">Iniciá sesión</RouterLink>
          </Typography>

          <Typography variant="h4" fontWeight={800} mb={2}>Crear cuenta</Typography>

          {/* Mensajes globales */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>¡Listo! Te estamos llevando al inicio de sesión…</Alert>}

          {/* UX: una sola vista, sin stepper */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="rol">Rol</InputLabel>
                <Select
                  labelId="rol"
                  value={role}
                  label="Rol"
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <MenuItem value="customer">Busco contratistas</MenuItem>
                  <MenuItem value="contractor">Ofrezco servicios</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                required
                error={touched.name && nameErr}
                helperText={touched.name && nameErr ? "Ingresá tu nombre y apellido." : ""}
              />

              <TextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                required
                error={touched.email && emailErr}
                helperText={touched.email && emailErr ? "Revisá tu dirección de correo." : ""}
              />

              {/* Campos opcionales según rol */}
              {role === "customer" && (
                <FormControl fullWidth>
                  <InputLabel id="barrio">Barrio (opcional)</InputLabel>
                  <Select
                    labelId="barrio"
                    label="Barrio (opcional)"
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                  >
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    {BARRIOS_CABA.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
                  </Select>
                </FormControl>
              )}

              {role === "contractor" && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id="profession">Profesión (opcional)</InputLabel>
                    <Select
                      labelId="profession"
                      label="Profesión (opcional)"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    >
                      <MenuItem value=""><em>Ninguna</em></MenuItem>
                      {PROFESSIONS.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="barrio2">Barrio (opcional)</InputLabel>
                    <Select
                      labelId="barrio2"
                      label="Barrio (opcional)"
                      value={barrio}
                      onChange={(e) => setBarrio(e.target.value)}
                    >
                      <MenuItem value=""><em>Ninguno</em></MenuItem>
                      {BARRIOS_CABA.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
                    </Select>
                  </FormControl>
                </>
              )}

              <PasswordField
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                required
                error={touched.password && passErr}
                helperText={touched.password && passErr ? "Usá 8+ caracteres con mayúscula, minúscula, número y símbolo." : " "}
              />
              <PasswordStrengthBar password={password} />

              <PasswordField
                label="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                required
                error={touched.confirm && confirmErr}
                helperText={touched.confirm && confirmErr ? "Las contraseñas no coinciden." : ""}
              />

              {/* UX: botón principal claro; Enter también envía */}
              <Button
                type="submit"
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                disabled={loading}
              >
                {loading ? "Creando…" : "Crear cuenta"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}