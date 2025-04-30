import { Container, createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { createTheme, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/charts/styles.css'
import './main.css'

import Home from './routes/index.js'
import Heading from './components/global/Heading/index'
import Layout from './Layout'
import Error from './Error'
import NotFound from './404'
import Visualize from './routes/visualize'
import Archive from './routes/archive'
const theme = createTheme({
  /** Put your mantine theme override here */
})

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    errorElement: <Error />,
    children: [
      { index: true, Component: Home },
      { path: 'visualize', Component: Visualize },
      { path: 'archive', Component: Archive },
      { path: '*', Component: NotFound },
    ],
  },
])

createRoot(document.getElementById('root') as Container).render(
  <MantineProvider theme={theme}>
    <RouterProvider router={router} />
  </MantineProvider>
)
