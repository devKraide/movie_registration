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
    const { id } = request.params;

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

  async delete(request, response) {
    const { id } = request.params

    await knex("notes")
      .where({ id })
      .del();

    response.json(`Note (id = ${id}) deleted successfully`);
  }

  async index(request, response) {
    const { user_id, title, rating, tags } = request.query

    let notes;

    if (rating) {
      notes = await knex("notes")
        .select("id", "title", "description", "rating")
        .where({ user_id, rating })
        .whereLike("title", `%${title}%`)
        .orderBy("title");

    } else {

      notes = await knex("notes")
        .select("id", "title", "description", "rating")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");

    }

    if (tags) {
      const filterTags = tags.split(",").map(tag => tag.trim())

      notes = notes + await knex("notes")
        .whereIn("name", filterTags)

      response.json(notes)
    } 

    response.json(notes)


  }

}


module.exports = NotesController