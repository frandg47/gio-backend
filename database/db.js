const mongoose = require("mongoose");

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION, {
            dbName: "gioArquitecturaDB",
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conexión exitosa con BD")
    } catch (error) {
        console.log("error", error);
        process.exit(1);
    }
}

module.exports = dbConnection;