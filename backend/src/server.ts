import Fastify from 'fastify';

const app = Fastify();

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.listen({ port: 5000, host: '0.0.0.0' }, err => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('🚀 Backend running on http://localhost:5000');
});
