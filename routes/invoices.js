const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db')
const dateTime = require('node-datetime');


router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM invoices`)


        return res.json({ invoices: result.rows})
    }catch (err) {
        return next(err);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if(result.rows.length === 0){
            throw new ExpressError(`Invoice with id of ${id} was not found`, 404);
        }
        return res.json({ invoice: result.rows[0]});
    }catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt, paid, add_date, paid_date} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *`, [comp_code, amt, paid, add_date, paid_date])

        return res.status(201).json({invoice: result.rows[0]})
    }catch (err){
        return next(err);
    }
})

router.put('/:id', async (req, res, next) =>{
    try {
        const {id} = req.params;
        const dt = dateTime.create();
        const formatted = dt.format('Y-m-d H:M:S');
        let { comp_code, amt, paid, add_date, paid_date} = req.body;
        if(paid === false){
            paid_date = null
        }else if (paid === true){
            paid_date = formatted
        }
        const result = await db.query(`UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5
        WHERE id=$6 RETURNING *`, [comp_code, amt, paid, add_date, paid_date, id]);
        if(result.rows.length === 0){
            throw new ExpressError(`Canot find invoice with id of ${id}`, 404)
        }

        return res.json({invoice: result.rows[0]})
    } catch (err) {
        return next(err);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const check = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if(check.rows.length === 0){
            throw new ExpressError(`Canot find and delete invoice with id of ${id}`, 404)
        }
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id])

        return res.json({msg: "DELETED"})
    }catch (err) {
        return next(err);
    }
})

module.exports = router