const axios = require('axios')

const refreshIGToken = async (token) => {
    const refresh_token = await axios.get(`${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&access_token=${token}`)

    return refresh_token

}

module.exports = refreshIGToken