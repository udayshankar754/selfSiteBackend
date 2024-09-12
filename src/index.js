import dotenv from 'dotenv';
dotenv.config({
    path : './.env'
});
import { connectDatabase } from './databases/db.js';
import  {app } from './app.js';

connectDatabase()
.then(
    () => {
        app.listen(process.env.PORT || 3000 , () => {
            console.log(`${process.env.DB_NAME} server listening on port ${process.env.PORT || 3000}`);
        });
    }
)
.catch(err => console.error("Mongo db Connection Failed",err));
