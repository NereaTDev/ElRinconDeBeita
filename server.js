require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad básica HTTP
app.use(helmet());

// Parseo de JSON (lo usaremos para el formulario de contacto)
app.use(express.json());

// Servir los archivos estáticos (la web)
app.use(express.static(path.join(__dirname)));

// Rate limiting para el endpoint de contacto
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,              // máx. 5 peticiones por minuto desde la misma IP
});

// Configuración del transporte de correo (SMTP)
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false') === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const contactTo = process.env.CONTACT_TO || smtpUser;

if (!smtpHost || !smtpUser || !smtpPass) {
  // No lanzamos error aquí para no romper el dev server, pero lo dejamos claro en logs
  console.warn('[contact] SMTP no configurado. Define SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
}

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

// Endpoint de contacto seguro
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'El servicio de correo no está configurado. Inténtalo más tarde.',
      });
    }

    const { Nombre, Email, Mensaje } = req.body || {};

    // Validación básica
    if (!Nombre || !Email || !Mensaje) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }

    const emailTrimmed = String(Email).trim();
    if (!emailTrimmed.includes('@') || emailTrimmed.length > 255) {
      return res.status(400).json({ success: false, message: 'Email no válido.' });
    }

    const subject = `Nuevo mensaje desde El Rincón de Beita`;

    const textBody = [
      `Nombre: ${Nombre}`,
      `Email: ${emailTrimmed}`,
      '',
      'Mensaje:',
      Mensaje,
    ].join('\n');

    const htmlBody = `
      <p><strong>Nombre:</strong> ${Nombre}</p>
      <p><strong>Email:</strong> ${emailTrimmed}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${(Mensaje || '').replace(/\n/g, '<br>')}</p>
    `;

    await transporter.sendMail({
      from: `El Rincón de Beita <${smtpUser}>`,
      to: contactTo,
      replyTo: emailTrimmed,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[contact] Error enviando correo:', err);
    return res.status(500).json({
      success: false,
      message: 'Ha ocurrido un error al enviar el mensaje.',
    });
  }
});

// Fallback: servir index.html para rutas desconocidas (SPA-like)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`El Rincón de Beita escuchando en http://localhost:${PORT}`);
});
