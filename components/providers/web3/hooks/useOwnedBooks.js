import useSWR from "swr"
import { createBookHash } from "utils/hash"
import { normalizeOwnedBook } from "utils/normalize"


export const handler = (web3, contract) => (books, account) => {
    
    // auto refresh if account is changed
    const swrResponse = useSWR(() => 
    (web3 && contract && account) ? `web3/ownedBooks/${account}` : null,
    async () => {
        const ownedBooks = []

        // dont expect owner to buy all books and not in order

        for (let i = 0; i < books.length; i++){
            const book = books[i]
            
            if (!book.id) { continue }

            const bookHash = createBookHash(web3)(book.id, account)

            const ownedBook = await contract.methods.getBookByHash(bookHash).call()
            if (ownedBook.owner !== "0x0000000000000000000000000000000000000000") {
                const normalized = normalizeOwnedBook(web3)(book, ownedBook)
                ownedBooks.push(normalized)
            }
        }

        return ownedBooks
    }
    
    )

    return {
        ...swrResponse,
        lookup: swrResponse.data?.reduce((a, c) => {
          a[c.id] = c
          return a
        }, {}) ?? {}
      }
}