import axios from 'axios'
import https from 'https'
import { parseStringPromise } from 'xml2js'

export default async function firstDataRequest(
  user,
  password,
  body,
  certPassword
) {
  const httpsAgent = new https.Agent({
    cert: require(`../certs/${user}/public-cert.pem`).default,
    key: require(`../certs/${user}/private-key.key`).default,
    passphrase: certPassword,
  })

  return new Promise((resolve, reject) => {
    console.log(new Date().toISOString(),'firstDataRequest 18',body); //PBB 20210721 added to help track down why we sometimes take incorrect amount
    axios
      .post(process.env.MANUAL_API, body, {
        headers: {
          'Content-Type': 'text/xml',
          Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
            'base64'
          )}`,
        },
        httpsAgent,
      })
      .then(async ({ data }) => {
        console.log(new Date().toISOString()+' 30 ',data)
        resolve(
          JSON.stringify(
            await parseStringPromise(data, { explicitArray: false })
          )
        )
      })
      .catch(async (err) => {
        try{
          console.log(new Date().toISOString()+' 37 ',err)
        }catch(err2){
          console.log(new Date().toISOString()+' 41 ',err2)
        }
        if (err?.response?.data) {
          try {
            const xml = err.response.data
            reject(
              JSON.stringify(
                await parseStringPromise(xml, { explicitArray: false })
              )
            )
          } catch (error) {
            reject(error)
          }
        } else {
          // eslint-disable-next-line no-console
          console.error(new Date().toISOString()+' 56 ',err)
          reject(err)
        }
      })
  })
}
