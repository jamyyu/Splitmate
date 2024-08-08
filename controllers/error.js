import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const get404Page = (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../', 'views', '404.html'));
};