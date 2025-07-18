const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  let token;
  
  beforeAll(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'testpass' });
    
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpass' });
    token = res.body.token;
  });

  test('POST /api/clients creates a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Client',
        email: 'test@example.com',
        birthdate: '1990-01-01'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('GET /api/clients lists clients', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('clientes');
  });

  test('PUT /api/clients/:id updates client', async () => {
    const createRes = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Client',
        email: 'test2@example.com',
        birthdate: '1990-01-01'
      });
    
    const res = await request(app)
      .put(`/api/clients/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Client',
        email: 'test2@example.com',
        birthdate: '1990-01-01'
      });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/clients/:id deletes client', async () => {
    const createRes = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Client',
        email: 'test3@example.com',
        birthdate: '1990-01-01'
      });
    
    const res = await request(app)
      .delete(`/api/clients/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});