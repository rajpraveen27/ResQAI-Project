const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // First connect to default 'postgres' database to create 'resqai_db'
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');

    // Create database
    try {
      await client.query('CREATE DATABASE resqai_db');
      console.log('Database resqai_db created.');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('Database resqai_db already exists.');
      } else {
        throw err;
      }
    }
    await client.end();

    // Now connect to 'resqai_db' to run schema
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'resqai_db'
    });

    await dbClient.connect();
    console.log('Connected to resqai_db. Running schema...');

    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon to run each command (basic parser)
    const commands = schema.split(';').filter(cmd => cmd.trim().length > 0);
    for (let cmd of commands) {
      await dbClient.query(cmd);
    }

    console.log('Schema applied successfully!');
    await dbClient.end();
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setupDatabase();
