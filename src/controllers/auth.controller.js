import bcrypt from "bcrypt";
import { pool } from "../db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createAccessToken } from "../libs/jwt.js";
import fetch from 'node-fetch';
import {isValidEmail,isValidPassword,isValidDocType,
  isValidPhoneNumber,isValidBirthDate,isValidName,
  isValidGender,isValidTaxAmount,
  successResponse,errorResponse} from "./helpers.js"
import {forgotPasswordTemplate,successRegisterTemplate} from "./templates.js"
import { access } from "fs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let cobruToken = ''
export const signin = async (req, res) => {
  const { email, password } = req.body;

  const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = result[0]; 
  if (!user) {
    return res.status(400).json({
      message: "El correo no está registrado",
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({
      message: "Contraseña incorrecta",
    });
  }

  const token = await createAccessToken({ id: user.id });

  res.cookie("token", token, {
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 1 día
  });

  return successResponse(res,"Usuario logado correctamente",user,200);
}

export const signup = async (req, res, next) => {
  const {
    name,
    lastName,
    password,
    country,
    city,
    address,
    gender,
    birthDate,
    docType,
    docNumber,
    affiliation,
    email,
    phoneNumber,
    occupation,
    isIeeeMember,
    studentGroup,
    membershipNumber,
    participationType,
    attendanceType,
    taxAmount,
    qtyArticles,
    articles
  } = req.body;

  try {
  
    if (!isValidEmail(email))  return errorResponse(res,"Correo electrónico inválido.",400);
    if (!isValidPassword(password)) return errorResponse(res,"La contraseña debe contener un mínimo de 6 caracteres, una mayúscula y una minúscula.",400);
    if (!isValidPhoneNumber(phoneNumber)) return errorResponse(res,"Número de teléfono inválido",400);
    if (!isValidBirthDate(birthDate)) return errorResponse(res,"Fecha de nacimiento inválida",400)
    if (!isValidName(name) || !isValidName(lastName)) return errorResponse(res,"Nombre o Apellido inválido",400)
    if (!isValidGender(gender)) return errorResponse(res,"Género inválido",400);
    if (!isValidTaxAmount(taxAmount)) return errorResponse(res,"Impuesto inválido",400)

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        name, last_name, password, country, city, address,
        gender, birth_date, doc_type, doc_number, affiliation,
        email, phone_number, occupation, is_ieee_member,student_group,
        membership_number, participation_type, attendance_type,
        tax_amount, qty_articles,created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL -5 HOUR))
    `;

    const values = [
      name,
      lastName,
      hashedPassword,
      country,
      city,
      address,
      gender,
      birthDate,
      docType,
      docNumber,
      affiliation,
      email,
      phoneNumber,
      occupation,
      isIeeeMember,
      studentGroup,
      membershipNumber,
      participationType,
      attendanceType,
      taxAmount,
      qtyArticles
    ];

    const [result] = await pool.query(query, values);
    const userId = result.insertId;
    if (articles.length > 0) {
      const articlesValues = articles.map(article => `(${userId}, '${article.sequence}', ${article.pages})`).join(", ");
      const articlesQuery = `INSERT INTO articles (user_id, sequence, pages) VALUES ${articlesValues};`;
      await pool.query(articlesQuery);
    }
    
    sendRegisterEmail({
      name: name,
      lastName: lastName,
      country: country,
      occupation: occupation,
      participationType: participationType,
      email: email
    })
    
    const token = await createAccessToken({ id: userId });

    res.cookie("token", token, {
      //secure: true,
      //sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return successResponse(res,"Usuario registrado correctamente",[{"userId":userId}])
  } catch (error) {
    if (error.code == "ER_DUP_ENTRY") {
      return errorResponse(res,"El correo ya está registrado",400,error.message)
    }
    return errorResponse(res,"Error al registrar el usuario",400,error.message)
  
  }
};

const sendRegisterEmail = async (data,res) =>{
  const email = data.email
  
  const occupationMap = {
    student: "Estudiante",
    professional: "Profesional",
  };

  const participationMap = {
    author: "Autor",
    attendee: "Asistente",
    speaker: "Conferencista",
  };

  const emailData = {
    name: data.name,
    lastName: data.lastName,
    country: data.country,
    occupation: occupationMap[data.occupation?.toLowerCase()] || data.occupation,
    participationType: participationMap[data.participationType?.toLowerCase()] || data.participationType
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registro exitoso",
      html: successRegisterTemplate(emailData),
    };

    await transporter.sendMail(mailOptions);

  return { success: true, message: "Correo de registro enviado" };
} catch (error) {
  return { success: false, message: "Error al enviar el correo", error: error.message };
}

};

export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, name, last_name, country, city, address, gender, birth_date, 
             doc_type, doc_number, affiliation, email, phone_number, occupation, 
             is_ieee_member, student_group, membership_number, participation_type, 
             attendance_type, tax_amount, qty_articles, created_at,
             p.usd, p.cop, p.status,p.coupon
      FROM users u
      LEFT JOIN payments p ON p.user_id = u.id AND status <> 'Cancel'
      WHERE admin <> 1
    `;

    const [users] = await pool.query(query);

    return successResponse(res, 'Usuarios obtenidos correctamente', users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return errorResponse(res, 'Error al obtener los usuarios', 500, error.message);
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const email = req.query.email
  try {
    const query = `
        SELECT u.id, name, last_name AS lastName, country, city, address, gender,
              CAST(birth_date AS DATE) AS birthDate, doc_type AS docType, doc_number AS docNumber, 
              affiliation, email, phone_number AS phoneNumber, occupation, 
              is_ieee_member AS isIeeeMember, student_group AS studentGroup, membership_number AS membershipNumber,
                participation_type AS participationType, attendance_type AS attendanceType, 
                tax_amount AS taxAmount, qty_articles AS qtyArticles ,
              json_arrayagg(
                json_object(
                    'sequence',a.sequence,
                    'pages',a.pages
                )
              ) AS articles,
              admin,
              p.coupon
        FROM users u
        LEFT JOIN articles a ON a.user_id = u.id
        LEFT JOIN payments p ON p.user_id = u.id AND status <> 'Cancel'
        WHERE u.id = ? OR email = ?
        GROUP BY u.id;
    `;

    const [users] = await pool.query(query, [id, email]);
    if (users.length === 0) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }
    
    const formattedUsers = users.map(user => ({
      ...user,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null
    }));

    return successResponse(res, 'Usuario obtenido correctamente', formattedUsers[0]);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return errorResponse(res, 'Error al obtener el usuario', 500, error.message);
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    lastName,
    password,
    country,
    city,
    address,
    gender,
    birthDate,
    docType,
    docNumber,
    affiliation,
    email,
    phoneNumber,
    occupation,
    isIeeeMember,
    studentGroup,
    membershipNumber,
    participationType,
    attendanceType,
    taxAmount,
    qtyArticles,
    articles
  } = req.body;

  try {
    // Verifica si el usuario existe
    const [existingUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Hashear la contraseña si es que se envía una nueva
    let hashedPassword = existingUser[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE users 
      SET name = ?, last_name = ?, password = ?, country = ?, city = ?, address = ?, 
          gender = ?, birth_date = ?, doc_type = ?, doc_number = ?, affiliation = ?, 
          email = ?, phone_number = ?, occupation = ?, is_ieee_member = ?, student_group = ?, 
          membership_number = ?, participation_type = ?, attendance_type = ?, 
          tax_amount = ?, qty_articles = ?, updated_at = DATE_ADD(NOW(), INTERVAL -5 HOUR)
      WHERE id = ?;
    `;

    const values = [
      name || existingUser[0].name,
      lastName || existingUser[0].last_name,
      hashedPassword,
      country || existingUser[0].country,
      city || existingUser[0].city,
      address || existingUser[0].address,
      gender || existingUser[0].gender,
      birthDate || existingUser[0].birth_date,
      docType || existingUser[0].doc_type,
      docNumber || existingUser[0].doc_number,
      affiliation || existingUser[0].affiliation,
      email || existingUser[0].email,
      phoneNumber || existingUser[0].phone_number,
      occupation || existingUser[0].occupation,
      isIeeeMember ?? existingUser[0].is_ieee_member,
      studentGroup ?? existingUser[0].student_group,
      membershipNumber || existingUser[0].membership_number,
      participationType || existingUser[0].participation_type,
      attendanceType || existingUser[0].attendance_type,
      taxAmount || existingUser[0].tax_amount,
      qtyArticles || existingUser[0].qty_articles,
      id
    ];

    await pool.query(query, values);

    if (articles){
      if (!Array.isArray(articles) || articles.some(a => !a.sequence || !a.pages)) {
        return errorResponse(res,"El campo 'articles' debe ser un array de objetos con 'sequence' y 'pages'", 400)
      }

      if (articles.length != qtyArticles) {
        return errorResponse(res,"La cantidad de artículos no coincide con 'qtyArticles'",400)
      }
  
      // Obtener artículos actuales del usuario en la base de datos
      const [existingArticles] = await pool.query(
        "SELECT sequence, pages FROM articles WHERE user_id = ?",
        [id]
      );
  
      // Convertir a mapa para comparación rápida
      const existingMap = new Map(existingArticles.map(a => [a.sequence, a.pages]));
      const newMap = new Map(articles.map(a => [a.sequence, a.pages]));
  
      // Identificar artículos para actualizar, insertar y eliminar
      const updates = [];
      const inserts = [];
      const deletes = [];
  
      // Revisar si hay que actualizar o eliminar
      for (const [sequence, pages] of existingMap.entries()) {

        if (!newMap.has(sequence)) {
          deletes.push(sequence); // Si no está en el nuevo array, eliminarlo
        } else if (newMap.get((sequence)) != pages) {
          updates.push({ sequence: sequence, pages: newMap.get(sequence) }); // Si cambió, actualizarlo
        }
      }
  
      for (const [sequence, pages] of newMap.entries()) {
        if (!existingMap.has(sequence)) {
          inserts.push({id:id, sequence: sequence, pages: pages });
        }
      }
  
      if (updates.length > 0) {
        for (const { sequence, pages } of updates) {
          await pool.query(
            "UPDATE articles SET pages = ? WHERE user_id = ? AND sequence = ?",
            [pages, id, sequence]
          );
        }
      }
  
      if (deletes.length > 0) {
        await pool.query(
          "DELETE FROM articles WHERE user_id = ? AND sequence IN (?)",
          [id, deletes]
        );
      }
      
      if (inserts.length > 0) {
        await pool.query(
          "INSERT INTO articles (user_id, sequence, pages) VALUES ?",
          [inserts.map(({ id, sequence, pages }) => [id, sequence, pages])]
        );
      }

    }

    return successResponse(res, 'Usuario actualizado correctamente'),{userId: id};
    
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return errorResponse(res, 'Error al actualizar el usuario', 500, error.message);
  }
};

export const profile = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
  return res.json(result.rows[0]);
};

export const signout = (req, res) => {
  res.clearCookie('token');
  res.sendStatus(200);
};

export const payment = async (req,res) =>{
  const data = req.body
  let price = 0
  let copPrice = 0
  const requiredFields = [
        "participationType","isIeeeMember",
        "studentGroup","attendanceType","occupation",
        "qtyArticles","articles","userId"
  ]
  const missingFields = requiredFields.filter(field => !(field in req.body));
  if (missingFields.length > 0) {
    return errorResponse(res,`Faltan los siguientes campos: ${missingFields.join(', ')}`,400)
  }
  let isStudentGroup = false 
  if(data.studentGroup && data.studentGroup != "no"){
    isStudentGroup = true
  }
  const query = `
      SELECT *
      FROM payments
      WHERE status = 'Pagado' and user_id = ?
      ORDER BY id DESC
      LIMIT 1;
    `;

  const [payments] = await pool.query(query, [data.userId]);

  const prices = {
    author: {
      ieee: {
        event: 115,
        tutorials: 35,
        both: 130,
      },
      nonIeee: {
        event: 120,
        tutorials: 45,
        both: 140,
      },
    },
    attendee: {
      student: {
        ieee: {
          group: {
            event: 60,
            tutorials: 0,
            both: 60,
          },
          noGroup: {
            event: 60,
            tutorials: 25,
            both: 75,
          },
        },
        nonIeee: {
          event: 75,
          tutorials: 25,
          both: 85,
        },
      },
      professional: {
        ieee: {
          event: 165,
          tutorials: 45,
          both: 185,
        },
        nonIeee: {
          event: 205,
          tutorials: 50,
          both: 230,
        },
      },
    },
  };

  const copPrices = {
    author: {
      ieee: {
        event: 475000,
        tutorials: 150000,
        both: 550000,
      },
      nonIeee: {
        event: 500000,
        tutorials: 175000,
        both: 590000,
      },
    },
    attendee: {
      student: {
        ieee: {
          group: {
            event: 250000,
            tutorials: 0,
            both: 250000,
          },
          noGroup: {
            event: 250000,
            tutorials: 100000,
            both: 300000,
          },
        },
        nonIeee: {
          event: 300000,
          tutorials: 100000,
          both: 350000,
        },
      },
      professional: {
        ieee: {
          event: 690000,
          tutorials: 175000,
          both: 775000,
        },
        nonIeee: {
          event: 850000,
          tutorials: 200000,
          both: 950000,
        },
      },
    },
  };
  
  if (data.participationType === "author") {
    const memberType = data.isIeeeMember ? "ieee" : "nonIeee";
    price = prices.author[memberType][data.attendanceType] || 0;
    copPrice = copPrices.author[memberType][data.attendanceType] || 0;
  }
  
  if (data.participationType === "attendee") {
    if (data.occupation === "student") {
      if (data.isIeeeMember) {
        const groupType = isStudentGroup ? "group" : "noGroup";
        price = prices.attendee.student.ieee[groupType][data.attendanceType] || 0;
        copPrice = copPrices.attendee.student.ieee[groupType][data.attendanceType] || 0;
      } else {
        price = prices.attendee.student.nonIeee[data.attendanceType] || 0;
        copPrice = copPrices.attendee.student.nonIeee[data.attendanceType] || 0;
      }
    } else if (data.occupation === "professional") {
      const memberType = data.isIeeeMember ? "ieee" : "nonIeee";
      price = prices.attendee.professional[memberType][data.attendanceType] || 0;
      copPrice = copPrices.attendee.professional[memberType][data.attendanceType] || 0;
    }
  }

  if (data.taxAmount && data.taxAmount > 0) {
      price +=price*data.taxAmount/100
      copPrice +=copPrice*data.taxAmount/100
  }

  
  if (payments.length > 0) {
    const payment = payments[0];
    if (payment.usd !== price) {
      price -= payment.usd;
      copPrice -= payment.cop;
    }
  }

  if (data.coupon){
    
    const CouponsQuery = `
      SELECT *
      FROM coupons
      WHERE code = ?;
    `;
    const [coupons] = await pool.query(CouponsQuery, [data.coupon]);
    
    if (coupons.length > 0){
      const coupon = coupons[0];
      price -= price * coupon.percentage / 100
      copPrice -= copPrice * coupon.percentage / 100
    }
  }
  
  if (price < 0) {
    price = 0;
    copPrice = 0;
  }

  return successResponse(res,"Precio calculado exitosamente",{"price":price,"copPrice":copPrice})
};

const getRefreshToken = async (res) => {

  const responseToken = await fetch(`https://${process.env.cobru_url}/token/refresh/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": "process.env.x_api_key",
    },
    body: JSON.stringify({ refresh: process.env.refresh_token }),
  });

  if (!responseToken.ok) {
    return errorResponse(res,"Error al obtener el token de acceso",400,responseToken.statusText)
  }

  const { access } = await responseToken.json();
  cobruToken = access
};

export const processPayment = async (req, res) => {
  try {
  
    const requiredFields = ["amount","dollarRate","description","userId"]
    const missingFields = requiredFields.filter(field => !(field in req.body));
    const data = req.body
    if (missingFields.length > 0) {
      return errorResponse(res,`Faltan los siguientes campos: ${missingFields.join(', ')}`,400)
    } 
    
    let coupon = null;

    if (data.coupon) {
      const query = `
        SELECT 1
        FROM coupons
        WHERE code = ?
        LIMIT 1
      `;

      const [rows] = await pool.query(query, [data.coupon]);

      if (rows.length) {
        coupon = data.coupon;
      }
    }
    
    if (data.amount == 0){
      const updatePayment = " UPDATE payments SET status = 'Cancel' WHERE user_id = ? AND status = 'Creado'"
      await pool.query(updatePayment, [payment.id]);
      
      const PaymentZeroQuery = `
        SELECT *
        FROM payments
        WHERE status = 'Pagado' and usd = 0 and user_id = ?
        ORDER BY id DESC
        LIMIT 1
      `;
      
      const [paymentsZero] = await pool.query(PaymentZeroQuery, [data.userId]);
      if(paymentsZero.length == 0){
        
        const insertPaymentQuery =`
            INSERT INTO payments
            (user_id, usd, cop, status,coupon)
            VALUES
            (?,0,0,'Pagado',?)
          `;
        await pool.query(insertPaymentQuery, [data.userId,coupon]);
      }
      return successResponse(res,"Se registro la inscripción gratuita",{},200)
    }
    const query = `
      SELECT dollar_rate 
      FROM dollar_rate
      ORDER BY fecha_registro DESC
      LIMIT 1
    `;

    const [dollarRateDb] = await pool.query(query);
    const PaymentQuery = `
      SELECT *
      FROM payments
      WHERE status = 'Creado' and user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `;

    const [payments] = await pool.query(PaymentQuery[data.userId]);
    if (payments.length > 0){
      
        const payment = payments[0];
        if (parseFloat(payment.usd) !== parseFloat(data.amount,10)) {
          const updatePayment = " UPDATE payments SET status = 'Cancel' WHERE id = ?"
          await pool.query(updatePayment, [payment.id]);
        } else {
          return successResponse(res,"El cobro ya existe",
            {cobro: {},checkoutURL: `https://${process.env.cobru_url}/${payment.url}`},200)
        }
        
    }

      if (cobruToken || isTokenExpired(cobruToken) ){
        await getRefreshToken(res)
      }
      
    let copAmount = Math.ceil(data.amount * dollarRateDb[0].dollar_rate)
    if(data.copAmount){
      copAmount = data.copAmount
    }
    const newCobru = {
      amount: copAmount ,
      description: data.description || "Pago por servicio",
      expiration_days: 7,
      payment_method_enabled: JSON.stringify({
        credit_card: true,  
        pse: true,
      }),
      platform: "API",
    };

    const responseCobro = await fetch(`https://${process.env.cobru_url}/cobru/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cobruToken}`,
        "Content-Type": "application/json",
        "x-api-key": "process.env.x_api_key",
      },
      body: JSON.stringify(newCobru),
    });

    if (!responseCobro.ok) {
      return errorResponse(res,"Error al crear el cobro", 50, 0,responseCobro.statusText)
    }

    const cobroResponse = await responseCobro.json();
    
    const sql = `
      INSERT INTO payments (user_id, usd, cop, status, url,coupon) 
      VALUES (?, ?, ?,?,?,?)
    `;

    const values = [
        data.userId,
        data.amount,
        copAmount,
        'Creado',
        cobroResponse.url,
        coupon
      ];
    const [result] = await pool.query(sql, values);
    return successResponse(res,"Cobro creado exitosamente",
      {cobro: cobroResponse,checkoutURL: `https://${process.env.cobru_url}/${cobroResponse.url}`},200)
    
    
  } catch (error) {
    console.error("Error en el proceso de pago:", error);
    
    return errorResponse(res,"Error en el proceso de pago",400,error.message)
  }
};

