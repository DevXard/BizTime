const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM companies`)
        return res.json({companies: result.rows})
    }catch (err) {
        return next(err);
    }
    
})

router.get('/:code', async (req, res, next) => {
    try {
        const {code} = req.params
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code])

        if(result.rows.length === 0) {
            throw new ExpressError('Companie not found', 404)
        }

        let companie = result.rows[0]
        
        companie.invoices = invoices.rows.map(invoice => ({
            id:invoice.id,
            comp_code:invoice.comp_code,
            amt: invoice.amt,
            paid: invoice.paid,
            add_date: invoice.add_date,
            paid_date: invoice.paid_date,
        }))
        return res.json({companie: companie})
    }catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {code, name, description } = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description])

        return res.status(201).json({companie: result.rows[0]})
    }catch (err){
        return next(err)
    }
})

router.put('/:code', async (req, res, next) => {
    try{
        const id = req.params.code
        const {code, name, description } = req.body;
        const result = await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4 RETURNING *`, [code, name, description, id])
        if(result.rows.length === 0) {
            throw new ExpressError(`Companie with code ${id} not found`, 404)
        }
        return res.status(201).json({companie: result.rows[0]})
    }catch (err) {
        return next(err)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const check =await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        if(check.rows.length === 0) {
            throw new ExpressError(`Companie with code ${code} not found`, 404)
        }
        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code])
        return res.json({msg: "DELETED"})
    }catch (err) {
        return next(err)
    }
})

module.exports = router