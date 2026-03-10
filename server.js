require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad básica HTTP (⚠️ desactivado temporalmente para no bloquear Tailwind CDN)
// app.use(helmet());

// Parseo de JSON (lo usaremos para el formulario de contacto)
app.use(express.json());

// Servir los archivos estáticos (la web)
app.use(express.static(path.join(__dirname)));

// Rate limiting para el endpoint de contacto
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,              // máx. 5 peticiones por minuto desde la misma IP
});

// Configuración de Brevo (API v3)
const brevoApiKey = process.env.BREVO_API_KEY;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL; // ej: no-reply@elrincondebeita.com
const brevoSenderName = process.env.BREVO_SENDER_NAME || 'El Rincón de Beita';
const contactTo = process.env.CONTACT_TO || process.env.BREVO_CONTACT_TO;

if (!brevoApiKey || !brevoSenderEmail || !contactTo) {
  console.warn('[contact] Brevo no está completamente configurado. Define BREVO_API_KEY, BREVO_SENDER_EMAIL y CONTACT_TO/BREVO_CONTACT_TO en .env');
}

// Endpoint de contacto seguro
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    if (!brevoApiKey || !brevoSenderEmail || !contactTo) {
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

    // 1) Enviar email transaccional vía Brevo
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: brevoSenderName, email: brevoSenderEmail },
        to: [{ email: contactTo, name: brevoSenderName }],
        replyTo: { email: emailTrimmed, name: Nombre },
        subject,
        htmlContent: htmlBody,
        textContent: textBody,
      }),
    });

    if (!emailResponse.ok) {
      const errBody = await emailResponse.text().catch(() => '');
      console.error('[contact] Error Brevo email:', emailResponse.status, errBody);
      return res.status(502).json({
        success: false,
        message: 'No se ha podido enviar el mensaje en este momento.',
      });
    }

    // 2) Crear/actualizar contacto en Brevo (Nombre + Email como "bbdd principal")
    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email: emailTrimmed,
        attributes: {
          FIRSTNAME: Nombre,
          // Si quieres guardar más campos, primero crea los atributos en Brevo y añádelos aquí.
          // MESSAGE: Mensaje,
        },
        updateEnabled: true,
      }),
    });

    if (!contactResponse.ok) {
      const errBody = await contactResponse.text().catch(() => '');
      // No rompemos la experiencia del usuario si falla el guardado del contacto,
      // pero lo dejamos logueado para poder revisarlo.
      console.error('[contact] Error Brevo contact:', contactResponse.status, errBody);
    }

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
