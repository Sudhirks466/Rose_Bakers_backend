app.use(cors({
   origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, origin);
   },
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   optionsSuccessStatus: 200,
}));

app.options('*', cors({
   origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, origin);
   },
   credentials: true,
   optionsSuccessStatus: 200,
}));