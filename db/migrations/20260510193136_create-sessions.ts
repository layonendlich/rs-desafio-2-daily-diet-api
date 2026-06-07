import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('sessions', (table) => {
        table.increments('id').primary()
        table.string('key').index()
        table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE')
        table.boolean('isFinished').defaultTo(false)
        table.dateTime('createdAt').defaultTo(knex.fn.now())
        table.dateTime('updatedAt').defaultTo(knex.fn.now())
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('sessions')
}

