import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chains/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/chains/new"!</div>
}
