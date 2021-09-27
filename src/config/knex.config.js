export default {
  local: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
<<<<<<< HEAD
      database: 'jiinmteg',
      user: 'root',
      password: '_media_',
=======
      port: 3307,
      database: 'datamanager',
      user: 'root',
      password: '1234',
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
      timezone: 'UTC'
    },
    pool: {
      min: 10,
      max: 20
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
<<<<<<< HEAD
      database: 'jiinmteg',
      user: 'root',
      password: '_media_',
=======
      port: 3307,
      database: 'datamanager',
      user: 'root',
      password: '1234',
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
      timezone: 'UTC'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
<<<<<<< HEAD
      database: 'ropmteg',
      user: 'root',
      password: '_media_',
=======
      port: 3307,
      database: 'datamanager',
      user: 'root',
      password: '1234',
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
      timezone: 'UTC'
    },
    pool: {
      min: 10,
      max: 20
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
