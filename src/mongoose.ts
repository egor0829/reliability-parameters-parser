// Импортировать модуль mongoose
import mongoose from 'mongoose';

// Установим подключение по умолчанию
const mongoDB = 'mongodb://127.0.0.1/reliability-parameters';

async function mongooseConnect() {
    await mongoose.connect(mongoDB);
    console.log('Mongo connected successfully to server');

    // Позволим Mongoose использовать глобальную библиотеку промисов
    mongoose.Promise = global.Promise;

    // Получение подключения по умолчанию
    const db = mongoose.connection;

    // Привязать подключение к событию ошибки  (получать сообщения об ошибках подключения)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

export default mongooseConnect;
