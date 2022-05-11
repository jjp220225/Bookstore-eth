import { Button } from '@components/ui/common'
import { BaseLayout, YoutubeEmbed } from '@components/ui/layout'

export default function Guide({}) {
  return (
    <div>
      <h2 className="text-3xl font-normal text-center mt-8 mb-8">
        METAMASK GUIDE
      </h2>
      <YoutubeEmbed embedId="YVgfHZMFFFQ" />

      <h2 className="text-3xl font-normal text-center mt-8 mb-8">
        HOW TO PURCHASE GUIDE
      </h2>
      <YoutubeEmbed embedId="rokGy0huYEA" />
    </div>
    
  )
}

Guide.Layout = BaseLayout
