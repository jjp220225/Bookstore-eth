
import { Card, List } from '@components/ui/book'
import { BaseLayout } from '@components/ui/layout'
import { getAllBooks } from '@content/books/fetcher'
import { useWalletInfo, useOwnedBooks } from '@components/hooks/web3'
import { Button, Loader, Message } from '@components/ui/common'
import { OrderModal } from '@components/ui/order'
import { useState } from 'react'
import { MarketHeader } from '@components/ui/marketplace'
import { useWeb3 } from '@components/providers'
import { withToast } from '@utils/toast'

export default function Marketplace({ books }) {
  const { web3, contract, requireInstall } = useWeb3()
  const [selectedBook, setSelectedBook] = useState(null)
  const { connectedWallet, isConnecting, account } = useWalletInfo()
  const { ownedBooks } = useOwnedBooks(books, account.data)
  const [bookProgressId, setbookProgressId] = useState(null)

  const [isNewOrder, setNewOrder] = useState(true)

  const purchaseBook = async (order, book) => {
    const hexBookId = web3.utils.utf8ToHex(book.id)

    // hex book ID:
    // 0x31343130343734000000000000000000 = 16 bytes value of hex book ID

    // address
    // 0xFf789D6e893D469411ca24483645553004e32a43

    // Hex book ID + Address
    // 31343130343734000000000000000000Ff789D6e893D469411ca24483645553004e32a43
    // Keccak256 of the above
    // = Order Hash :
    //6f9a6d978b51a8eab219a89c6b01dd206c2177eda97c19e16034f0f72c63618e

    //jjp31@sussex.ac.uk - hashed
    //ffee65106d464471c2fbad5bf1bce04fc9367605d1ed5bd5604580db84cd5498

    //Sha3 = keccak256
    const orderHash = web3.utils.soliditySha3(
      { type: 'bytes16', value: hexBookId },
      { type: 'address', value: account.data },
    )

    const value = web3.utils.toWei(String(order.price))

    // emailHash + bookHash
    //ffee65106d464471c2fbad5bf1bce04fc9367605d1ed5bd5604580db84cd54986f9a6d978b51a8eab219a89c6b01dd206c2177eda97c19e16034f0f72c63618e
    // above keccak256 =
    //proof:
    // 4f8e49e716d8718f7b98534d5da456a747c289e34bb3c92e7f03f73f3451ef2b
    
    setbookProgressId(book.id)
    
    if (isNewOrder) {
      const emailHash = web3.utils.sha3(order.email)
      const proof = web3.utils.soliditySha3(
        { type: 'bytes32', value: emailHash },
        { type: 'bytes32', value: orderHash },
      )

      withToast(_purchaseBook(hexBookId, proof, value))
    } else {
      withToast(_repurchaseBook(orderHash, value))
    }
  }

  const clearModal = () => {
    setSelectedBook(null)
    setNewOrder(true)
  }

  const _purchaseBook = async (hexBookId, proof, value) => {
    try {
      const result = await contract.methods
        .purchaseBook(hexBookId, proof)
        .send({ from: account.data, value })
        ownedBooks.mutate()
        return result
    }  catch(error) {
    throw new Error(error.message)
    } finally {
      setbookProgressId(null)
    }
  }
  const _repurchaseBook = async (bookHash, value) => {
    try {
      const result = await contract.methods
        .repurchaseBook(bookHash)
        .send({ from: account.data, value })
        ownedBooks.mutate()
        return result
    } catch(error) {
      throw new Error(error.message)
    } finally {
      setbookProgressId(null)
    }
  }

  return (
    <>
      <MarketHeader />
      <List books={books}>
        {(book) => (
          <Card
            key={book.id}
            book={book}
            disabled={!connectedWallet}
            Footer={() => {
              if (requireInstall) {
                return (
                  <Button size="sm" disabled={true} variant="lightBlue">
                    Install
                  </Button>
                )
              }

              if (isConnecting) {
                return (
                  <Button size="sm" disabled={true} variant="lightBlue">
                    <Loader />
                  </Button>
                )
              }
              //change button from purchased to owned

              if (!ownedBooks.hasInitialResponse) {
                 return (
                  // <div style={{ height: '50px' }}></div>
                  <Button variant="lightBlue" disabled={true}>
                    Loading...
                  </Button>
                )
              }
              const owned = ownedBooks.lookup[book.id]

              const inProgress = bookProgressId === book.id
              if (owned) {
                return (
                  <>
                    <div className="flex">
                      <Button disabled={true} size="sm" variant="green">
                        Owned &#9989;
                      </Button>
                      {owned.state === 'deactivated' && (
                        <Button
                          disabled={inProgress}
                          size="sm"
                          onClick={() => {
                            setNewOrder(false)
                            setSelectedBook(book)
                          }}
                          variant="purple"
                        > 
                        { inProgress ?
                          <div className="flex">
                          <Loader size="sm" />
                          <div className="ml-2">In Progress</div>
                          </div> :
                          <div> Repurchase </div>
                        }
                        </Button>
                      )}
                    </div>

                    {owned.state === 'activated' && (
                      <Message>Activated</Message>
                    )}
                    {owned.state === 'deactivated' && (
                      <Message type="danger">Deactivated</Message>
                    )}
                    {owned.state === 'purchased' && (
                      <Message type="happy">Waiting for Activation</Message>
                    )}
                  </>
                )
              }

              return (
                <Button
                  onClick={() => setSelectedBook(book)}
                  disabled={!connectedWallet || inProgress}
                  variant="lightBlue"
                >
                  { inProgress ?
                    <div className="flex">
                    <Loader size="sm" />
                    <div className="ml-2">In Progress</div>
                    </div> :
                    <div>Purchase</div>
                  }
                </Button>
              )
            }}
          />
        )}
      </List>
      {selectedBook && (
        <OrderModal
          book={selectedBook}
          isNewOrder={isNewOrder}
          onSubmit={(formData, book) => {
            purchaseBook(formData, book)
            clearModal()
          }}
          onClose={clearModal}
        />
      )}
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllBooks()
  return {
    props: {
      books: data,
    },
  }
}

Marketplace.Layout = BaseLayout
