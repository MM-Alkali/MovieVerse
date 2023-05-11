import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import db from './config/database.config'; 
import pages from './routes/pages';
import users from './routes/users';
import movies from './routes/movies'
import password from './routes/password';

const app = express();

db().then(() => {
}).catch((err) => {
  console.log('Error connecting to database:', err.message);
});

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', pages);
app.use('/users', users);
app.use('/movies', movies);
app.use('/password', password);

app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

app.use(function(err: createError.HttpError, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;
