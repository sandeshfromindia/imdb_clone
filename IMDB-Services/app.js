const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(cors())
const authRoute = require('./routes/auth');
const authEmployeeRoute = require('./routes/authEmployee');
const userRoute = require('./routes/user');
const employeeRoute = require('./routes/employee');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => console.log("DB connected"));

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

//routes middleware
app.use(authRoute);
app.use(authEmployeeRoute);
app.use(userRoute);
app.use(employeeRoute);
app.use('/', express.static(path.join(__dirname, '../IMDB-UI/build')));
app.use('/admin', express.static(path.join(__dirname, '../IMDB-ADMIN-UI/dist')));
app.use('*', (req, res) => {
    res.status(404).json({
        error: "Route Not Found"
    })
});
const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
