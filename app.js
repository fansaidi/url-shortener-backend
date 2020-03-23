var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressGraphql = require('express-graphql');
var indexRouter = require('./routes/index');
var authRouter =  require('./routes/auth');
var usersRouter = require('./routes/users');
var shortensRouter = require('./routes/shortens');

var app = express();

// Cnable cors
app.use(cors());

// GraphiQL test setup
const schema = require('./schema/shortenedURLs');

app.use('/graphql', expressGraphql({
  schema: schema,
  graphiql: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/shortens', shortensRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
