import app from "@infra/curveball/app";

app.start().catch((err: Error) => {
  console.log('Could not start server');
  console.error(err);
  process.exit(2);
})
