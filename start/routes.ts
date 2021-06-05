/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('health', 'HealthCheckController.getHealthyReport')
Route.get('full-blockchain', 'BlockchainController.chain')
Route.get('blockchain', 'BlockchainController.paginate')
Route.get('blockchain/hashs', 'BlockchainController.hashs')
Route.get('blocks/:id', 'BlocksController.show')
Route.post('blocks', 'BlocksController.store')
Route.get('address/:address', 'AddressesController.show')
Route.post('miner', 'BlockchainController.miner')
Route.get('sync', 'BlockchainController.sync')

// for tokens
Route.group(() => {
  Route.post('setup', 'BlockchainController.setupToken')
  Route.get('supply', 'BlockchainController.tokenSupply')

  Route.get('full-blockchain', 'BlockchainController.chain')
  Route.get('blockchain', 'BlockchainController.paginate')
  Route.get('blockchain/hashs', 'BlockchainController.hashs')
  Route.get('blocks/:id', 'BlocksController.show')
  Route.post('blocks', 'BlocksController.store')
  Route.get('address/:address', 'AddressesController.show')
  Route.post('miner', 'BlockchainController.miner')
}).prefix('tokens/:token')
