import Link from "next/link";

export default function Hero() {
  return (
    <section className="lg:2/6 text-left my-28">
      <div className="text-6xl font-semibold text-gray-900 leading-none">
        Eth Bookstore
      </div>
      <div className="mt-6 text-xl font-light text-true-gray-500 antialiased">
        Get unlimited access to all of our online books each for $10.
      </div>
      <div className="mt-5 sm:mt-8 flex lg:justify-start">
        <div className="rounded-md shadow">
          <Link href="/marketplace/books/owned">
          <a
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
          >
            View your library
          </a>
          </Link>
        </div>
      </div>
    </section>
  )
}
