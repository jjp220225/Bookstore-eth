import { createBookHash } from "@utils/hash"
import useSWR from "swr"
import { normalizeOwnedBook } from "utils/normalize"


export const handler = (web3, contract) => (book, account) => {
    
    // auto refresh if account is changed
    const swrResponse = useSWR(() => 
    (web3 && contract && account) ? `web3/ownedBook/${account}` : null,
    async () => {
          
            const bookHash = createBookHash(web3)(book.id, account)

            const ownedBook = await contract.methods.getBookByHash(bookHash).call()
            if (ownedBook.owner === "0x0000000000000000000000000000000000000000") {
                return null
        }

        return normalizeOwnedBook(web3)(book, ownedBook)
    }
    
    )

    return swrResponse
}