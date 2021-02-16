const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT i.industry, ct.companie_code FROM industry as i LEFT JOIN companie_industry AS ct ON i.code = ct.industry_code`)

        return res.json(result.rows)
    }catch (err) {
        return next(err);
    }
})
router.post('/', async (req, res, next) => {
    try {
        const {code, industry} = req.body
        const result = await db.query(`
        INSERT INTO industry (code, industry)
            VALUES ($1, $2)
        RETURNING * `,[code, industry])

        return res.json(result.rows)
    }catch (err) {
        next(err);
    }
})

router.get('/', async (req, res, next) => {
    try {
        const {industry_code, companie_code} = req.body;
        const result = await db.query(`INSERT INTO companie_industry (industry_code, companie_code)
            VALUES ($1, $2)
            RETURNING *
        `, [industry_code, companie_code])

        return res.json(result.rows)
    }catch (err) {
        return next(err)
    }
})
module.exports = router