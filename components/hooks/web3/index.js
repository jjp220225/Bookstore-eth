import { useHooks } from "@components/providers/web3";
import { useEffect } from "react";
import { useWeb3 } from "@components/providers"
import { useRouter } from "next/router"


//check if data is empty
const _isEmpty = data => {
    return (
      data == null ||
      data === "" ||
      (Array.isArray(data) && data.length === 0) ||
      (data.constructor === Object && Object.keys(data).length === 0)
    )
  }
  

const enhanceHook = (swrResponse) => {
    const { data, error } = swrResponse
    const hasInitialResponse = !!(data || error)
    const isEmpty = hasInitialResponse && _isEmpty(data)
    
    return{
        ...swrResponse,
        isEmpty,
        hasInitialResponse
        }
}

export const useNetwork = () => {
    const swrResponse = enhanceHook(useHooks(hooks => hooks.useNetwork)())
    return {
        network: swrResponse
    }
}

export const useAccount = () => {
    const swrResponse = enhanceHook(useHooks(hooks => hooks.useAccount)())
    return {
        account: swrResponse
    }
}

export const useAdmin = ({redirectTo}) => {
    const { account } = useAccount()
    const { requireInstall } = useWeb3()
    const router = useRouter()

    useEffect(() => {
        if ((
            requireInstall ||
            account.hasInitialResponse && !account.isAdmin) ||
            account.isEmpty) {
      
            router.push(redirectTo)
          }
        }, [account])

        return {account}
    }

export const useOwnedBooks = (...args) => {
    const swrResponse = enhanceHook(useHooks(hooks => hooks.useOwnedBooks)(...args))

    return {
        ownedBooks: swrResponse
    }
}

export const useOwnedBook = (...args) => {
    const swrResponse = enhanceHook(useHooks(hooks => hooks.useOwnedBook)(...args))

    return {
        ownedBook: swrResponse
    }
}

export const useManagedBooks = (...args) => {
    const swrResponse = enhanceHook(useHooks(hooks => hooks.useManagedBooks)(...args))
  
    return {
      managedBooks: swrResponse
    }
  }

export const useWalletInfo = () => {
    const { account } = useAccount()
    const { network } = useNetwork()

    const isConnecting = 
        !account.hasInitialResponse && !network.hasInitialResponse

    // if metamask or account isnt connected disable users from being able to purchase
    return{
        account,
        network,
        isConnecting,
        connectedWallet: !!(account.data && network.isSupported)
    }
    
   
}