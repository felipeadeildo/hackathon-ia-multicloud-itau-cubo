import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("deploy/:id", "routes/deploy-detail.tsx")
] satisfies RouteConfig;
