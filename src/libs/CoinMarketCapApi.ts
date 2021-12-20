import axios from "axios";

export default function CoinMarketCapApi(apiKey: string) {
  return {
    client: axios.create({
      baseURL: `https://pro-api.coinmarketcap.com`,
      headers: {
        ["X-CMC_PRO_API_KEY"]: apiKey,
      },
    }),

    // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyMap
    async idMap() {
      return await this.request("get", `/v1/cryptocurrency/map`);
    },

    // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyQuotesLatest
    async tokenPrice(symbol: string | string[]) {
      symbol = symbol instanceof Array ? symbol.join(",") : symbol;
      return await this.request("get", "/v1/cryptocurrency/quotes/latest", {
        symbol: symbol.toLowerCase(),
      });
    },

    async request(
      verb: "get" | "post" | "delete",
      url: string,
      params?: any,
      body?: any
    ) {
      try {
        const { data } = await this.client[verb](url, { params, body });
        return data;
      } catch (err: any) {
        if (err.response) {
          throw new Error(
            `${err.response.status} - ${err.response.statusText}`
          );
        }
        throw err;
      }
    },
  };
}
