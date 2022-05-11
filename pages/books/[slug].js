import { useAccount, useOwnedBook } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { Message, Modal } from '@components/ui/common'
import { Curriculum, Hero, KeyPoints } from '@components/ui/book'
import { BaseLayout } from '@components/ui/layout'
import { getAllBooks } from '@content/books/fetcher'

export default function Book({ book }) {
  const {isLoading} = useWeb3()
  const { account } = useAccount()
  const { ownedBook } = useOwnedBook(book, account.data)
  const orderState = ownedBook.data?.state


  const isLocked = 
    !orderState ||
    orderState === "purchased" || 
    orderState === "deactivated"

  return (
    <>
      <div className="py-4">
        <Hero
          hasOwner={!!ownedBook.data}
          title={book.title}
          decription={book.decription}
          image={book.coverImage}
        />
      </div>
      <KeyPoints points={book.mainPoints} />

      {orderState && (
        <div className="max-w-5xl mx-auto">
          {orderState === "purchased" && (
            <Message type="success">
              Thank you for your purchase! Please await activation. This process may
              take up to 24 hours.
              <i className="block font-normal">
                In case of any queries, please refer to our contact page.
              </i>
            </Message>
          )}
          {orderState === 'activated' && (
            <Message type="happy">
               Thank you for your order! We wish you enjoy your item.
            </Message>
          )}
          {orderState === 'deactivated' && (
            <Message type="danger">
              Order has been deactivated, due the incorrect purchase information. The
              functionality to use the item has been temporaly disabled.
              <i className="block font-normal">
                Please contact us if this problem persists.
              </i>
            </Message>
          )}
        </div>
      )}
      <Curriculum 
        isLoading={isLoading}
        locked={isLocked}
        orderState={orderState}
      
      />
      <Modal />
    </>
  )
}

export function getStaticPaths() {
  const { data } = getAllBooks()

  return {
    paths: data.map((c) => ({
      params: {
        slug: c.slug,
      },
    })),
    fallback: false,
  }
}

export function getStaticProps({ params }) {
  const { data } = getAllBooks()
  const book = data.filter((c) => c.slug === params.slug)[0]
  return {
    props: {
      book,
    },
  }
}

Book.Layout = BaseLayout
