import React from "react";
import {
  Paper, Stack, Typography, Button, Grid, FormControl, InputLabel,
  Select, MenuItem, Alert, TextField
} from "@mui/material";
import { registerUser } from "../api/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { BARRIOS_CABA, PROFESSIONS } from "../constants";
import PasswordField from "../components/PasswordField";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { isValidEmail, checkPasswordCriteria } from "../utils/validators";
import { saveProfile } from "../utils/profile";

type UiRole = "customer" | "contractor"

export default function Register() {
  const navigate = useNavigate();

  // Campos
  const [role, setRole] = React.useState<UiRole>("customer");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName]   = React.useState("");
  const [email, setEmail]         = React.useState("");
  const [dni, setDni]             = React.useState("");
  const [phone, setPhone]         = React.useState("");
  const [address, setAddress]     = React.useState("");
  const [password, setPassword]   = React.useState("");
  const [confirm, setConfirm]     = React.useState("");

  // Campos específicos
  const [barrio, setBarrio]       = React.useState("");
  const [profession, setProfession] = React.useState("");

  // UX
  const [touched, setTouched] = React.useState({
    firstName: false, lastName: false, email: false, dni: false,
    phone: false, address: false, password: false, confirm: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Validaciones
  const criteria = checkPasswordCriteria(password);
  const pwOk    = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol;
  const emailOk = isValidEmail(email);

  const firstNameErr = !!touched.firstName && firstName.trim().length < 2;
  const lastNameErr  = !!touched.lastName  && lastName.trim().length  < 2;
  const emailErr     = !!touched.email     && !emailOk;
  const dniErr       = !!touched.dni       && !/^\d{7,10}$/.test(dni); // 7 a 10 dígitos
  const phoneErr     = !!touched.phone     && phone.replace(/\D/g,'').length < 6;
  const addressErr   = !!touched.address   && address.trim().length < 3;
  const passErr      = !!touched.password  && !pwOk;
  const confirmErr   = !!touched.confirm   && password !== confirm;

  const formOk =
    !firstNameErr && !lastNameErr && !emailErr && !dniErr && !phoneErr &&
    !addressErr && !passErr && !confirmErr &&
    firstName && lastName && email && dni && phone && address && password && confirm

  function mapRoleToApi(r: UiRole) {
    return (r === "customer" ? "CLIENTE" : "PRESTADOR") as "CLIENTE" | "PRESTADOR";
  }
  function parseError(err: any): string {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err?.message;
    if (status === 409 || /exist/i.test(msg) || /ya existe/i.test(msg)) return "Ya existe una cuenta con ese correo.";
    if (status === 400) return "Revisá los datos ingresados.";
    if (!err?.response) return "No se pudo conectar con el servidor. Probá de nuevo.";
    return msg || "No se pudo crear la cuenta.";
  }

  function handleDni(e: React.ChangeEvent<HTMLInputElement>) {
    setDni(e.target.value.replace(/\D/g,''));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setTouched({
      firstName: true, lastName: true, email: true, dni: true,
      phone: true, address: true, password: true, confirm: true,
    });
    if (!formOk) { setError("Revisá los campos marcados."); return; }

    setError(null);
    setLoading(true);
    try {
      const roleApi = mapRoleToApi(role);

      // Enviamos al backend solo los campos que soporta hoy
      await registerUser({
        email, password, firstName, lastName,dni,
        phoneNumber: phone, address, role: roleApi,
      });

      // Guardamos perfil local (incluye DNI)
      saveProfile(email, {
        name: `${firstName} ${lastName}`.trim(),
        lastName,
        email,
        role,
        dni,
        phone,
        address,
        barrio,
        profession,
      });

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
          <Typography variant="body2" sx={{ mb: 1 }}>
            ¿Ya tenés cuenta? <RouterLink to="/login">Iniciá sesión</RouterLink>
          </Typography>

          <Typography variant="h4" fontWeight={800} mb={2}>Crear cuenta</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>¡Listo! Te estamos llevando al inicio de sesión…</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="rol">Rol</InputLabel>
                <Select
                  labelId="rol"
                  value={role}
                  label="Rol"
                  onChange={(e) => setRole(e.target.value as UiRole)}
                >
                  <MenuItem value="customer">Busco contratistas</MenuItem>
                  <MenuItem value="contractor">Ofrezco servicios</MenuItem>
                </Select>
              </FormControl>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
                  error={firstNameErr}
                  helperText={firstNameErr ? "Ingresá tu nombre." : " "}
                  required
                  fullWidth
                />
                <TextField
                  label="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
                  error={lastNameErr}
                  helperText={lastNameErr ? "Ingresá tu apellido." : " "}
                  required
                  fullWidth
                />
              </Stack>

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                error={emailErr}
                helperText={emailErr ? "Ingresá un email válido." : " "}
                required
                fullWidth
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="DNI"
                  value={dni}
                  onChange={handleDni}
                  onBlur={() => setTouched(t => ({ ...t, dni: true }))}
                  error={dniErr}
                  helperText={dniErr ? "Solo números (7 a 10 dígitos)." : " "}
                  inputMode="numeric"
                  required
                  fullWidth
                />
                <TextField
                  label="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  error={phoneErr}
                  helperText={phoneErr ? "Ingresá un teléfono válido." : " "}
                  placeholder="+54 11 1234-5678"
                  required
                  fullWidth
                />
              </Stack>

              <TextField
                label="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, address: true }))}
                error={addressErr}
                helperText={addressErr ? "Ingresá tu dirección." : " "}
                placeholder="Calle 1234, Piso/Depto"
                required
                fullWidth
              />

              {/* Campos específicos por rol */}
              {/* {role === "customer" && (
                <FormControl fullWidth>
                  <InputLabel id="barrio">Barrio</InputLabel>
                  <Select
                    labelId="barrio"
                    value={barrio}
                    label="Barrio"
                    onChange={(e) => setBarrio(e.target.value)}
                  >
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    {BARRIOS_CABA.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {role === "contractor" && (
                <FormControl fullWidth>
                  <InputLabel id="prof">Profesión</InputLabel>
                  <Select
                    labelId="prof"
                    value={profession}
                    label="Profesión"
                    onChange={(e) => setProfession(e.target.value)}
                  >
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {PROFESSIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              )} */}

              <PasswordField
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                error={passErr}
                helperText={passErr ? "Usá 8+ caracteres con mayúscula, minúscula, número y símbolo." : " "}
                required
              />
              <PasswordStrengthBar password={password} />

              <PasswordField
                label="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                error={confirmErr}
                helperText={confirmErr ? "Las contraseñas no coinciden." : " "}
                required
              />

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
