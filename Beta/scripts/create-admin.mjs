// Crea la primera cuenta de administrador de EntrenaMos.
// Se corre UNA sola vez, a mano, desde tu computadora (no hay signup público de admin).
//
// Uso:
//   node scripts/create-admin.mjs "Nombre Apellido" admin@tuemail.com unaContraseñaSegura
//
// Lee las credenciales de Supabase desde Beta/.env.local (NEXT_PUBLIC_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY). Correlo parado en la carpeta Beta/.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("No encontré .env.local en esta carpeta. Corré este script parado en Beta/.");
    process.exit(1);
  }
  const content = readFileSync(path, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    // Saca comillas si las hay y espacios colgantes.
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function dumpError(err) {
  const plain = {};
  for (const key of Object.getOwnPropertyNames(err)) {
    plain[key] = err[key];
  }
  return plain;
}

const [, , fullName, email, password] = process.argv;

if (!fullName || !email || !password) {
  console.error('Uso: node scripts/create-admin.mjs "Nombre Apellido" email@ejemplo.com contraseña');
  process.exit(1);
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Config leída de .env.local:");
console.log("  URL:", url || "(vacío)");
console.log("  SERVICE_ROLE_KEY:", serviceRoleKey ? `${serviceRoleKey.slice(0, 12)}... (${serviceRoleKey.length} caracteres)` : "(vacío)");
console.log("");

if (!url || !serviceRoleKey || serviceRoleKey === "falta-completar") {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  process.exit(1);
}

if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
  console.error(`La URL no parece una URL de Supabase válida: "${url}"`);
  process.exit(1);
}

if (!serviceRoleKey.startsWith("sb_secret_") && !serviceRoleKey.startsWith("eyJ")) {
  console.error(
    `La SERVICE_ROLE_KEY no tiene el formato esperado (debería empezar con "sb_secret_" o, en proyectos viejos, "eyJ"). Valor actual: "${serviceRoleKey.slice(0, 15)}..."`
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

try {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", full_name: fullName },
  });

  if (error) {
    console.error("Error creando el admin (respuesta de Supabase):");
    console.error(JSON.stringify(dumpError(error), null, 2));
    process.exit(1);
  }

  console.log(`Admin creado: ${data.user.email} (id: ${data.user.id})`);
  console.log("Ya podés loguearte en /login con ese email y contraseña.");
} catch (err) {
  console.error("Excepción al llamar a Supabase (probablemente red/conexión):");
  console.error(JSON.stringify(dumpError(err), null, 2));
  console.error("");
  console.error("Mensaje:", err?.message ?? err);
  process.exit(1);
}
