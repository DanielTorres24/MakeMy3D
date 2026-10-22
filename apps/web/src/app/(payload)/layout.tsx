import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import './custom.scss'
export default function Layout({ children }: { children: React.ReactNode }) {
  return RootLayout({ children, config, importMap })
}
