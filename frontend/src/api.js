import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

const client = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

async function get(path, config) {
  const res = await client.get(path, config)
  return res.data
}

async function post(path, body, config) {
  const res = await client.post(path, body, config)
  return res.data
}

async function put(path, body, config) {
  const res = await client.put(path, body, config)
  return res.data
}

export default {
  client,
  get,
  post,
  put,
}