export const checkPaymentStatus = async () => {
  try {
    // Consultar todos los pagos activos
    const [payments] = await pool.query("SELECT * FROM payments WHERE status IN ('Creado','En proceso')");

    if (payments.length === 0) {
      console.log("No hay pagos pendientes de revisión.");
      return;
    }

    if (isTokenExpired(cobruToken)) {
      await getRefreshToken();
    }
    const results = await Promise.all(
      payments.map(async (payment) => {
        if (!payment.url) {
          console.error(`Falta la URL para el pago con ID ${payment.id}`);
          return null;
        }

        try {
          const response = await fetch(`https://${process.env.cobru_url}/cobru_detail/${payment.url}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${cobruToken}`,
              "Content-Type": "application/json",
              "x-api-key": process.env.x_api_key,
            },
          });

          if (!response.ok) {
            console.error(`Error al consultar estado del pago ${payment.id}: ${response.statusText}`);
            return null;
          }

          const paymentStatus = await response.json();

          // Convertir el estado del pago a su correspondiente descripción
          const statusMap = {
            0: "Creado",
            1: "En proceso",
            2: "No pagado",
            3: "Pagado",
            4: "Reembolsado",
            5: "Expirado",
          };

          const newStatus = statusMap[paymentStatus.state] || "Estado desconocido";

          // Si el estado cambió, actualizar en la base de datos
          if (newStatus !== payment.status) {
            await pool.query("UPDATE payments SET status = ? WHERE id = ?", [newStatus, payment.id]);
            console.log(`Estado actualizado para el pago ${payment.id}: ${payment.status} -> ${newStatus}`);
          }

          return { id: payment.id, status: newStatus };
        } catch (err) {
          console.error(`Error al procesar pago ${payment.id}:`, err);
          return null;
        }
      })
    );

    console.log("Proceso de actualización de pagos finalizado.");
    return results.filter((r) => r !== null);
  } catch (error) {
    console.error("Error general en la verificación de pagos:", error);
  }
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true; 
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return true;
  }
};

