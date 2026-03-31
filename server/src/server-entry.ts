import 'dotenv/config';
import { PORT } from './config/index';
import { app } from './main';

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
