const nodemailer = require('nodemailer');

const sendFormContact = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_RECEIVER,
      subject: `Nuevo mensaje de ${name}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ mensaje: 'Formulario enviado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: 'Error al enviar el formulario.',
      status: 500,
    });
  }
};

module.exports = { sendFormContact };