export const forgotPassword = async (req,res)=> {
  const { email } = req.body;

  try {
    // Buscar si el usuario existe
    const query = "SELECT id FROM users WHERE email = ?";
    const [rows] = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const userId = rows[0].id;

    const newPassword = crypto.randomBytes(8).toString("hex").slice(0, 8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
    await pool.query(updateQuery, [hashedPassword, userId]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      html: forgotPasswordTemplate(newPassword),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Correo de recuperación enviado" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al restablecer la contraseña", error: error.message });
  }
};

export const changePassword = async(req,res) => {
  const data = req.body
  const requiredFields = ["oldPassword","newPassword","userId"]
  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    return errorResponse(res,`Faltan los siguientes campos: ${missingFields.join(', ')}`,400)
  }

  const [result] = await pool.query("SELECT password FROM users WHERE id = ?", [data.userId]);
  const user = result[0]; 

  const validPassword = await bcrypt.compare(data.oldPassword, user.password);
  if (!validPassword) {
    return errorResponse(res,"Contraseña Incorrecta",400)
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  const query = " UPDATE users SET password = ? WHERE id = ?"
  await pool.query(query, [hashedPassword ,data.userId]);

  return successResponse(res,"Contraseña actualizada correctamente",{"userId":data.userId},200)

}

export const getCountries = async (req, res) => {

  try {

    const query = `
      SELECT *
      FROM countries
    `;

    const [countries] = await pool.query(query);

    return successResponse(res, 'Paises listados correctamente', countries);
  } catch (error) {
    console.error('Error al listar los paises:', error);
    return errorResponse(res, 'Error al listar los paises', 500, error.message);
  }

};
