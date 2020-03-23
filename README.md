# URL Shortener Backend
Express + SQLite + GraphQL

## Environment variables

Rename <b>.env.example</b> to <b>.env</b> (Optional). By default, the app will use default values<br />

| Variable         | Description          | Default Value    |
| ---------------- | ---------------------| -----------------|
| `APP_URL`        | APP_URL/urlCode      | hostname         |
| `SECRET_KEY`     | JWT secret key       |                  |
| `NODE_ENV`       | App environment      | development      |
| `PORT`           | App port number      | 3000             |
| `DATABASE_NAME`  | SQLite DB name       | url-shortener.db |

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app with nodemon<br />
API endpoints will be available at [http://localhost:3000](http://localhost:3000)

### `npm start`

Runs the app without nodemon.<br />
API endpoints will be available at [http://localhost:3000](http://localhost:3000)

## Available Endpoints

For full list of route, refer to the project's routes folder
Below are some of the implemented API endpoints:

| Route                    | Method | Parameter            | Return                | Descriptions     |
| ------------------------ | ------ | ---------------------| --------------------- | -----------------|
| `api/auth/register`      | POST   | email, password      | User info, JWT token  |                  |
| `api/auth/login`         | POST   | email, password      | JWT token             |                  |
| `/api/users/create`      | POST   | email, password      | User info             |                  |
| `/api/users/create`      | POST   | id                   | User info             |                  |
| `api/shortens/`          | GET    |                      | List of shortened URL |                  |
| `api/shortens/protected` | GET    |                      | List of shortened URL | Test JWT purpose |
| `api/shortens/url`       | POST   | originalUrl          | The shortened URL     |                  |