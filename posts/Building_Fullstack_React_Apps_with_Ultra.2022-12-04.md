<!-- deno-fmt-ignore-file -->
#### 2022-12-04

##### _11 min read_

# Building Fullstack React Apps with Ultra

[**Ultra**](https://ultrajs.dev) is a full stack framework for building Deno webapps
using [React](https://reactjs.org). **Ultra** recently released version 2.0 that is more customizable than v1.

**Ultra** works by streaming React-generated HTML markup from the server. Version 2 of the app is designed to run under React 18+ which supports React Suspense. Suspense allows asynchronous loading of components that need to do some time-intensive work on the server -- such as data fetching -- before they are rendered. The `React.Suspense` component provides a `fallback` prop to display a loading indicator component before the suspended child component is rendered.

This article will demonstrate how to use **Ultra** to create and deploy a React app. Source code can be found [in this Github repo](https://github.com/cdoremus/ultra2-demo) and the application is [deployed on Deno Deploy here](https://ultra2-demo.deno.dev).

## Creating an Ultra App

The best way to create a **Ultra** project is to use the create CLI script
(`create.ts`). You run it by invoking:

```ts
deno run -A -r https://deno.land/x/ultra/create.ts
```

The script will then ask for the project name and whether you want to use TypeScript or JavaScript. The project name will become the folder name where the project exists under the folder where you ran the script, so it's best not to have any spaces in the project name.

The script will then request what libraries you would like to use with your **Ultra** app. The options are for:

- Styling: Tailwind (twind), Stitches or no CSS library. Static CSS is still an option as the script will create a `style.css` file.
- Routing: React Router, Wouter or no routing are the options.
- HTML head management: To use React Helmet or nothing. If nothing is chosen, HTML is added to the return value of the `App` component inside `app.tsx` with HEAD and BODY elements.
- Data access: React Query or no data access library.

Other React libraries still can be used in a an **Ultra** app, These libraries and other options are demonstrated in the [`examples` folder of the **Ultra** repo](https://github.com/exhibitionist-digital/ultra/tree/main/examples).

### Key app files and folders

The key files and folders in an **Ultra** app include code to compile and run the app, and setup code for many libraries so it is important to know what is going on with them.

They include:
- `importMap.json`: The HTML-standard [import map](https://html.spec.whatwg.org/multipage/webappapis.html#import-maps) that allows an alias to be used in place of a JavaScript/TypeScript url in an ECMAScript import statement.

- `deno.json`: The [Deno config file](https://deno.land/manual@v1.28.3/getting_started/configuration_file) used for various things including command line scripts (like the scripts section of `package.json`) under the `"tasks"` property. Invoke a task using the ```deno task <task name>``` command. Make sure you reference the path to the app's import map as the value of the `"importMap"` property. Also, with the `"lint"` and `"fmt"` properties you'll want to exclude the `.ultra` folder.

- `server.ts`: This is the app's entry point as it is invoked on the Deno command line when the `"dev"` and `"start"` tasks are run. It works with the [`Hono`](https://honojs.dev) server library. React Router and other libraries need to have setup code put in this file. This can be tricky which is why I suggest using the `create.ts` app to add libraries.

- `client.ts`: This is the client's entry point that hydrates the app when it is rendered in the browser. The `ClientApp` function returns the home page with components and should be wrapped in context providers needed for the app to function.

- `build.ts`: Used to build the app and dependencies into a `.ultra` folder. Add any files you do not want to be deployed to the `builder.ignore` call in that file. Also put code into this file for any additional build compilation or transformations. For instance, an MDX compile step is done in the `with-mdx` example. Also note build options detailed in the `lib/build/types.ts` file in the **Ultra** repo.

- `src/app.tsx`: The React app's entry point. The `create.ts` script will generate an `App` component in this file that returns example content wrapped in an HTML tag that includes HEAD and BODY elements.

- `public folder`: This app holds the app's assets including images, CSS files and other static content.

- `.ultra folder`: Holds the result of an **Ultra** build that will get deployed to production.

## Demo app

I created a TypeScript app that used Tailwind, React Router and React Query. I employed the create script to scaffold out the app which adds context providers for React Router and React Query to `server.ts` and/or `client.ts`.

My app uses the [jsonplaceholder API](https://jsonplaceholder.typicode.com/) with React Query to display fake users and blog posts. You can see it in action [here](https://ultra2-demo.deno.dev). To run the app locally invoke ```deno task dev``` from the command line. Find the app's code in [this repo](https://github.com/cdoremus/ultra2-demo).

### React Router

The [`React Router`](https://reactrouter.com/en/main) (v6) context provider was setup in both `server.ts` and `client.ts`. Note that the `StaticRouter` is used for server-side rendering while the client file uses `BrowserRouter`.

The routes for both server and client are configured in `app.tsx`. Here's what that looks like:
```ts
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="user_details/:userId" element={<UserDetailsPage />} />
      <Route path="*" element={<RouteNotFound />} />
    </Route>
  </Routes>
```
Each of the routes point to a page component that wraps the page's content. The `Layout` component defines a Layout Route which forms a shell around other components containing the app's header and footer. Routes defined inside the Layout Route hold the content (`HomePage`, `AboutPage`, `UserDetailsPage` and `RouteNotFound` page in this case).

The `Layout` component uses an `Outlet` component to defined where the child components go as the `children` prop did previously. This is what that component's return value looks like (styling removed):
```ts
  <>
    <header>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <div>
        <h1>Ultra Demo App</h1>
      </div>
    </header>
    <main>
      <Outlet/> {/* Child components here */}
    </main>
    <footer>
      <div>
        <a href="https://ultrajs.dev">
          Built with Ultra
        </a>💎
      </div>
    </footer>
  </>
```
See the [React Router docs](https://reactrouter.com/en/main) for more details on version 6 of the library.


### React Query

[`ReactQuery`](https://tanstack.com/query/v4/docs/adapters/react-query) is a data management API used in the app to make API calls for user data. It provides intelligent caching, prefetching and pagination features among others. Version 4 also supports React suspense for asynchronous data fetching.

React Query setup in **Ultra** is somewhat complicated, so it is advised that you bring it in when running the `create.ts` project-creation script. You'll noticed that a `src/react-query` folder has been created. The `query-client.ts` file inside that folder initializes a `QueryClient` class containing a `suspense: true` option for React suspense support.

The `useDehydrateReactQuery.tsx` file in the `react-query` folder uses the helper hook `useServerInsertedHTML` included in the **Ultra** distribution. The `useDehydrateReactQuery` function serializes the query client's fetched data on the server side storing it in a `window` property called `__REACT_QUERY_DEHYDRATED_STATE`. This is all done when `server.tsx` is invoked at app startup.

Query data rehydration is done in `client.tsx` using the `Hydrate` component from React Query.

```ts
// client.ts
import { Hydrate } from "@tanstack/react-query";
```
This component is added to the JSX returned from the `ClientApp()` function:

```ts
  // Other code is missing
  <Hydrate state={__REACT_QUERY_DEHYDRATED_STATE}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Hydrate>
```
Recall that `__REACT_QUERY_DEHYDRATED_STATE` was populated in `server.tsx`.

`QueryClientProvider`, react query's context provider, is added to both the client (`client.ts`) and server (`server.ts`) file. It is imported from `@tanstack/react-query`.


### Tailwind
The popular [`Tailwind`](https://tailwindcss.com/) CSS class collection is supported by the [twind](https://twind.dev) library. `Twin` compiles Tailwind CSS classes into generic CSS on the fly so it is ideal for **Ultra's** streaming server.

Tailwind classes are expressed using the `tw` function. Here is an example how it is used:
```ts
import { tw } from "./twind/twind.ts";
// other code here
  <h2 className={tw(`text-3xl font-bold`)}>
    About this Site
  </h2>
```

Check the [Tailwind docs](https://v2.tailwindcss.com/docs) for details on the available `Tailwind` classes. Support for `Twind` 1.0 was recently added to **Ultra** which is compatible with `Tailwind` version 3.

## Using Suspense
**Ultra** version 2 works with React v18. A big feature of this new React version is suspense. React suspense allows a component to be asynchronously rendered. This means that part of the UI can be displayed while suspended components are still being rendered.

Setting up suspense involves wrapping a component with the `Suspense` component. This is what that looks like:
```ts
// Home.tsx
import { Suspense } from "react";
// other code here...
  <Suspense fallback=
    {<div>Page is Loading...</div>}
  >
    <UserList />
  </Suspense>
```
In this case the `UserList` component is being suspended. Note the `fallback` prop that is used to define a component that will be displayed while the suspended component is still being rendered. Once that is completed, the suspended component will replace the fallback component.

When a `Suspense` component is used in an application page, the page needs to be lazy loaded with a dynamic import:
```ts
// app.tsx
const HomePage = lazy(() => import("./pages/Home.tsx"));
```
## Hono
As noted above **Ultra** uses the [Hono](https://honojs.dev) Deno server under the covers. Hono's Deno server is based on the http server in the Deno standard library. But Hono adds value that can be used in an **Ultra app**. A big one is middleware.

The `createServer` call in `server.tsx` returns a Hono server object in a variable called `server`. Middleware is added with a call to `server.get`. The first argument is a string representing an http path. The second argument is a handler function with a [`Context`](https://honojs.dev/docs/api/context/) first argument and `next` function as the second argument.

The handler function can either return a `Response` or `Promise<Response | undefined | void>` or invoke the `next` function using an `await` since `next` returns a `Promise`. The `next` function passes the request flow onto the next `server.get` located in `server.tsx` (see the definition of `Handler` in `src/types.ts` in the Hono repo and the [Middleware docs](https://honojs.dev/docs/api/middleware/)).

Here is an example of middleware that adds a header to the response called "Server" with a value of "Ultra Hono":

```ts
server.use('*', async (c, next) => {
  c.res.headers.set("Server", "Ultra Hono");
  await next();
});
```

Hono provides a bunch of [built-in middleware functions](https://honojs.dev/docs/builtin-middleware/) including ones for authentication, CORS support and serving static files.

Hono can also be used for server-side routing. If authentication middleware is used, then server-side routing is required.

You can create an API route using Hono too. See the [with-api-routes **Ultra** example](https://github.com/exhibitionist-digital/ultra/tree/main/examples/with-api-routes) to learn how this is done in addition to the [Hono routing docs](https://honojs.dev/docs/api/routing/).

Note that the Hono API supports Node and Cloudfare Workers in addition to Deno. See the [Hono Deno docs](https://honojs.dev/docs/getting-started/deno/) for more details on the Hono Deno server.

## Other Libraries

There are over 20 examples in the **Ultra** repo's [examples folder](https://github.com/exhibitionist-digital/ultra/tree/main/examples). Most of them show how to use React libraries with **Ultra**. They include (besides libs detailed above):
- [Material UI](https://mui.com/): A collection of React components.
- [tRCP](https://trpc.io/): a library for creating type-safe APIs.
- [mdx](https://mdxjs.com): converts markdown into JSX content.
- [emotion](https://emotion.sh/): a CSS-in-JS library.
- [react-helmet](https://github.com/nfl/react-helmet#readme): a component to add an HTML Head element to a JSX page.
- [with-preact](https://preactjs.com/): Preact is a lightweight React port. Note that not all React libraries work with Preact.
- [static HTML](https://github.com/exhibitionist-digital/ultra/tree/main/examples/bogus-marketing-or-blog): See the `examples/bogus-marketing-or-blog` folder. Note the `generateStaticHTML` and `disableHydration` properties added to the `server.render` function call in `server.tsx`
- [island architecture](https://www.patterns.dev/posts/islands-architecture/) - this structures the app where islands of JavaScript-related reactivity are surrounded by static HTML content. It is how Deno Fresh works.

When adapting one of these examples to your application, pay particular attention to changes in `server.tsx`, `client.tsx` and sometimes `build.ts` that allows the example to work with **Ultra**.

## Deployment

There are two main options for deployment an **Ultra** app, using Docker to deploy to cloud hosts that support it like [fly.io](https://fly.io) and [Deno Deploy](https://deno.dev). Instructions are found in the [Ultra deployment docs](https://ultrajs.dev/docs#deploying).

When using Deno Deploy, you need to set `inlineServerDynamicImports: true` as a `createBuilder` option in `build.ts` since Deploy does not support dynamic imports. Also note the [Github Action](https://github.com/cdoremus/ultra2-demo/blob/main/.github/workflows/deploy.yml) needed to use Deno Deploy with **Ultra**.

Production deployment requires that all the images and other assets are wrapped in a `useAsset` hook from **Ultra** like this:
```ts
import useAsset from "ultra/hooks/use-asset.js";
// other code here
  <link rel="shortcut icon" href={useAsset("/favicon.ico")} />
```
The `useAsset` hook is used to version the asset during a production build.

To build and dry-run the app before production deployment, invoke the `build` task locally and then run the `start` task inside the `.ultra` folder.

## Conclusion
**Ultra** is the third most popular Deno web framework next to Fresh and Aleph which are both supported by the Deno team. It is the only one of the three that focusses on React and does a good job at supporting React libraries and modern practices.

**Ultra** evolved dramatically between version 1 and 2 and its development continues to accelerate. When this post was published **Ultra's** current version was v2.1.4, so be aware that there might be some changes at a future date.

At any rate, **Ultra** is a good option for creating React apps because it eliminates the build step with it's headache-inducing configurations therefore allowing you to focus on application development.

Finally, make sure you check out my [**Ultra** demo app repo](https://github.com/cdoremus/ultra2-demo) and the [examples folder in the **Ultra** repo](https://github.com/exhibitionist-digital/ultra/tree/main/examples) for more ideas on how to use **Ultra** to create a Deno/React app.
