const bcrypt = require('bcryptjs')
const User = require('../models/User')



comparePass = async function (password, password2) {
    const comparison = await bcrypt.compare(password, password2)
    return comparison
}

module.exports = comparePass