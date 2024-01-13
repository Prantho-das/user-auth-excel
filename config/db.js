const mongoose = require('mongoose');

exports.connectMongoDb = async () => {
  // Connect MongoDB at default port 27017.
  try {
    await mongoose.connect(process.env.APP_MONGO_DB_URL);
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });
    mongoose.connection.on('error', (err) => {
      console.log('MongoDB connection failed', err);
    });
  }
  catch (err) {
    console.log('MongoDB connection failed', err);
  }

}
