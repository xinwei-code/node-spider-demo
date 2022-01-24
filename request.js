const axios = require('axios')

exports.request = (options) => {
  const instance = axios.create({
    baseURL: 'https://cnodejs.org/',
    timeout: 200000,
  })

  return instance(options)
}
