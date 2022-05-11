import useSWR from "swr"


// url to get prices of coins - ethereum 
const URL = "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false"

export const BOOK_PRICE = 10

// get our data in dollars if not return null
const fetcher = async (url) => {
    const res = await fetch(url)
    const json = await res.json()
    return json.market_data.current_price.usd ?? null
}

export const useEthPrice = () => {
    const {data, ...rest} = useSWR(
        URL,
        fetcher,
        { refreshInterval: 2500} //rexecute every 2.5 seconds to update ethereum price
    )

    const perItem = (data && (BOOK_PRICE / Number(data)).toFixed(8)) ?? null

    return { eth: {data, perItem, ...rest}}
}