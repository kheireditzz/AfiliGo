import express from 'express';
import app from './server.js';

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log('AFILIGO_RUNNING_ON_PORT_' + PORT);
});
