import express from 'express'
import Koa from 'koa'
import graphQLHTTP from 'koa-graphql'
import mount from 'koa-mount'
import convert from 'koa-convert'
import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import schema from './data/schema'

const APP_PORT = 3000
const GRAPHQL_PORT = 8080

// Expose a GraphQL endpoint
const graphQLServer = new Koa()

graphQLServer.use(mount('/', convert(graphQLHTTP({
  schema,
  pretty: true,
  graphiql: true,
}))))

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
))

// Serve the Relay app
const compiler = webpack({
  devtool: 'cheap-module-eval-source-map',
  entry: path.resolve(__dirname, 'client', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        test: /\.js$/,
      },
    ],
  },
  output: { filename: 'app.js', path: '/' },
})

const app = new WebpackDevServer(compiler, {
  contentBase: '/public/',
  proxy: { '/graphql': `http://localhost:${GRAPHQL_PORT}` },
  publicPath: '/client/',
  stats: { colors: true },
})

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')))

app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`)
})
