import React from "react";
import {
  Paper, Stack, Typography, Button, Grid, FormControl, InputLabel, Select,
  MenuItem, Alert, Checkbox, FormControlLabel, Link
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { registerUser } from "../api/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { BARRIOS_CABA, PROFESSIONS } from "../constants";
import PasswordField from "../components/PasswordField";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { isValidEmail, checkPasswordCriteria } from "../utils/validators";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { saveProfile } from "../utils/profile";

const steps = ["Rol", "Datos", "Políticas"];

export default function Register() {
  const navigate = useNavigate();
  const [active, setActive] = React.useState(0);

  // UI original (customer/contractor + name completo)
  const [role, setRole] = React.useState<"customer" | "contractor">("customer");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [barrio, setBarrio] = React.useState("");
  const [profession, setProfession] = React.useState("");

  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const criteria = checkPasswordCriteria(password);
  const pwOk = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol;
  const emailOk = isValidEmail(email);
  const dataOk = name.trim().length >= 2 && emailOk && pwOk && password === confirm;

  function next() {
    if (active === 0) setActive(1);
    else if (active === 1) {
      if (!dataOk) { setError("Revisá los datos obligatorios."); return }
      setError(null); setActive(2);
    }
  }
  function back() { setActive(a => Math.max(0, a - 1)) }

  // Helpers para adaptar al backend
  function splitName(full: string) {
    const parts = full.trim().split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ") || firstName; // si no hay apellido, duplico
    return { firstName, lastName };
  }
  function mapRoleToApi(r: "customer" | "contractor") {
    return r === "customer" ? "CLIENTE" : "PROVEEDOR" as "CLIENTE" | "PROVEEDOR";
  }

 async function finish() {
  if (!(acceptTerms && acceptPrivacy)) { setError("Debés aceptar Términos y Privacidad."); return }
  setError(null); setLoading(true);
  try {
    const { firstName, lastName } = splitName(name);
    const apiRole = mapRoleToApi(role);

    // backend
    await registerUser({ email, password, firstName, lastName, role: apiRole });

    // perfil local (usa email como clave)
    saveProfile(email, { name, email, role, barrio, profession });

    setSuccess(true);
    setTimeout(() => navigate("/login"), 900);
  } catch (err: any) {
    setError(err?.response?.data?.message || "No se pudo registrar");
  } finally {
    setLoading(false);
  }
}

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={800} mb={2}>Crear cuenta</Typography>

          <Stepper activeStep={active} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>¡Registro exitoso! Redirigiendo al inicio de sesión…</Alert>}

          {active === 0 && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="rol">Rol</InputLabel>
                <Select labelId="rol" value={role} label="Rol" onChange={(e) => setRole(e.target.value as any)}>
                  <MenuItem value="customer">Busco contratistas</MenuItem>
                  <MenuItem value="contractor">Ofrezco servicios</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate("/login")}>Ya tengo cuenta</Button>
                <Button onClick={next}>Continuar</Button>
              </Stack>
            </Stack>
          )}

          {active === 1 && (
            <Stack spacing={2}>
              <TextField
                label="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={name.trim().length < 2}
                helperText={name.trim().length < 2 ? "Ingresá tu nombre" : ""}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!email && !emailOk}
                helperText={!!email && !emailOk ? "Email inválido" : ""}
              />

              {role === "customer" && (
                <FormControl fullWidth>
                  <InputLabel id="barrio">Barrio (opcional)</InputLabel>
                  <Select labelId="barrio" label="Barrio (opcional)" value={barrio} onChange={(e) => setBarrio(e.target.value)}>
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    {BARRIOS_CABA.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
                  </Select>
                </FormControl>
              )}

              {role === "contractor" && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id="profession">Profesión (opcional)</InputLabel>
                    <Select labelId="profession" label="Profesión (opcional)" value={profession} onChange={(e) => setProfession(e.target.value)}>
                      <MenuItem value=""><em>Ninguna</em></MenuItem>
                      {PROFESSIONS.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="barrio2">Barrio (opcional)</InputLabel>
                    <Select labelId="barrio2" label="Barrio (opcional)" value={barrio} onChange={(e) => setBarrio(e.target.value)}>
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
                required
                error={!!password && !pwOk}
                helperText="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo"
              />
              <PasswordStrengthBar password={password} />
              <PasswordField
                label="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                error={!!confirm && password !== confirm}
                helperText={!!confirm && password !== confirm ? "No coincide" : ""}
              />

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={back}>Atrás</Button>
                <Button onClick={next} disabled={!dataOk}>Continuar</Button>
              </Stack>
            </Stack>
          )}

          {active === 2 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />}
                label={<span>Acepto los <Link component={RouterLink} to="/terminos">Términos y Condiciones</Link></span>}
              />
              <FormControlLabel
                control={<Checkbox checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />}
                label={<span>Acepto la <Link component={RouterLink} to="/privacidad">Política de Privacidad</Link></span>}
              />
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={back}>Atrás</Button>
                <Button onClick={finish} disabled={loading || !(acceptTerms && acceptPrivacy)}>
                  {loading ? "Creando…" : "Crear cuenta"}
                </Button>
              </Stack>
              <Typography variant="body2">
                ¿Ya tenés cuenta? <RouterLink to="/login">Iniciá sesión</RouterLink>
              </Typography>
            </Stack>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}