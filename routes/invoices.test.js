process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let invoice;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
  VALUES ('apple', '200', 'false', '2021-02-15', null) RETURNING *`);
  invoice = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
  await db.end()
})

describe('GET /invoice', () => {
    test('Should get all invoices', async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body.invoices.length).toBe(1)
        expect(res.body.invoices[0].comp_code).toEqual(invoice.comp_code)
        
    })
})

describe('GET /invoice/id', () => {
    test('Should get invoice by id', async () => {
        const res = await request(app).get(`/invoices/${invoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.invoice.id).toEqual(invoice.id)
    })
    test('Responds with 404 if invalid id', async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe('POST /invoice/id', () => {
    test('Should create new invoice', async () => {
        const res = await request(app).post(`/invoices`).send({
            comp_code: 'ibm', amt: 200, paid: true, add_date: "2021-01-15"
        })
        expect(res.statusCode).toBe(201)
        expect(res.body.invoice.comp_code).toEqual('ibm')
    })
})

describe('PATCH /invoice/id', () =>{
    test('Should update invoice', async () =>{
        const res = await request(app).put(`/invoices/${invoice.id}`).send({
            comp_code: 'ibm', amt: 200, paid: true, add_date: "2021-01-15"
        })
        expect(res.statusCode).toBe(200)
        expect(res.body.invoice.id).toEqual(invoice.id)
    })
    test('Responds with 404 if invalid id', async () => {
        const res = await request(app).put(`/invoices/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe('DELETE /invoice/id', ()=>{
    test('Should delete invoice', async () => {
        const res = await request(app).delete(`/invoices/${invoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({msg: "DELETED"})
    })
    test('Responds with 404 if invalid id', async () => {
        const res = await request(app).delete(`/invoices/0`)
        expect(res.statusCode).toBe(404)
    })
})