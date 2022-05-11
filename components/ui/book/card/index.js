import Image from "next/image"
import Link from "next/link"

export default function Card({ book, disabled, Footer }) {
  return (
        <div
          className="bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl"
        >
          <div className="flex h-full">
            <div className="flex-1 h-full next-image-wrapper">
              <Image
                className={`object-cover ${disabled && "filter grayscale"}`}
                src={book.coverImage}
                layout="fixed"
                width="200"
                height="230"
                alt={book.title}
              />
            </div>
            <div className="p-8 pb-4 flex-2">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {book.type}
              </div>
              <Link href={`/books/${book.slug}`}>
                <a
                  className="h-12 block mt-1 text-sm sm:text-base leading-tight font-medium text-black hover:underline">
                  {book.title}
                </a>
              </Link>
                {book.title}
            
              <p className="mt-2 mb-4 text-sm sm:text-base text-gray-500">{book.description.substring(0,70)}...</p>
              {
                Footer &&
                <div className="mt-2">
                <Footer />
                </div>
              }
            </div>
          </div>
        </div>
  )
}
