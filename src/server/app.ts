import express from 'express';
import cors from 'cors';
import companyRouter from 'src/server/routes/company';
import equipmentRouter from 'src/server/routes/equipment';
import mongooseConnect from 'src/mongoose';

const app = express();

app.use(
    // cors({
    //     origin: 'http://localhost:3000/',
    //     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    // })
    cors()
);
app.use(express.json());

app.use('/api/v1/company', companyRouter);
app.use('/api/v1/equipment', equipmentRouter);
// app.use('/t', require('./routes/redirect.routes'));

// if (process.env.NODE_ENV === 'production') {
//     app.use('/', express.static(path.join(__dirname, 'client', 'build')));

//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
// }

const PORT = 5000;

async function start() {
    try {
        await mongooseConnect();
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
    } catch (err) {
        // @ts-ignore
        console.log('Server Error', err.message);
        process.exit(1);
    }
}

start();
