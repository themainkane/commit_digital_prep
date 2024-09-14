import axios from "axios";
import https from "https";
import { parseStringPromise } from "xml2js";

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
  });

  try {
    console.log(new Date().toISOString(), "firstDataRequest 18", body);
    //PBB 20210721 added to help track down why we sometimes take incorrect amount

    const response = await axios.post(process.env.MANUAL_API, body, {
      headers: {
        "Content-Type": "text/xml",
        Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString(
          "base64"
        )}`,
      },
      httpsAgent,
    });
    //convert the xml data to a js object and log it
    try {
      const parsedData = await parseStringPromise(response.data, {
        explicitArray: false,
      });
      console.log(
        new Date().toISOString(),
        "37 firstDataRequest Parsed Response Data",
        parsedData
      );

      return JSON.stringify(parsedData);
    } catch (error) {
      console.log(
        new Date().toISOString(),
        "44 Error parsing first data response"
      );
      throw new Error(error);
    }
    //end of xml conversion
  } catch (error) {
    //verbose logging to understand why firstDataRequest sometimes never returns.
    console.log(
      `${new Date().toISOString()} 49 firstDataRequest Error Status: 
      ${error.response?.status}`
    );
    console.log(
      `${new Date().toISOString()} 53 firstDataRequest Error Headers: 
      ${error.response?.headers}`
    );

    //log & throw the error
    if (error?.response?.data) {
      try {
        const parsedError = await parseStringPromise(error.response.data, {
          explicitArray: false,
        });
        console.log(
          new Date().toISOString(),
          "70 firstDataRequest Parsed Error",
          parsedError
        );
      } catch (parsingError) {
        console.log(
          `${new Date().toISOString()} Error parsing the error response. Check the format, ${parsingError}`
        );
        throw new Error(parsingError);
      }
    } else {
      console.log(
        new Date().toISOString(),
        "80 Error in firstDataRequest: ",
        error
      );
      throw error;
    }
  }
}
