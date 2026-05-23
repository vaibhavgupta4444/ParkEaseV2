import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let connectionPromise;

const ensureDBConnection = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }
  return connectionPromise;
};

export default async function handler(req, res) {
  await ensureDBConnection();
  return app(req, res);
}
