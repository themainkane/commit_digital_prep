import axios from "axios";
import https from "https";
// import fs from "fs";
import { parseStringPromise } from "xml2js";

export default async function firstDataRequest(
  user: string,
  password: string,
  body: string,
  certPassword: string,
  timeout = 30000
): Promise<string | undefined> {
  const httpsAgent = new https.Agent({
    cert: require(`../certs/${user}/public-cert.pem`).default,
    key: require(`../certs/${user}/private-key.key`).default,
    passphrase: certPassword,
  });
  //create a cancellation token, which is triggered on the timeout
  const source = axios.CancelToken.source();

  try {
    console.log(
      new Date().toISOString(),
      `firstDataRequest Sending API reqest`
    );
    const response = await axios.post(process.env.MANUAL_API, body, {
      headers: {
        "Content-Type": "text/xml",
        Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
          "base64"
        )}`,
      },
      httpsAgent,
      timeout,
      cancelToken: source.token,
    });
    //convert the xml data to a js object and log it
    const parsedData = await parseStringPromise(response.data, {
      explicitArray: false,
    });
    console.log(
      new Date().toISOString(),
      "API SUCCESS: 37 firstDataRequest Parsed Response Data",
      parsedData
    );
    return JSON.stringify(parsedData);
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(
        new Date().toISOString(),
        `CANCELLED; timeout triggered cancelation token sent. Throwing error:`
      );
      throw error;
    }
    if (axios.isAxiosError(error)) {
      console.log(
        new Date().toISOString(),
        `58  axios error in firstDataRequest. Throwing error:`,
        error.message
      );
      throw error;
    } else {
      console.error(
        new Date().toISOString(),
        `67 unexpected error in firstDataRequest. Throwing error:`,
        error
      );
      throw error;
    }
  }
}
