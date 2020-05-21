import app from "@infra/curveball/app";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;
if (!process.env.PUBLIC_URI) {
  process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
  console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/');
}

app.start(port).catch((err: Error) => {
  console.log('Could not start server');
  console.error(err);
  process.exit(2);
})
