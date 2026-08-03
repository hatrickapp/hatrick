import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { SelectableOption } from '@/components/shared/selectable_option'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'
import bitcoinQr from '@/assets/bitcoin.png'
import ethereumQr from '@/assets/ethereum.png'
import polygonQr from '@/assets/polygon.png'
import solanaQr from '@/assets/solana.png'

const networks = [
  {
    key: 'bitcoin',
    name: 'Bitcoin',
    qr: bitcoinQr,
    address: 'bc1qjzdys2679pu9q646634dx7ukc6ppm8gueqy9hh',
  },
  {
    key: 'solana',
    name: 'Solana',
    qr: solanaQr,
    address: 'CKgZsgPqGv9WkUkSaBjBPQfrMsoBMUrxDYBcGH1jQUd7',
  },
  {
    key: 'ethereum',
    name: 'Ethereum',
    qr: ethereumQr,
    address: '0xE61C9992DAe9C834d50514206b8E7C3Aab60E52c',
  },
  {
    key: 'polygon',
    name: 'Polygon',
    qr: polygonQr,
    address: '0xE61C9992DAe9C834d50514206b8E7C3Aab60E52c',
  },
]

export function SupportUsPage() {
  const [selectedNetworkKey, setSelectedNetworkKey] = useState(networks[0].key)
  const selectedNetwork = networks.find((network) => network.key === selectedNetworkKey) ?? networks[0]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="dotted-background min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <article className="space-y-10">
          <header className="space-y-5 border-b border-border/40 pb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Support us</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                Help Hatrick grow with the football community <Heart className="inline h-5 w-5 text-primary" />
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                Hatrick is being built to make every matchweek feel more competitive, social, and meaningful. Support helps us keep improving the product, covering football data, building cleaner features, and giving football fans in Jordan and beyond a sharper place to compete.
              </p>
            </div>
          </header>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Support with crypto</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                Pick the network you prefer, scan the QR code, or use the wallet address below it. Please always confirm the selected network before sending.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-y border-border/40 py-4">
              {networks.map((network) => (
                <SelectableOption
                  key={network.key}
                  active={selectedNetwork.key === network.key}
                  title={network.name}
                  onClick={() => setSelectedNetworkKey(network.key)}
                  className="min-h-10 w-auto border-border px-4 py-2"
                />
              ))}
            </div>

            <div className="border-b border-border/40 pb-8">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">{selectedNetwork.name}</p>
              <img
                src={selectedNetwork.qr}
                alt={`${selectedNetwork.name} wallet QR code`}
                className="mt-5 h-56 w-56 object-contain sm:h-64 sm:w-64"
              />
              <p className="mt-5 max-w-2xl break-all text-sm leading-7 text-muted-foreground">
                {selectedNetwork.address}
              </p>
            </div>
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  )
}
