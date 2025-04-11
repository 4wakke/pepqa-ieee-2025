

export const forgotPasswordTemplate = (password) => {
    const template =  `<!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperación de Contraseña - TEMSCON</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 650px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #0b702e;
                            padding: 20px;
                            text-align: center;
                        }
                        .content img {
                            max-width: 200px;
                            text-align: center;
                            display: block;
                            margin: 0 auto;
                        }
                        .title {
                            color: #ffffff;
                            font-size: 24px;
                            margin-top: 10px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 30px;
                            text-align: left;
                            color: #333;
                        }
                        .highlight-password {
                            background-color: #35bd3a;
                            color: #ffffff;
                            padding: 10px 20px;
                            font-size: 18px;
                            font-weight: bold;
                            border-radius: 6px;
                            width: 200px;
                            text-align: center;
                            margin: 20px auto;
                        }
                        .footer {
                            background-color: #0b702e;
                            color: #ffffff;
                            text-align: center;
                            padding: 15px;
                            font-size: 14px;
                        }
                        p {
                            margin-bottom: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            
                            <div class="title">Recuperación de Contraseña</div>
                        </div>
                        <div class="content">
                            <img src="https://i.imgur.com/DN3hp4X.png" alt="Logo Pepqa" >
                            <p>Hemos recibido una solicitud para restablecer tu contraseña. A continuación, te proporcionamos una nueva contraseña temporal:</p>

                            <div class="highlight-password">${password}</div>

                            <p>Por razones de seguridad, te recomendamos cambiar esta contraseña inmediatamente después de iniciar sesión.</p>

                            <p>Si no solicitaste este cambio, puedes ignorar este mensaje sin realizar ninguna acción.</p>
                        </div>
                        <div class="footer">
                            © 2025 PEPQA. Todos los derechos reservados.<br>
                            Si necesitas ayuda, contáctanos a través de nuestro sitio web oficial.
                        </div>
                    </div>
                </body>
                </html>
        `
    return template
 };

 export const successRegisterTemplate = (data) => {
    const template =  `<!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmación de Registro - TEMSCON</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 650px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #0b702e; /* Azul oscuro */
                            padding: 20px;
                            text-align: center;
                        }
                        .content img {
                            max-width: 200px;
                            text-align: center;
                            display: block;
                            margin: 0 auto;
                        }
                        .title {
                            color: #ffffff;
                            font-size: 28px;
                            margin-top: 5px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 30px;
                            text-align: left;
                            color: #333;
                        }
                        .highlight {
                            color: #063608; /* Rojo vibrante */
                            font-weight: bold;
                        }
                        .info-table {
                            margin-top: 20px;
                            width: 100%;
                            border-collapse: collapse;
                        }
                        .info-table td {
                            padding: 10px;
                            border-bottom: 1px solid #eee;
                        }
                        .footer {
                            background-color: #0b702e;
                            color: #ffffff;
                            text-align: center;
                            padding: 15px;
                            font-size: 14px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #35bd3a;
                            color: #ffffff;
                            padding: 10px 20px;
                            margin-top: 20px;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="title">¡Registro Exitoso!</div>
                        </div>
                        <div class="content">
                            <img src="https://i.imgur.com/DN3hp4X.png" alt="Logo Pepqa" >
                            <p>Hola <span class="highlight">${data.name}} ${data.lastName}</span>,</p>

                            <p>Nos complace confirmarte que tu registro a la conferencia <strong>PEPQA</strong> ha sido completado con éxito.</p>

                            <p>A continuación te compartimos los detalles de tu inscripción:</p>

                            <table class="info-table">
                                <tr>
                                    <td><strong>Nombre:</strong></td>
                                    <td>${data.name} ${data.lastName}</td>
                                </tr>
                                <tr>
                                    <td><strong>País:</strong></td>
                                    <td>${data.country}</td>
                                </tr>
                                <tr>
                                    <td><strong>Ocupación:</strong></td>
                                    <td>${data.occupation}</td>
                                </tr>
                                <tr>
                                    <td><strong>Tipo de participación:</strong></td>
                                    <td>${data.participationType}</td>
                                </tr>
                            </table>

                            <a href="https://pepqa.ieeecolcaribeconference.com/" class="btn">Pagina de registro</a>

                            <p>Gracias por ser parte de esta experiencia. ¡Nos vemos en PEPQA!</p>
                        </div>
                        <div class="footer">
                            © 2025 PEPQA. Todos los derechos reservados.<br>
                            Síguenos en nuestras redes sociales para más novedades.
                        </div>
                    </div>
                </body>
                </html>
        `
    return template
 };