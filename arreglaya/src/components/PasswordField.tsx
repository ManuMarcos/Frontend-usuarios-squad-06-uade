import React from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { IconButton, InputAdornment } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'onChange'> { onChange?: ChangeHandler }
export default function PasswordField(props: PasswordFieldProps) { const [show, setShow] = React.useState(false); return (<TextField {...props} type={show ? 'text' : 'password'} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShow(s => !s)} edge="end" aria-label="mostrar/ocultar contraseña">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />) }
