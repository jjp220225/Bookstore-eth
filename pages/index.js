import { Hero } from '@components/ui/common'
import { List, Card } from '@components/ui/book'
import { BaseLayout } from '@components/ui/layout'
import { getAllBooks } from '@content/books/fetcher'


export default function Home({ books }) {
 
  return (
    <>
      <Hero />

      <List books={books}>
        {
          book => 
          <Card key={book.id} book={book}/>
        }
      </List>
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllBooks()
  return {
    props: {
      books: data
    }
  }
}

Home.Layout = BaseLayout