import expres from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/ApiError.js';


const app = expres();

app.use(cors({
    origin: process.env.CORS_0RIGIN,
    credentials: true,
}))

app.use(expres.json({limit : '50kb'}))
app.use(expres.urlencoded({extended : true , limit : '50kb'}))
app.use(expres.static("public"))
app.use(morgan('dev'))
app.use(cookieParser())

// //routes 

import userRouter from './routes/user.routes.js'
import projectRouter from './routes/projects.routes.js'


// //routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/projects", projectRouter)


// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            data: null,
            success: err.success
        });
    } else {
        console.error(err); // Log unexpected errors
        return res.status(500).json({
            statusCode: 500,
            message: 'An unexpected error occurred',
            errors: [],
            data: null,
            success: false
        });
    }
});

export {app}