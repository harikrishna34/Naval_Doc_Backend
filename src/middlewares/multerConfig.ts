import multer from 'multer';

const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

export default upload;