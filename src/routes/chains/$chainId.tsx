import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chains/$chainId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{Route.useParams().chainId}</div>;
}
