const knex = require("../database/knex")

class NotesController {
  async create(request, response) {
    const { title, description, tags, rating } = request.body
    const { user_id } = request.params

    const [note_id] = await knex("notes").insert({
      title,
      description,
      rating,
      user_id
    })

    if (rating > 5 || rating < 1 || !Number.isInteger(rating)) {
      throw new Error("Rating must be an integer between 1 and 5")
    }

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    await knex("tags").insert(tagsInsert)

    response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const notes = await knex("notes")
      .select("notes.*")
      .where({ id });

    const tag = await knex("tags")
      .select("tags.name")
      .where({ note_id: id })

    response.json({
      ...notes,
      tag
    });
  }
}



module.exports = NotesController