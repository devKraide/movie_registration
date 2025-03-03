const knex = require("../database/knex")

class NotesController {
  async create(request, response) {
    const { title, description, tags, rating } = request.body
    const { user_id } = request.params

    if (!title || !description || !tags || !rating) {
      return response.status(400).json({ error: "All fields are required" })
    }

    const user_id_exists = await knex("users").where({ id: user_id }).first()

    if (!user_id_exists) {
      return response.status(404).json({ error: "User not found" })
    }
    
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

    const deleteNotes = await knex("notes")
      .where({ id })
      .del();

    if (deleteNotes === 0) {
      return response.status(404).json({ error: "Note not found" });
    }

    response.json(`Note (id = ${id}) deleted successfully`);
  }

  async index(request, response) {
    const { user_id, title, rating, tags } = request.query

    let notes;

    if (tags && !rating) {
      const filterTags = tags.split(",").map(tag => tag.trim())

      notes = await knex("tags")
        .select([
          "notes.id",
          "notes.title",
          "notes.description",
          "notes.rating"
        ])
        .where("notes.user_id", user_id)
        .whereLike("title", `%${title}%`)
        .whereIn("name", filterTags)
        .distinct()
        .innerJoin("notes", "tags.note_id", "notes.id")
        .orderBy("notes.title")

        console.log(notes)

    } else 
    if (rating && !tags) {
      notes = await knex("notes")
        .select("id", "title", "description", "rating")
        .where({ user_id, rating })
        .whereLike("title", `%${title}%`)
        .distinct()
        .orderBy("title");

    } else 
    if (tags && rating) {
      const filterTags = tags.split(",").map(tag => tag.trim())

      notes = await knex("tags")
        .select([
          "notes.id",
          "notes.title",
          "notes.description",
          "notes.rating"
        ])
        .where("notes.user_id", user_id)
        .whereLike("title", `%${title}%`)
        .whereIn("name", filterTags)
        .distinct()
        .where({ rating })
        .innerJoin("notes", "tags.note_id", "notes.id")
        .orderBy("notes.title")

    } 
    else {
      notes = await knex("notes")
        .select("id", "title", "description", "rating")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({user_id})
    const notesWithTags = notes.map(note => {
      
      const noteTags = userTags.filter(tag => tag.note_id === note.id)
      
      return {
        ...note,
        tags: noteTags.map(tag => {
          return {
          name: tag.name,
          id: tag.id   
          }     
        }) 
      }
      
    })  
       

    response.json(notesWithTags);

  }

}


module.exports = NotesController