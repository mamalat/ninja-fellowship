// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ninjasAPI = 'https://api.1337co.de/v3/employees'
const apiKey = '<API KEY>'


class ResponseError extends Error {
  constructor(message, response, options) {
    super(message, options)
    this.response = response
  }
}

const customFetch = async function(...args) {
  const res = await fetch(...args)

  if (!res.ok) {
    throw new ResponseError('Bad response', res)
  }

  return res
}

export default async function handler(req, res) {
  try {
    const apiRes = await customFetch(ninjasAPI, {
      headers: {
        'Authorization': apiKey
      }
    })
  
    const employees = await apiRes.json()
    res.json(employees)
  } catch (err) {
    res.status(400).send()
  }
}
