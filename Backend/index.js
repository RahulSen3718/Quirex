import express from 'express';
import { dbConnect } from './config/db.js';
import router from './route/userRoute.js';
import adminRoute from './route/adminRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(cors());

// Serve uploaded images
app.use('/img', express.static(path.join(__dirname, 'uploads')));

const PORT = 9000;
dbConnect();

app.use('/api', router);
app.use('/api', adminRoute);

app.listen(PORT, () => {
  console.log('Server running...');
});