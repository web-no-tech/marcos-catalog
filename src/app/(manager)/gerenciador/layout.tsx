import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import Sidebar from './components/sidebar'
import { LuBox, LuLineChart, LuMenu, LuUser } from 'react-icons/lu'

export const metadata: Metadata = {
  title: {
    template: 'Gerenciador | %s',
    default: 'Gerenciador',
  },
}

export default function ManagerLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <>
      <Sidebar.Root>
        <Sidebar.List.Root className="flex-1">
          <Sidebar.List.Item
            icon={<LuBox />}
            label="Produtos"
            to="/gerenciador/produtos"
          />
          <Sidebar.List.Item
            icon={<LuUser />}
            label="Clientes"
            to="/gerenciador/clientes"
          />
          <Sidebar.List.Item
            icon={<LuLineChart />}
            label="Vendas"
            to="/gerenciador/vendas"
          />
        </Sidebar.List.Root>

        <Sidebar.Separator />

        <Sidebar.List.Root>
          <Sidebar.List.Item icon={<LuMenu />} label="Ver catálogo" to="/" />
        </Sidebar.List.Root>
      </Sidebar.Root>

      <main className="ml-72 flex min-h-screen w-[calc(100vw-18rem)] flex-col gap-6 p-4">
        {children}
      </main>
    </>
  )
}
