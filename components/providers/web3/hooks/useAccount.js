import { useEffect } from "react"
import useSWR from "swr"

//hash admin account using keccak256 for additional security.
const adminAddresses = {"0x2bf6b67b140c9f8f60442f9fa82cfac975c4cea7554d7b5c3fd8ce1459776107": true}

export const handler = (web3, provider) => () => {
    const {data, mutate, ...rest} = useSWR(() => 
        web3 ? "web3/accounts" : null,
        async () => {
            const accounts = await web3.eth.getAccounts()
            const account = accounts[0]

            if (!account) {
              throw new Error("Cannot retreive an account. Please refresh the browser.")
            }
      
            return account
        }
    )


    useEffect(() => {
        // one time event
        const mutator = accounts => mutate(accounts[0] ?? null)
        provider?.on("accountsChanged", mutator)

        return () => {
            provider?.removeListener("accountsChanged", mutator)
          }
        }, [provider])

    return {
            data,
            isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
            mutate,
            ...rest

    }
}