import mongoose from 'mongoose'
import dotenv from "dotenv";
dotenv.config();
const connectDataBase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL,{
            useUnifiedTopology: true,
            useNewUrlParser: true,


        }) ;
        console.log("Mongo connected !");


    } catch (error) {
        console.log("**********************************")
        console.log(`Erreur: ${error.message} `);
        process.exit(1);


    }
}

export default connectDataBase;
