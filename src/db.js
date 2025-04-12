import pg from "pg";
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  port: 3306,
  host: process.env.db_dns,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_data_pepqa,
});

pool.on("connect", () => {
  console.log("Database connected");
});
