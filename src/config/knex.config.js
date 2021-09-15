export default {
  local: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      database: 'jiinmteg',
      user: 'root',
      password: '_media_',
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
      database: 'jiinmteg',
      user: 'root',
      password: '_media_',
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
      database: 'ropmteg',
      user: 'root',
      password: '_media_',
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
