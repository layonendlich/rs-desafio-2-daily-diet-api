import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary()
        table.text('username')
        table.text('password')
        table.text('name')
        table.text('avatar')
        table.dateTime('createdAt').defaultTo(knex.fn.now())
        table.dateTime('updatedAt').defaultTo(knex.fn.now())
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

