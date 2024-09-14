import axios from "axios";
import https from "https";
// import fs from "fs";
import { parseStringPromise } from "xml2js";

interface FirstDataRequestOptions {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export default async function firstDataRequest(
  user: string,
  password: string,
  body: string,
  certPassword: string,
  options: FirstDataRequestOptions = {
    maxRetries: 5,
    retryDelay: 1000,
    timeout: 5000,
  }
): Promise<string | undefined> {
  const { maxRetries, retryDelay, timeout } = options;
  const httpsAgent = new https.Agent({
    cert: require(`../certs/${user}/public-cert.pem`).default,
    key: require(`../certs/${user}/private-key.key`).default,
    passphrase: certPassword,
  });
  //redesigned firstDataRequest uses a for loop to automatically retry.
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        new Date().toISOString(),
        `firstDataRequest ATTEMPT NUMBER: ${attempt}`,
        `REQUEST BODY: `,
        body
      );
      //PBB 20210721 added to help track down why we sometimes take incorrect amount
      const response = await axios.post(process.env.MANUAL_API, body, {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
            "base64"
          )}`,
        },
        httpsAgent,
        timeout,
      });
      //convert the xml data to a js object and log it
      const parsedData = await parseStringPromise(response.data, {
        explicitArray: false,
      });
      console.log(
        new Date().toISOString(),
        "SUCCESS: 37 firstDataRequest Parsed Response Data",
        parsedData
      );
      return JSON.stringify(parsedData); //return and exit loop if successful
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          new Date().toISOString(),
          `58 Error in firstDataRequest attempt: ${attempt}`,
          error.message
        );
        // Do something with this error...
      } else {
        console.error(
          new Date().toISOString(),
          `67 Error in firstDataRequest(), ATTEMPT: ${attempt} ERROR:`,
          error
        );
      }
      //check the attempt, throw error or retry
      if (attempt === maxRetries) {
        console.log(
          `${new Date().toISOString()} ERROR Maximum firstDataRequest retries reached. Throwing error. Logging above`
        );
        throw error;
      }
      //increase delay with each failure
      const backOffTimer = retryDelay * Math.pow(2, attempt - 1);
      console.log(
        `${new Date().toISOString()} Retrying firstDataRequest in ${backOffTimer}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, backOffTimer));
      //if all attempts fail, return maxRetries
    }
  }
  return "";
}
