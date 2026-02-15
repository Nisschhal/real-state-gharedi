## Clerk Setup

    - Sign up and create a project in [Clerk](https://clerk.com/)
    - Follow the given instruction to setup clerk in your project
    - Setup `proxy.ts` a Gatekeeper for you app in root and apply the route middleware: public, private, onboarding routes, for reference checkout the `proxy.ts` file

## Sanity Setup

    - Sign up and create a project in [Sanity]
    - Follow the given instruction in `Getting Started` Tab

### Creating Documents

### Seeding Documents

    - install `dotenv and @sanity/client`
    - Go to your sanity dashboard `localhost:3000/studio` and on top-left of you profile dropdown click **manage project**
    - Go to API tab
    - Create two tokens: one **read** **editor** access
    - past to .env.local as *SANITY_API_TOKEN* for edito/write access AND *SANITY_API_READ_TOKEN* for read/viewer access
    - if you haven't then add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
        - you will *project id* above tabs
        - for data set go to *datasets* tab
    - go to `script` folder and copy everything in your root
    - and after creating document/schemas and setting up all the envs and data hit: `pnpm dlx tsx script/seed/seed.ts`
    - for npm user: `npx tsx script/seed/seed.ts`

## Shadcn Setup

    - install [Shadcn](https://ui.shadcn.com/docs/installation/next)
    - `pnpm dlx shadcn@latest init`
    - install all components: `pnpm dlx shadcn@latest add --all`, rather then picking one by one

## Map

    - pnpm add maplibre-gl react-map-gl
    - reference to `components/map` for MapView and Property Marker

## Pricing

    - enable Billing in clerk
    - create new plan
    - disable free plan: toggle off publicly avaiable
